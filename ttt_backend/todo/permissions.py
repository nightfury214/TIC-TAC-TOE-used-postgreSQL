# permissions.py
from rest_framework.permissions import BasePermission

class IsOwnerUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and view.kwargs.get('username') == request.user.username
