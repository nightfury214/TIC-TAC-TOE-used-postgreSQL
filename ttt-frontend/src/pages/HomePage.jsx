// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import axios from './axios';

const HomePage = () => {
  const navigate = useNavigate ();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        navigate('/login');
    }
  }, [navigate]);

  const createRoom = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.post(
        'create-room/',
        {room_id: roomId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Room created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoin = async () => {
    if (!roomId.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(
        'join-room/',
        { room_id: roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Assume API returns something like { status: "joined" or "guest", room_id: "abc123" }
      if (res.data.status === 'joined' || res.data.status === 'guest') {
        navigate(`/play?room_id=${res.data.room_id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join room';
      setError(msg);
    }
  };

  return (
    <div>
      <h2>Join a Room</h2>
      <input
        type="text"
        value={roomId}
        placeholder="Enter Room ID"
        onChange={e => {
          setRoomId(e.target.value);
          setError('');
        }}
      /><br />
      <button onClick={createRoom} disabled={!roomId.trim()}>creat Room</button>
      <button onClick={handleJoin} disabled={!roomId.trim()}>Join</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default HomePage;
