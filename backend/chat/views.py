from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q, Count, Max
from django.utils import timezone
from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    UserMinialSerializer,
)
from .permissions import IsConversationParticipant


class ConversationViewSet(viewsets.ModelViewSet):
    """API endpoint for managing conversations."""
    permission_classes = [permissions.IsAuthenticated, IsConversationParticipant]

    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        elif self.action == 'create':
            return ConversationCreateSerializer
        return ConversationDetailSerializer

    def get_queryset(self):
        user = self.request.user
        profile = user.profile

        queryset = Conversation.objects.all()

        # Patients can only see their own conversations
        if profile.role == 'patient':
            queryset = queryset.filter(patient=user)
        # Staff can see conversations they're assigned to or unassigned ones
        elif profile.role in ['doctor', 'nurse', 'staff']:
            queryset = queryset.filter(
                Q(staff=user) | Q(staff__isnull=True)
            )
        # Admins can see all

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Search by patient name for staff
        search = self.request.query_params.get('search', None)
        if search and profile.role != 'patient':
            queryset = queryset.filter(
                Q(patient__first_name__icontains=search) |
                Q(patient__last_name__icontains=search) |
                Q(patient__email__icontains=search) |
                Q(patient__username__icontains=search)
            )

        # Annotate with last message time for ordering
        queryset = queryset.annotate(
            last_msg_time=Max('messages__created_at')
        ).order_by('-last_msg_time', '-created_at')

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        profile = user.profile

        # Determine participants
        if profile.role == 'patient':
            staff_id = serializer.validated_data.get('staff_id')
            staff = None
            if staff_id:
                try:
                    staff = User.objects.get(id=staff_id)
                except User.DoesNotExist:
                    pass

            conversation = Conversation.objects.create(
                patient=user,
                staff=staff,
                subject=serializer.validated_data.get('subject', ''),
            )
        else:
            patient_id = serializer.validated_data.get('patient_id')
            patient = User.objects.get(id=patient_id)

            conversation = Conversation.objects.create(
                patient=patient,
                staff=user,
                subject=serializer.validated_data.get('subject', ''),
            )

        # Create the initial message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            body=serializer.validated_data['message'],
            is_delivered=True,
        )
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=['last_message_at'])

        # Return proper conversation detail data
        detail_serializer = ConversationDetailSerializer(
            conversation, context={'request': request}
        )
        headers = self.get_success_headers(detail_serializer.data)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MessageViewSet(viewsets.ModelViewSet):
    """API endpoint for messages within a conversation."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        user = self.request.user

        # Verify user is a participant
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if user.id not in [conversation.patient_id, conversation.staff_id]:
                return Message.objects.none()
        except Conversation.DoesNotExist:
            return Message.objects.none()

        return Message.objects.filter(conversation_id=conversation_id)

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = Conversation.objects.get(id=conversation_id)

        message = Message.objects.create(
            conversation=conversation,
            sender=self.request.user,
            body=serializer.validated_data['body'],
            is_delivered=True,
        )
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=['last_message_at'])
        return message


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count_view(request):
    """Get total unread message count across all conversations."""
    user = request.user
    profile = user.profile

    if profile.role == 'patient':
        conversations = Conversation.objects.filter(patient=user, status='active')
    else:
        conversations = Conversation.objects.filter(
            Q(staff=user) | Q(staff__isnull=True),
            status='active'
        )

    total_unread = 0
    for conv in conversations:
        total_unread += conv.get_unread_count(user)

    return Response({'unread_count': total_unread})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_patients_view(request):
    """Get list of patients for staff to start conversations with."""
    user = request.user
    profile = user.profile

    if profile.role == 'patient':
        return Response({'error': 'Only staff can access this.'}, status=403)

    # Get all patients who don't have an active conversation with this staff
    patients_with_conv = Conversation.objects.filter(
        staff=user
    ).values_list('patient_id', flat=True)

    patients = User.objects.filter(
        profile__role='patient',
        is_active=True,
    ).exclude(
        id__in=patients_with_conv
    ).order_by('first_name', 'last_name')

    return Response(UserMinialSerializer(patients, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_staff_view(request):
    """
    Get list of available staff members for patients to start conversations with.
    Returns active doctors, nurses, admins, and staff.
    Excludes staff that the patient already has an active conversation with.
    """
    user = request.user
    profile = user.profile

    # Only patients can access this endpoint
    if profile.role != 'patient':
        return Response({'error': 'Only patients can access this.'}, status=403)

    # Get staff the patient already has an active conversation with
    staff_with_conv = Conversation.objects.filter(
        patient=user,
        status='active',
    ).exclude(
        staff__isnull=True
    ).values_list('staff_id', flat=True)

    # Return all active staff, excluding those already in active conversations
    available_staff = User.objects.filter(
        profile__role__in=['admin', 'doctor', 'nurse', 'staff'],
        is_active=True,
    ).exclude(
        id__in=list(staff_with_conv)
    ).order_by('first_name', 'last_name')

    return Response(UserMinialSerializer(available_staff, many=True).data)
