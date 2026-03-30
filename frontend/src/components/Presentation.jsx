import React from 'react';
import { motion } from 'framer-motion';

function Presentation() {
  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <header className="header" style={{ marginBottom: '1.5rem' }}>
        <h1>Project Demo & Presentation</h1>
        <p>Your slides and live feature demonstrations.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Slides Mockup */}
        <div className="result-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>📄 Final Defense Slides</h2>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
            Interactive presentation embedded from Google Slides / PowerPoint.
          </p>
          <div style={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #334155', minHeight: '200px' }}>
            <span style={{ color: '#64748b' }}>[Insert PPT / iframe embed here]</span>
          </div>
          <button className="submit-btn" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>Download PPTX</button>
        </div>

        {/* Video Demo Mockup */}
        <div className="result-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2>🎬 Voice API Video Demo</h2>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
            Pre-recorded demonstration of the Web Speech NLP capabilities.
          </p>
          <div style={{ backgroundColor: '#0f172a', borderRadius: '0.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #334155', minHeight: '200px' }}>
             <span style={{ color: '#64748b' }}>▶️ [Insert YouTube / Local Video here]</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default Presentation;
