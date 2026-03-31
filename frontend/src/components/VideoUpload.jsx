import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0); // 0=idle, 1=extracting, 2=analyzing
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setResult(null);
        setError(null);
        setSuccess(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Pass user_id if we want to save it to database
    const userId = localStorage.getItem('userId');
    if (userId) {
        formData.append('user_id', userId);
    }

    setLoadingStep(1); // Extracting & Transcribing
    setError(null);
    setResult(null);
    setSuccess(null);

    try {
      // Fake a loading transition simply for UI UX feel before the fetch hangs
      setTimeout(() => setLoadingStep(2), 5000); 

      const response = await fetch('http://127.0.0.1:5000/analyze_video', {
        method: 'POST',
        // DO NOT set Content-Type header manually, let fetch set it with boundary for FormData
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video analysis failed. Server might be missing MoviePy/Audio dependencies.');
      }

      setResult({
        transcription: data.transcription,
        prediction: data.prediction,
        confidence: data.confidence,
        explanation: data.explanation
      });
      setSuccess("Video successfully transcribed and analyzed!");

    } catch (err) {
      setError(err.message || "Failed to communicate with Video Processing server.");
    } finally {
      setLoadingStep(0);
    }
  };

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ marginTop: '2rem' }}
    >
      <header className="header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>Video Fake News Checker</h1>
        <p>Upload an `.mp4` video. The AI will extract spoken audio, transcribe it, and identify if it's fake news.</p>
      </header>
      
      <main className="main-content" style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Upload Zone */}
        <div className="result-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '2rem' }}>
                <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    onChange={handleFileChange}
                    id="video-upload"
                    style={{ display: 'none' }}
                />
                <label 
                    htmlFor="video-upload" 
                    className="submit-btn" 
                    style={{ display: 'inline-block', cursor: 'pointer', background: 'var(--card-bg)', border: '2px dashed #475569', color: 'var(--text-color)' }}
                >
                    {file ? `Selected: ${file.name}` : '📁 Choose Video File (.mp4)'}
                </label>
            </div>
            
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="submit-btn" 
                disabled={loadingStep !== 0 || !file}
                style={{ width: '200px', margin: 'auto' }}
            >
                {loadingStep !== 0 ? 'Processing...' : 'Upload & Analyze System'}
            </motion.button>
            </form>
        </div>

        {/* Loading States */}
        <AnimatePresence>
          {loadingStep > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="loading-pulse result-card"
              style={{ textAlign: 'center' }}
            >
              <h2 style={{ color: 'var(--primary-color)' }}>
                  {loadingStep === 1 ? '🎧 Extracting audio and running Speech Recognition...' : '🧠 Passing transcription to Machine Learning Predictor...'}
              </h2>
              <p style={{ opacity: 0.7 }}>This might take a minute depending on video length...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="error-message"
            >
              <strong>Error:</strong> {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="error-message"
              style={{ borderColor: 'var(--real-color)', color: 'var(--real-color)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              ✅ {success}
            </motion.div>
          )}

          {/* Results Output */}
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
                  Model Confidence: {result.confidence.toFixed(2)}%
                </motion.strong>
              </p>
              
              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>Video Spoken Transcription</h3>
                  <p style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                      "{result.transcription}"
                  </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </motion.div>
  );
}

export default VideoUpload;
