import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function AudioUpload() {
  const [file, setFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0); // 0=idle, 1=extracting, 2=analyzing
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setResult(null);
        setError(null);
        setSuccess(null);
        
        // Setup preview
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an audio file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoadingStep(1); // Extracting
    setError(null);
    setResult(null);
    setSuccess(null);

    try {
      setTimeout(() => setLoadingStep(2), 3000); 

      const response = await fetch('http://127.0.0.1:5000/analyze_audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Audio analysis failed.');
      }

      setResult({
        transcription: data.transcription,
        prediction: data.prediction || data.authenticity,
        confidence: data.confidence,
        explanation: data.explanation || (data.multimodal_analysis && data.multimodal_analysis.audio_analysis)
      });
      setSuccess("Audio successfully transcribed and analyzed!");

    } catch (err) {
      setError(err.message || "Failed to communicate with Audio Processing server.");
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
        <h1>Audio Fake News Checker</h1>
        <p>Upload an audio file. The AI will extract spoken audio, transcribe it, and identify if it contains fake news.</p>
      </header>
      
      <main className="main-content" style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Upload Zone */}
        <div className="result-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '2rem' }}>
                <input 
                    type="file" 
                    accept="audio/mp3,audio/wav,audio/*" 
                    onChange={handleFileChange}
                    id="audio-upload"
                    style={{ display: 'none' }}
                />
                <label 
                    htmlFor="audio-upload" 
                    className="submit-btn" 
                    style={{ display: 'inline-block', cursor: 'pointer', background: 'var(--card-bg)', border: '2px dashed #475569', color: 'var(--text-color)' }}
                >
                    {file ? `Selected: ${file.name}` : '🎵 Choose Audio File (.mp3, .wav)'}
                </label>
            </div>
            
            {preview && (
              <div style={{ margin: '1rem auto' }}>
                <audio controls src={preview} style={{ width: '100%', maxWidth: '400px' }} />
              </div>
            )}
            
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
                  {loadingStep === 1 ? '🎧 Running Speech Recognition...' : '🧠 Passing transcription to Machine Learning Predictor...'}
              </h2>
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
                  <h3 style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>Audio Transcription</h3>
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

export default AudioUpload;
