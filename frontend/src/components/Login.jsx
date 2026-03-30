import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login logic
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use admin/admin');
    }
  };

  return (
    <motion.div 
      className="container flex-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="login-card result-card">
        <h1 style={{ background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Fake News Detector Admin
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-color)', opacity: 0.8, marginBottom: '2rem' }}>
          Please authenticate to access the analysis dashboard.
        </p>

        <form onSubmit={handleLogin} className="form-container">
          <input
            type="text"
            className="text-input"
            placeholder="Username (admin)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="text-input"
            placeholder="Password (admin)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '1rem' }}>
            Login Securely
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </motion.div>
  );
}

export default Login;
