from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import User, AnonymousUser
from rest_framework.authtoken.models import Token


@database_sync_to_async
def get_user_from_token(token_key):
    """Authenticate a user via DRF TokenAuthentication."""
    try:
        token = Token.objects.select_related('user').get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None


class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom WebSocket authentication middleware that reads a token
    from the query string (?token=...) and authenticates the user.

    This is needed because the React frontend uses DRF TokenAuthentication,
    not session cookies. The standard AuthMiddlewareStack only inspects
    session cookies, so we replace it with this middleware.

    Always sets scope['user'] — either to the authenticated user or to
    AnonymousUser — to prevent KeyError in consumers.
    """

    async def __call__(self, scope, receive, send):
        # Parse token from query string
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token_key = query_params.get('token', [None])[0]

        if token_key:
            user = await get_user_from_token(token_key)
            if user is not None:
                scope['user'] = user
            else:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
