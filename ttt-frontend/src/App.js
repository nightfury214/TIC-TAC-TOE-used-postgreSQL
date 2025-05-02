import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import DashboardPage from './pages/DashboardPage';
import PlayerScorePage from './pages/PlayerScorePage';

function App() {
  return (
    <Router>
      <Routes >
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/" exact element={<HomePage/>} />
        <Route path="/play" element={<PlayPage/>} />
        <Route path="/dashboard" element={<DashboardPage/>} />
        <Route path="/player/:playerName" element={<PlayerScorePage/>} />
      </Routes >
    </Router>
  );
}

export default App;
