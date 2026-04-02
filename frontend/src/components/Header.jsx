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
    <nav className="navbar w-full" style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--input-border)' }}>
      <div className="container mx-auto px-4 py-4 flex items-center w-full" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>FakeNewsAPI</span>
          <Link to="/news-check" style={{ color: 'var(--text-color)', textDecoration: 'none', fontWeight: '500' }}>News</Link>
          <Link to="/video-upload" style={{ color: 'var(--text-color)', textDecoration: 'none', opacity: 0.8 }}>Video</Link>
          <Link to="/image-upload" style={{ color: 'var(--text-color)', textDecoration: 'none', opacity: 0.8 }}>Image</Link>
          <Link to="/audio-upload" style={{ color: 'var(--text-color)', textDecoration: 'none', opacity: 0.8 }}>Audio</Link>
          <button className="theme-toggle" onClick={toggleTheme} style={{ marginLeft: '0.5rem' }}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        
        <button onClick={handleLogout} style={{
          background: 'transparent', color: 'var(--error-color)', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto'
        }}>Logout</button>
      </div>
    </nav>
  );
}

export default Header;
