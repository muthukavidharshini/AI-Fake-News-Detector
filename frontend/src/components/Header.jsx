import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ theme, toggleTheme }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1rem 2rem', 
      backgroundColor: 'var(--card-bg)',
      borderBottom: '1px solid var(--input-border)'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>FakeNewsAPI</span>
        <Link to="/news-check" style={{ color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>News Checker</Link>
        <Link to="/video-upload" style={{ color: 'var(--text-color)', textDecoration: 'none', opacity: 0.8 }}>Video Transcriber</Link>
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
  );
}

export default Header;
