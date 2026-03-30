import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Add to history
        setHistory(prev => [{
            id: Date.now(),
            textPreview: text.length > 50 ? text.substring(0, 50) + "..." : text,
            prediction: data.prediction,
            confidence: data.confidence
        }, ...prev]);
      }
    } catch (err) {
      setError('Error connecting to the API. Make sure http://127.0.0.1:5000 is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <h1>Fake News Detector</h1>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <p>AI-powered fake news analysis using PassiveAggressiveClassifier.</p>
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
            <button 
              type="button" 
              className={`voice-btn ${isRecording ? 'recording' : ''}`} 
              onClick={startRecording}
            >
              {isRecording ? '🎙️ Listening...' : '🎙️ Voice Input'}
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className={`result-card ${result.prediction === 'Fake' ? 'fake' : 'real'}`}>
            <h2>Prediction: {result.prediction}</h2>
            <p className="confidence-text"><strong>Confidence:</strong> {result.confidence.toFixed(2)}%</p>
            {result.explanation ? (
              <div className="explanation">
                <strong>Explanation:</strong>
                <p>{result.explanation}</p>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {history.length > 0 && (
        <section className="history-section">
          <h3>History</h3>
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className={`history-card ${item.prediction === 'Fake' ? 'border-fake' : 'border-real'}`}>
                <div className="history-info">
                  <span className={`label ${item.prediction === 'Fake' ? 'text-fake' : 'text-real'}`}>{item.prediction}</span>
                  <span className="confidence-label"> ({item.confidence.toFixed(2)}%)</span>
                </div>
                <p className="history-text">"{item.textPreview}"</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
