import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="container flex-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
    >
      <div className="login-card result-card" style={{ maxWidth: '400px', width: '100%', margin: 'auto', marginTop: '5rem' }}>
        <h1 style={{ background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Register User
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-color)', opacity: 0.8, marginBottom: '2rem' }}>
          Create a secure account to access the Fake News Video API.
        </p>

        <form onSubmit={handleRegister} className="form-container">
          <input
            type="text"
            className="text-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="text-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
        {success && <div className="error-message" style={{ marginTop: '1rem', borderColor: 'var(--real-color)', color: 'var(--real-color)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>{success}</div>}
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.8 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login here</Link>
        </p>
      </div>
    </motion.div>
  );
}

export default Register;
