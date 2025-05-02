# urls.py
from django.urls import path
from .views import RegisterView, JoinRoomView, player_score, DashboardView, check_username, CreateRoomView, RoomStatusView, GameHistoryView, SaveGameResultView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('create-room/', CreateRoomView.as_view(), name='create-room'),
    path('join-room/', JoinRoomView.as_view(), name='join-room'),
    path('player/<str:username>/', player_score),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('check-username', check_username),
    path('room-status/<str:room_code>/', RoomStatusView.as_view(), name='room_status'),
    path('game-history/', GameHistoryView.as_view(), name='game_history'),
    path('save-result/', SaveGameResultView.as_view(), name='save_game_result'),

]
