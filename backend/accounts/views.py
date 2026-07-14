from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from audit_logs.models import log_activity
from .models import UserProfile, EmailVerification
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    LoginSerializer, ChangePasswordSerializer, UserListSerializer,
    UserProfileSerializer, PatientRegisterSerializer,
    RegisterStep1Serializer, VerifyOTPSerializer, ResendOTPSerializer,
    PatientProfileSerializer,
    PatientProfileUpdateSerializer,
)
from .permissions import CanManageUsers, IsOwnerOrAdmin, IsPatient
from .services import (
    create_pending_registration,
    verify_registration_otp,
    resend_verification_otp,
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_step1_view(request):
    """
    Registration Step 1: Validate user data and send OTP email.
    Does NOT create the User account yet.
    """
    serializer = RegisterStep1Serializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        verification = create_pending_registration(
            validated_data=serializer.validated_data,
            request=request,
        )
        return Response({
            'message': 'OTP sent to your email address.',
            'email': verification.email,
            'expires_in': 5,  # minutes
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to send OTP. Please try again. Details: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp_view(request):
    """
    Registration Step 2: Verify OTP and create the user account.
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    result = verify_registration_otp(
        email=serializer.validated_data['email'],
        otp=serializer.validated_data['otp'],
        request=request,
    )
    
    if not result['success']:
        return Response(
            {'error': result['error']},
            status=result.get('status', status.HTTP_400_BAD_REQUEST)
        )
    
    return Response({
        'token': result['token'],
        'user': result['user'],
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_otp_view(request):
    """
    Resend OTP with 60-second cooldown.
    """
    serializer = ResendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    result = resend_verification_otp(
        email=serializer.validated_data['email'],
        request=request,
    )
    
    if not result['success']:
        return Response(
            {'error': result['error']},
            status=result.get('status', status.HTTP_400_BAD_REQUEST)
        )
    
    return Response({
        'message': result['message'],
        'expires_in': 5,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Authenticate user and return token with user data."""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'error': 'Account is disabled'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    token, created = Token.objects.get_or_create(user=user)
    
    # Log login activity
    log_activity(
        user=user,
        action='login',
        module='auth',
        description=f"User {user.username} logged in",
        request=request,
    )
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
def logout_view(request):
    """Logout user by deleting their auth token."""
    # Log logout activity before deleting token
    log_activity(
        user=request.user,
        action='logout',
        module='auth',
        description=f"User {request.user.username} logged out",
        request=request,
    )
    
    try:
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        pass
    return Response({'message': 'Logged out successfully'})


@api_view(['GET', 'PUT', 'PATCH'])
def profile_view(request):
    """Get or update the current user's profile."""
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    
    # PUT/PATCH - partial update allowed
    serializer = UserUpdateSerializer(
        request.user, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(request.user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def change_password_view(request):
    """Change the current user's password."""
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if not request.user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'old_password': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()
    
    # Invalidate existing token so user must log in again
    try:
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        pass
    
    return Response({'message': 'Password changed successfully. Please login again.'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Public registration endpoint.
    This creates a Patient account only.
    Staff accounts (Admin, Doctor, Nurse, Staff) can only be created by an Administrator.
    """
    serializer = PatientRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.save()
    
    # Log registration activity
    log_activity(
        user=user,
        action='create',
        module='auth',
        description=f"New user {user.username} registered",
        request=request,
    )
    
    # Auto-login: return token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def patient_profile_view(request):
    """
    Get or update the patient's own profile with all fields.
    Accessible by all authenticated users (non-patients get a simplified response).
    """
    user = request.user
    profile = user.profile
    
    if request.method == 'GET':
        # Return flattened patient profile
        return Response(PatientProfileSerializer(profile).data)
    
    # PUT/PATCH - only patients can update their profile
    if profile.role != 'patient':
        return Response(
            {'error': 'Only patients can update their profile.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = PatientProfileUpdateSerializer(
        user,
        data=request.data,
        partial=True,
        context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        
        # Log profile completion activity
        if profile.is_profile_complete():
            log_activity(
                user=user,
                action='update',
                module='auth',
                description=f"Patient {user.username} completed their profile",
                request=request,
            )
        
        # Return updated flattened profile
        profile.refresh_from_db()
        return Response(PatientProfileSerializer(profile).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListCreateView(generics.ListCreateAPIView):
    """List all users or create a new user."""
    
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username', 'is_active']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), CanManageUsers()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(profile__role=role)
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), CanManageUsers()]
        return [permissions.IsAuthenticated()]
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
