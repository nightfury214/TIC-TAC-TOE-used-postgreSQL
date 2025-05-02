from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, generics
from rest_framework.response import Response
from .serializers import UserSerializer, GameResultSerializer, RoomSerializer
from .models import Room
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from .models import GameResult, CustomUser
from .permissions import IsOwnerUser
# from django.contrib.auth.models import User
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.http import JsonResponse
import string, random

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class LoginView(generics.GenericAPIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

def generate_unique_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        if not Room.objects.filter(code=code).exists():
            return code

class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        room_id = request.data.get("room_id")

        # Generate a random code for the room (e.g. 6 uppercase letters)
        code = ''.join(random.choices(string.ascii_uppercase, k=6))

        room = Room.objects.create(
            host=user,
            room_id=room_id,
            player1=user,  # ✅ This is the fix
            code=code
        )

        return Response({
            "message": f"Room created with code {room.code}",
            "room_id": room.id
        })

class JoinRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        room_id = request.data.get("room_id")
        print("rom_id", room_id);
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({'error': 'Invalid room ID'}, status=400)

        if room.is_full():
            # Logic to join as guest
            return Response({'status': 'guest', 'room_id': room_id})
        else:
            # Add user to room
            room.add_user(request.user)
            return Response({'status': 'joined', 'room_id': room_id})
        
class RoomStatusView(APIView):
    def get(self, request, room_code, format=None):
        try:
            room = Room.objects.get(code=room_code)
            serializer = RoomSerializer(room)
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response({'detail': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
@api_view(['GET'])
@permission_classes([IsAdminUser])
class GameResultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        query = request.query_params.get('search', '')
        sort = request.query_params.get('sort', '-played_at')  # default to recent first

        game_results = GameResult.objects.select_related(
            'player1', 'player2', 'winner', 'room'
        ).filter(
            Q(player1__username__icontains=query) |
            Q(player2__username__icontains=query) |
            Q(room__id__icontains=query)
        ).order_by(sort)

        paginator = GameResultPagination()
        paginated_qs = paginator.paginate_queryset(game_results, request)
        serializer = GameResultSerializer(paginated_qs, many=True)

        return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsOwnerUser])
def player_score(request, username):
    user = CustomUser.objects.get(username=username)

    played = GameResult.objects.filter(player1=user).count() + GameResult.objects.filter(player2=user).count()
    won = GameResult.objects.filter(winner=user).count()
    lost = played - won

    return Response({
        'played': played,
        'won': won,
        'lost': lost,
    })

def check_username(request):
    username = request.GET.get('username')
    exists = CustomUser.objects.filter(username=username).exists()
    return JsonResponse({'isAvailable': not exists})


class GameHistoryView(APIView):
    def get(self, request, format=None):
        games = GameResult.objects.all().order_by('-played_at')  # Get all games, ordered by the latest
        serializer = GameResultSerializer(games, many=True)
        return Response(serializer.data)
    

class SaveGameResultView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can save game results

    def post(self, request, *args, **kwargs):
        """
        Endpoint to save the result of a game.
        Expects player1, player2, winner, and status in the request body.
        """
        # Deserialize the input data
        serializer = GameResultSerializer(data=request.data)

        if serializer.is_valid():
            game = serializer.save()  # Save the game result to the database

            # Return success response with game details
            return Response({
                'message': 'Game result saved successfully.',
                'game': serializer.data
            }, status=status.HTTP_201_CREATED)

        # If the data is invalid, return a bad request response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)