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
      className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="w-full mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">Video Fake News Checker</h1>
        <p className="text-lg md:text-xl text-gray-300 text-center">Upload an `.mp4` video. The AI will extract spoken audio, transcribe it, and identify if it's fake news.</p>
      </header>
      
      <main className="w-full flex flex-col items-center gap-8">
        
        {/* Upload Zone */}
        <div className="w-full p-10 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md text-center">
            <form onSubmit={handleUpload} className="w-full">
            <div className="mb-6 w-full">
                <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    onChange={handleFileChange}
                    id="video-upload"
                    style={{ display: 'none' }}
                />
                <label 
                    htmlFor="video-upload" 
                    className="w-full p-6 border-2 border-dashed border-gray-400 rounded-xl text-lg text-center block cursor-pointer text-gray-200 hover:border-gray-200 hover:text-white transition"
                >
                    {file ? `Selected: ${file.name}` : '📁 Choose Video File (.mp4)'}
                </label>
            </div>
            
            <button 
                type="submit" 
                className="w-full py-3 text-xl mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition transform duration-300 text-white font-semibold rounded-lg shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loadingStep !== 0 || !file}
            >
                {loadingStep !== 0 ? 'Processing...' : 'Upload & Analyze System'}
            </button>
            </form>
        </div>

        {/* Loading States & Results */}
        <div className="w-full">
        <AnimatePresence>
          {loadingStep > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="w-full p-6 rounded-2xl bg-white/5 backdrop-blur-sm text-center mb-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-blue-400 mb-2">
                  {loadingStep === 1 ? '🎧 Extracting audio and running Speech Recognition...' : '🧠 Passing transcription to Machine Learning Predictor...'}
              </h2>
              <p className="text-gray-300">This might take a minute depending on video length...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full p-4 mb-6 rounded-lg bg-red-500/20 text-red-300 font-semibold text-center border border-red-500/50"
            >
              <strong>Error:</strong> {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full p-4 mb-6 rounded-lg bg-green-500/20 text-green-300 font-semibold text-center border border-green-500/50"
            >
              ✅ {success}
            </motion.div>
          )}

          {/* Results Output */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={`w-full p-8 rounded-2xl shadow-xl text-left border \${result.prediction === 'Fake' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}
            >
              <h2 className={`text-3xl font-bold mb-4 \${result.prediction === 'Fake' ? 'text-red-400' : 'text-green-400'}`}>
                Prediction: {result.prediction}
              </h2>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
                <motion.div 
                  className={`h-4 rounded-full \${result.prediction === 'Fake' ? 'bg-red-500' : 'bg-green-500'}`}
                  initial={{ width: 0 }} 
                  animate={{ width: `${result.confidence}%` }}
                />
              </div>
              <p className="text-lg text-gray-200 mb-6 font-semibold">
                  Model Confidence: {result.confidence.toFixed(2)}%
              </p>
              
              <div className="p-6 bg-black/40 rounded-xl">
                  <h3 className="text-xl text-gray-400 mb-3 font-semibold">Video Spoken Transcription</h3>
                  <p className="text-lg text-gray-200 italic leading-relaxed">
                      "{result.transcription}"
                  </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

    </motion.div>
  );
}

export default VideoUpload;
