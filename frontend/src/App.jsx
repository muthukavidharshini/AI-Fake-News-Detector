import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Presentation from './components/Presentation';
import './App.css';

function MainApp() {
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('dark');
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Boot redirect logic
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location, navigate]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <>
      {!isLoginPage && (
        <nav className="navbar" style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '1rem 2rem', 
          backgroundColor: 'var(--card-bg)',
          borderBottom: '1px solid var(--input-border)'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>DetectorOS</span>
            <Link to="/dashboard" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/analytics" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Analytics</Link>
            <Link to="/presentation" style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Presentation</Link>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button onClick={handleLogout} style={{
              background: 'transparent', color: 'var(--error-color)', border: 'none', cursor: 'pointer', fontWeight: 'bold'
            }}>Logout</button>
          </div>
        </nav>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard history={history} setHistory={setHistory} />} />
          <Route path="/analytics" element={<Analytics history={history} />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="*" element={<Dashboard history={history} setHistory={setHistory} />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
