// src/pages/PlayerScorePage.jsx
import React, { useEffect, useState } from 'react';
import axios from './axios';
import { useParams, useNavigate } from 'react-router-dom';

const PlayerScorePage = () => {
  const { player_name } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');

    axios.get(`player/${player_name}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStats(res.data);
    })
    .catch(err => {
      if (err.response?.status === 403) {
        alert("Access denied.");
        navigate('/');
      }
    });
  }, [player_name, navigate]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Scoreboard for {player_name}</h2>
      <ul>
        <li>Games Played: {stats.played}</li>
        <li>Games Won: {stats.won}</li>
        <li>Games Lost: {stats.lost}</li>
      </ul>
    </div>
  );
};

export default PlayerScorePage;
