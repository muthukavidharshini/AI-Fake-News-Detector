import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard({ history, setHistory }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fakeNewsHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [setHistory]);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach backend.');
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        const newHistory = [{
            id: Date.now(),
            textPreview: text.length > 50 ? text.substring(0, 50) + "..." : text,
            prediction: data.prediction,
            confidence: data.confidence
        }, ...history];
        
        setHistory(newHistory);
        localStorage.setItem('fakeNewsHistory', JSON.stringify(newHistory));
      }
    } catch (err) {
      setError('Error connecting to the API. Make sure http://127.0.0.1:5000 is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="header">
        <div className="header-top">
          <h1>News Analyzer</h1>
        </div>
        <p>AI-powered fake news analysis using Robust Machine Learning.</p>
      </header>
      
      <main className="main-content">
        <form onSubmit={handleSubmit} className="form-container">
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste news article content here or use Voice Input..."
            rows="8"
          ></textarea>
          
          <div className="button-group">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button" 
              className={`voice-btn ${isRecording ? 'recording' : ''}`} 
              onClick={startRecording}
            >
              {isRecording ? '🎙️ Listening...' : '🎙️ Voice Input'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="loading-pulse"
              style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--primary-color)' }}
            >
              Scanning vast data networks...
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={`result-card ${result.prediction === 'Fake' ? 'fake' : 'real'}`}
            >
              <h2>Prediction: {result.prediction}</h2>
              <p className="confidence-text">
                <motion.strong 
                  initial={{ width: 0 }} 
                  animate={{ width: `${result.confidence}%` }}
                >
                  Confidence: {result.confidence.toFixed(2)}%
                </motion.strong>
              </p>
              {result.explanation && (
                <div className="explanation">
                  <strong>Explanation:</strong>
                  <p>{result.explanation}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {history.length > 0 && (
        <section className="history-section">
          <h3>History log ({history.length} scans)</h3>
          <div className="history-list">
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`history-card ${item.prediction === 'Fake' ? 'border-fake' : 'border-real'}`}
                >
                  <div className="history-info">
                    <span className={`label ${item.prediction === 'Fake' ? 'text-fake' : 'text-real'}`}>{item.prediction}</span>
                    <span className="confidence-label"> ({item.confidence.toFixed(2)}%)</span>
                  </div>
                  <p className="history-text">"{item.textPreview}"</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default Dashboard;
