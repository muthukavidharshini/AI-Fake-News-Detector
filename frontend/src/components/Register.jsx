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
      console.error("Register Fetch Error: ", err);
      if (err.message === "Failed to fetch") {
        setError("Network error: Cannot connect to the server. Is the backend running?");
      } else {
        setError(err.message || 'Error connecting to the API');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div 
        className="result-card"
        style={{ width: '100%', maxWidth: '400px', margin: '0 auto', marginTop: 0 }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Register User
          </h1>
          <p style={{ color: 'var(--text-color)', opacity: 0.7, fontSize: '0.95rem' }}>
            Create a secure account to access your dashboard
          </p>
        </div>

        <form onSubmit={handleRegister} className="form-container">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Full Name</label>
            <input
              type="text"
              className="text-input"
              placeholder="Your Full Name"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Email / Username</label>
            <input
              type="text"
              className="text-input"
              placeholder="Email or Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              className="text-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}>Confirm Password</label>
            <input
              type="password"
              className="text-input"
              placeholder="Confirm Password"
            />
          </div>
            
          <button 
            type="submit" 
            className="submit-btn" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="error-message"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="error-message"
            style={{ borderColor: 'var(--real-color)', color: 'var(--real-color)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
          >
            {success}
          </motion.div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--text-color)', textDecoration: 'none', opacity: 0.8 }}>
            Already have an account? <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
