from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GameResult, CustomUser, Room

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class GameResultSerializer(serializers.ModelSerializer):
    player1_full_name = serializers.SerializerMethodField()
    player2_full_name = serializers.SerializerMethodField()
    winner_full_name = serializers.SerializerMethodField()
    room_id = serializers.CharField(source='room.id')

    class Meta:
        model = GameResult
        fields = [
            'player1_full_name',
            'player2_full_name',
            'winner_full_name',
            'room_id',
            'played_at'
        ]

    def get_player1_full_name(self, obj):
        return obj.player1.get_full_name() or obj.player1.username

    def get_player2_full_name(self, obj):
        return obj.player2.get_full_name() or obj.player2.username

    def get_winner_full_name(self, obj):
        return obj.winner.get_full_name() if obj.winner else "Draw"
    

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'code', 'host', 'created_at']
        read_only_fields = ['host']