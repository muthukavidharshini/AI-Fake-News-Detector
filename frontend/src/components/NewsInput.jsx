import React, { useState } from 'react';
import { motion } from 'framer-motion';

function NewsInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze text');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFake = result?.authenticity?.toLowerCase().includes('fake');

  return (
    <motion.div 
      className="container flex-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ width: '100%', maxWidth: '800px', margin: '2rem auto' }}>
        <div className="login-card result-card">
          <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Fake News Text Checker</h1>
          <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem' }}>
            Paste the news article or text below to analyze its authenticity.
          </p>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-input"
              placeholder="Enter news text here..."
              rows="8"
              style={{ resize: 'vertical' }}
            />
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </form>

          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>

        {result && (
          <motion.div 
            className="result-card"
            style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--input-border)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ color: isFake ? 'var(--error-color)' : 'var(--success-color)', margin: 0 }}>
                  {result.authenticity.toUpperCase()}
                </h2>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>Category: {result.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: 'var(--input-bg)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' }}>
                  {(result.confidence).toFixed(1)}% Confidence
                </span>
                {result.trending_alert === "Yes" && (
                  <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold' }}>⚠️ Trending Fake News</div>
                )}
              </div>
            </div>

            <p style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>"{result.summary}"</p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--card-bg)', border: '1px solid var(--input-border)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.85rem' }}>
                🎭 Tone: {result.tone_emotion}
              </span>
              <span style={{ background: 'var(--card-bg)', border: '1px solid var(--input-border)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.85rem' }}>
                🛡️ Source: {result.source_reliability}
              </span>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', marginTop: '0.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--primary-color)' }}>AI Explanation & Action</h3>
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1rem' }}>{result.explanation}</p>
              <div style={{ padding: '0.5rem', background: 'var(--card-bg)', borderRadius: '4px', borderLeft: `4px solid ${isFake ? 'var(--error-color)' : 'var(--success-color)'}` }}>
                <strong>Recommendation:</strong> {result.suggested_action}
              </div>
            </div>

            {result.fact_check_references && result.fact_check_references.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Fact-Check References:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  {result.fact_check_references.map((url, idx) => (
                    <li key={idx}><a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>{url}</a></li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '1rem', borderTop: '1px solid var(--input-border)', paddingTop: '0.5rem' }}>
              <strong>Multimodal Integrity:</strong> Video: {result.multimodal_analysis.video_analysis} | Image: {result.multimodal_analysis.image_analysis}
            </div>

          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default NewsInput;
