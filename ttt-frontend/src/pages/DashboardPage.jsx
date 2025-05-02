// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import axios from './axios';

const DashboardPage = () => {
  const [games, setGames] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('played_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return (window.location.href = '/login');
    axios.get(`dashboard/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setGames(res.data);
      setFiltered(res.data);
    }).catch(err => {
      if (err.response?.status === 403) {
        alert("Access denied: Admins only");
        window.location.href = '/';
      }
    });
  }, []);

  useEffect(() => {
    let filteredData = games.filter(game =>
      `${game.player1_fullname} ${game.player2_fullname} ${game.room_id}`.toLowerCase().includes(search.toLowerCase())
    );

    if (sortField) {
      filteredData.sort((a, b) => {
        if (sortOrder === 'asc') return a[sortField] > b[sortField] ? 1 : -1;
        if (sortOrder === 'desc') return a[sortField] < b[sortField] ? 1 : -1;
        return 0;
      });
    }

    setFiltered(filteredData);
    setCurrentPage(1);
  }, [search, sortField, sortOrder, games]);

  const exportCSV = () => {
    const header = "Player1,Player2,Winner,Room ID,Played At\n";
    const rows = games.map(g =>
      `${g.player1_fullname},${g.player2_fullname},${g.winner_fullname},${g.room_id},${g.played_at}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_results.csv";
    a.click();
  };

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : (prev === 'desc' ? null : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <input
        placeholder="Search by name or room id"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button onClick={exportCSV}>Export</button>
      <table border="1" cellPadding={6}>
        <thead>
          <tr>
            {['player1_fullname', 'player2_fullname', 'winner_fullname', 'room_id', 'played_at'].map(col => (
              <th key={col} onClick={() => toggleSort(col)}>
                {col.replace(/_/g, ' ').toUpperCase()} {sortField === col ? (sortOrder || '-') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((g, idx) => (
            <tr key={idx}>
              <td>{g.player1_fullname}</td>
              <td>{g.player2_fullname}</td>
              <td>{g.winner_fullname}</td>
              <td>{g.room_id}</td>
              <td>{new Date(g.played_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        Page: {currentPage} / {totalPages}
        <div>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
