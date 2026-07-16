from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

from .models import ChatbotConversation, ChatbotMessage
from .serializers import (
    ChatbotConversationListSerializer,
    ChatbotConversationDetailSerializer,
    ChatbotMessageCreateSerializer,
    ChatbotMessageSerializer,
)
from .knowledge_base import get_response


def _get_session_key(request):
    """Get or create a session-based identifier for anonymous users."""
    if request.user.is_authenticated:
        return f"user_{request.user.id}"
    # Use Django session key for anonymous users
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def chat_send(request):
    """
    Send a message to the chatbot and receive an AI response.
    Accepts both authenticated and anonymous requests.
    """
    serializer = ChatbotMessageCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    message = serializer.validated_data['message']
    conversation_id = serializer.validated_data.get('conversation_id')
    session_key = _get_session_key(request)

    # Get or create conversation
    if conversation_id:
        try:
            conversation = ChatbotConversation.objects.get(id=conversation_id)
            # Verify ownership
            if request.user.is_authenticated:
                if conversation.user and conversation.user != request.user:
                    return Response(
                        {'error': 'Conversation not found.'},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            elif conversation.session_key != session_key:
                return Response(
                    {'error': 'Conversation not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except ChatbotConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
    else:
        # Create new conversation
        conversation = ChatbotConversation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_key=session_key,
        )

    # Save user message
    user_msg = ChatbotMessage.objects.create(
        conversation=conversation,
        role='user',
        content=message,
    )

    # Build conversation history for context
    history = list(
        conversation.messages.values('role', 'content')
    )

    # Get AI response from knowledge base
    result = get_response(message, conversation_history=history)

    # Save assistant response
    assistant_msg = ChatbotMessage.objects.create(
        conversation=conversation,
        role='assistant',
        content=result['response'],
        metadata={'should_contact_staff': result['should_contact_staff']},
    )

    # Update conversation timestamp
    conversation.save(update_fields=['updated_at'])

    return Response({
        'conversation_id': conversation.id,
        'user_message': ChatbotMessageSerializer(user_msg).data,
        'assistant_message': ChatbotMessageSerializer(assistant_msg).data,
        'should_contact_staff': result['should_contact_staff'],
    })


@api_view(['GET'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def chat_history(request):
    """
    Get chatbot conversation history for the current user/session.
    """
    session_key = _get_session_key(request)

    conversations = ChatbotConversation.objects.filter(
        session_key=session_key
    )
    if request.user.is_authenticated:
        conversations |= ChatbotConversation.objects.filter(
            user=request.user
        )

    conversations = conversations.distinct().order_by('-updated_at')

    serializer = ChatbotConversationListSerializer(
        conversations, many=True, context={'request': request}
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def chat_conversation_detail(request, conversation_id):
    """Get full message history for a specific conversation."""
    session_key = _get_session_key(request)

    try:
        conversation = ChatbotConversation.objects.get(id=conversation_id)
    except ChatbotConversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Verify ownership
    if request.user.is_authenticated:
        if conversation.user and conversation.user != request.user:
            return Response(
                {'error': 'Conversation not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
    elif conversation.session_key != session_key:
        return Response(
            {'error': 'Conversation not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ChatbotConversationDetailSerializer(conversation)
    return Response(serializer.data)
