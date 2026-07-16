import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Conversation, Message, MessageReadStatus


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat.
    Handles: messaging, typing indicators, read receipts, delivery status.
    """

    async def connect(self):
        self.user = self.scope['user']
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # User joins their personal notification group
        self.user_group = f'user_{self.user.id}'
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )

        # Also join a staff-wide group if user is staff
        profile = await database_sync_to_async(lambda: self.user.profile)()
        if profile.role in ['admin', 'doctor', 'nurse', 'staff']:
            self.staff_group = 'staff_notifications'
            await self.channel_layer.group_add(
                self.staff_group,
                self.channel_name
            )
        else:
            self.staff_group = None

        await self.accept()

        # Send online status to relevant conversations
        await self.update_online_status(True)

    async def disconnect(self, close_code):
        # Update online status
        await self.update_online_status(False)

        # Leave groups
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )
        if hasattr(self, 'staff_group') and self.staff_group:
            await self.channel_layer.group_discard(
                self.staff_group,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type', '')

        if msg_type == 'message':
            await self.handle_message(data)
        elif msg_type == 'typing':
            await self.handle_typing(data)
        elif msg_type == 'read':
            await self.handle_read(data)
        elif msg_type == 'conversation_join':
            await self.handle_conversation_join(data)

    async def handle_message(self, data):
        """Handle an incoming chat message."""
        conversation_id = data.get('conversation_id')
        body = data.get('body', '').strip()

        if not body or not conversation_id:
            return

        # Validate conversation access and create message
        result = await self.create_message(conversation_id, body)
        if not result:
            return

        message = result['message']
        sender_data = result['sender_data']
        conversation = result['conversation']

        # Determine message group (the other participant's personal group)
        other_user_id = conversation['patient_id'] if self.user.id != conversation['patient_id'] else conversation['staff_id']

        # Send to the conversation participants
        # First, send to the sender (echo)
        await self.channel_layer.group_send(
            self.user_group,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_data,
                'conversation_id': conversation_id,
            }
        )

        # Send to the other participant
        if other_user_id:
            other_group = f'user_{other_user_id}'
            await self.channel_layer.group_send(
                other_group,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender_data,
                    'conversation_id': conversation_id,
                }
            )

            # Also send notification to staff group if receiver is staff
            receiver = await database_sync_to_async(User.objects.get)(id=other_user_id)
            receiver_profile = await database_sync_to_async(lambda: receiver.profile)()
            if receiver_profile.role in ['admin', 'doctor', 'nurse', 'staff']:
                await self.channel_layer.group_send(
                    'staff_notifications',
                    {
                        'type': 'staff_notification',
                        'message': message,
                        'sender': sender_data,
                        'conversation_id': conversation_id,
                    }
                )

    async def chat_message(self, event):
        """Send a message to the WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
            'sender': event['sender'],
            'conversation_id': event['conversation_id'],
        }))

    async def staff_notification(self, event):
        """Send a notification to staff about a new patient message."""
        await self.send(text_data=json.dumps({
            'type': 'staff_notification',
            'message': event['message'],
            'sender': event['sender'],
            'conversation_id': event['conversation_id'],
        }))

    async def handle_typing(self, data):
        """Handle typing indicator."""
        conversation_id = data.get('conversation_id')
        is_typing = data.get('is_typing', False)

        conversation = await self.get_conversation(conversation_id)
        if not conversation:
            return

        other_user_id = conversation.patient_id if self.user.id != conversation.patient_id else conversation.staff_id
        if not other_user_id:
            return

        other_group = f'user_{other_user_id}'
        await self.channel_layer.group_send(
            other_group,
            {
                'type': 'typing_indicator',
                'conversation_id': conversation_id,
                'user_id': self.user.id,
                'is_typing': is_typing,
            }
        )

    async def typing_indicator(self, event):
        """Forward typing indicator to WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'conversation_id': event['conversation_id'],
            'user_id': event['user_id'],
            'is_typing': event['is_typing'],
        }))

    async def handle_read(self, data):
        """Handle read receipts."""
        conversation_id = data.get('conversation_id')
        message_ids = data.get('message_ids', [])

        if not conversation_id or not message_ids:
            return

        await self.mark_messages_read(conversation_id, message_ids)

        # Notify the other participant
        conversation = await self.get_conversation(conversation_id)
        if conversation:
            other_user_id = conversation.patient_id if self.user.id != conversation.patient_id else conversation.staff_id
            if other_user_id:
                other_group = f'user_{other_user_id}'
                await self.channel_layer.group_send(
                    other_group,
                    {
                        'type': 'read_receipt',
                        'conversation_id': conversation_id,
                        'message_ids': message_ids,
                        'read_by': self.user.id,
                    }
                )

    async def read_receipt(self, event):
        """Forward read receipt to WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'conversation_id': event['conversation_id'],
            'message_ids': event['message_ids'],
            'read_by': event['read_by'],
        }))

    async def handle_conversation_join(self, data):
        """Handle when a user opens a conversation view."""
        conversation_id = data.get('conversation_id')

        conversation = await self.get_conversation(conversation_id)
        if not conversation:
            return

        # Verify user is a participant
        if self.user.id not in [conversation.patient_id, conversation.staff_id]:
            return

        # Mark all unread messages as read
        unread_messages = await self.get_unread_messages(conversation_id)
        if unread_messages:
            await self.mark_messages_read(conversation_id, [m.id for m in unread_messages])

            # Notify sender that messages were read
            other_user_id = conversation.patient_id if self.user.id != conversation.patient_id else conversation.staff_id
            if other_user_id:
                other_group = f'user_{other_user_id}'
                await self.channel_layer.group_send(
                    other_group,
                    {
                        'type': 'read_receipt',
                        'conversation_id': conversation_id,
                        'message_ids': [m.id for m in unread_messages],
                        'read_by': self.user.id,
                    }
                )

    @database_sync_to_async
    def create_message(self, conversation_id, body):
        """Create a new message in the database."""
        try:
            conversation = Conversation.objects.get(id=conversation_id)

            # Verify user is a participant
            if self.user.id not in [conversation.patient_id, conversation.staff_id]:
                return None

            # Create message
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                body=body,
                is_delivered=True,
            )

            # Update conversation
            conversation.last_message_at = timezone.now()
            conversation.save()

            return {
                'message': {
                    'id': message.id,
                    'conversation': conversation.id,
                    'body': message.body,
                    'is_delivered': True,
                    'is_read': False,
                    'sender_id': self.user.id,
                    'created_at': message.created_at.isoformat(),
                },
                'sender_data': {
                    'id': self.user.id,
                    'full_name': self.user.get_full_name() or self.user.username,
                    'role': self.user.profile.role,
                },
                'conversation': {
                    'id': conversation.id,
                    'patient_id': conversation.patient_id,
                    'staff_id': conversation.staff_id,
                    'last_message_at': message.created_at.isoformat(),
                },
            }
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        """Get conversation by ID."""
        try:
            return Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def get_unread_messages(self, conversation_id):
        """Get all unread messages in a conversation for the current user."""
        return list(Message.objects.filter(
            conversation_id=conversation_id,
        ).exclude(
            sender=self.user
        ).exclude(
            read_statuses__reader=self.user
        ))

    @database_sync_to_async
    def mark_messages_read(self, conversation_id, message_ids):
        """Mark messages as read and create read statuses."""
        messages = Message.objects.filter(
            id__in=message_ids,
            conversation_id=conversation_id,
        ).exclude(sender=self.user)

        for message in messages:
            MessageReadStatus.objects.get_or_create(
                message=message,
                reader=self.user,
            )
            message.is_read = True
            message.save(update_fields=['is_read'])

    @database_sync_to_async
    def update_online_status(self, is_online):
        """Update user's online status (using last_login as proxy)."""
        if is_online:
            # Touch last_login to indicate online
            user = User.objects.get(id=self.user.id)
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
