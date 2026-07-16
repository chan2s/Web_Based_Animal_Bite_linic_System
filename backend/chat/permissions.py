from rest_framework import permissions


class IsConversationParticipant(permissions.BasePermission):
    """
    Custom permission: user can only access conversations they're a participant in.
    Patients can only see their own conversations.
    Staff can see conversations they're assigned to.
    Admins can see all conversations.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = user.profile

        # Admin can see all
        if profile.role == 'admin':
            return True

        # Staff assigned to this conversation
        if profile.role in ['doctor', 'nurse', 'staff']:
            return obj.staff == user

        # Patient - only their own conversations
        if profile.role == 'patient':
            return obj.patient == user

        return False


class CanStartConversation(permissions.BasePermission):
    """
    Permission to start a new conversation:
    - Patients can always start a conversation (to contact staff)
    - Staff cannot start conversations with other staff
    - Staff can start conversations with patients (e.g., outreach)
    """

    def has_permission(self, request, view):
        user = request.user
        profile = user.profile

        # Any authenticated user can start a conversation
        return True


class IsMessageSender(permissions.BasePermission):
    """
    Permission to edit/delete a message: only the original sender.
    """

    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user
