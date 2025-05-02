from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    score = models.IntegerField(default=0)

class Room(models.Model):
    room_id = models.CharField(max_length=100, unique=True)
    player1 = models.ForeignKey(CustomUser, related_name='player1_room', on_delete=models.CASCADE)
    player2 = models.ForeignKey(CustomUser, related_name='player2_room', on_delete=models.CASCADE, null=True, blank=True)
    game_state = models.JSONField(default=dict)  # Store game state as JSON
    max_players = models.IntegerField(default=2)
    is_full = models.BooleanField(default=False)
    code = models.CharField(max_length=12)  
    host = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class GameHistory(models.Model):
    player1 = models.ForeignKey(CustomUser, related_name='player1_games', on_delete=models.CASCADE)
    player2 = models.ForeignKey(CustomUser, related_name='player2_games', on_delete=models.CASCADE)
    winner = models.ForeignKey(CustomUser, related_name='won_games', on_delete=models.CASCADE)
    room_id = models.CharField(max_length=100)
    played_date = models.DateTimeField(auto_now_add=True)


class GameResult(models.Model):
    player1 = models.ForeignKey(CustomUser, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(CustomUser, related_name='games_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(CustomUser, related_name='games_won', null=True, blank=True, on_delete=models.SET_NULL)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    played_at = models.DateTimeField(auto_now_add=True)


