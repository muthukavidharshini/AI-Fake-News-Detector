import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Register from './components/Register';
import Login from './components/Login';
import VideoUpload from './components/VideoUpload';
import Header from './components/Header';
import NewsInput from './components/NewsInput';
import './App.css';

function MainApp() {
  const [theme, setTheme] = useState('dark');
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Boot redirect logic
  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      navigate('/login');
    }
  }, [location, navigate, isAuthenticated, isAuthPage]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <>
      {!isAuthPage && <Header theme={theme} toggleTheme={toggleTheme} />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/video-upload" 
            element={isAuthenticated ? <VideoUpload /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/news-check" 
            element={isAuthenticated ? <NewsInput /> : <Navigate to="/login" />} 
          />
          
          <Route path="*" element={<Navigate to={isAuthenticated ? "/news-check" : "/login"} />} />
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
