// src/pages/PlayPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const initialBoard = Array(9).fill(null);

const PlayPage = () => {
  const [board, setBoard] = useState(initialBoard);
  const [playerCount, setPlayerCount] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigateNav = useNavigate ();

  const roomId = new URLSearchParams(location.search).get("room_id");

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        navigateNav('/login');
    }

    fetchRoomStatus();
    fetchGameHistory();

    const interval = setInterval(fetchGameHistory, 5000); // polling
    return () => clearInterval(interval);
  }, []);

  const fetchRoomStatus = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get(`room-status/${roomId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPlayerCount(res.data.player_count);
  };

  const fetchGameHistory = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get(`game-history/${roomId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setHistory(res.data);
  };

  const checkWinner = (b) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,b1,c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return b[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (winner || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = currentPlayer;
    setBoard(newBoard);
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
      saveGameResult(win);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const saveGameResult = async (win) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`save-result/`, {
      room_id: roomId,
      winner: win
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchGameHistory(); // update table
  };

  const forceResult = async (type) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`http://localhost:8000/api/force-result/`, {
      room_id: roomId,
      type: type
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchGameHistory();
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      {playerCount < 2 ? (
        <p>Waiting for another player...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: 5 }}>
            {board.map((val, i) => (
              <button key={i} onClick={() => handleClick(i)} style={{ height: 100, fontSize: 24 }}>
                {val}
              </button>
            ))}
          </div>
          {winner && (
            <>
              <h3>Winner: {winner}</h3>
              <button onClick={() => navigateNav('/dashboard')}>Go to Dashboard</button>
            </>
          )}
          <div>
            <button onClick={() => forceResult('win')}>Win me</button>
            <button onClick={() => forceResult('lose')}>Lose me</button>
          </div>
        </>
      )}

      <h3>Game History</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Player 1</th>
            <th>Player 2</th>
            <th>Winner</th>
            <th>Played At</th>
          </tr>
        </thead>
        <tbody>
          {history.map((g, idx) => (
            <tr key={idx}>
              <td>{g.player1}</td>
              <td>{g.player2}</td>
              <td>{g.winner}</td>
              <td>{new Date(g.played_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayPage;
