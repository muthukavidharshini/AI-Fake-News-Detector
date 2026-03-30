import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

function Analytics({ history }) {

  // Process data for charts
  const fakeCount = history.filter(h => h.prediction === 'Fake').length;
  const realCount = history.filter(h => h.prediction === 'Real').length;
  
  const pieData = [
    { name: 'Fake News', value: fakeCount },
    { name: 'Real News', value: realCount },
  ];
  
  const COLORS = ['#f43f5e', '#10b981']; // Fake (red), Real (green)

  // Confidence distribution data
  const confidenceData = history.slice(0, 10).map((h, index) => ({
    name: `Scan ${history.length - index}`,
    confidence: h.confidence,
    prediction: h.prediction
  })).reverse(); // Show oldest to newest for the last 10 scans

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="header">
        <h1>Scan Analytics</h1>
        <p>Visualizing your news detection history.</p>
      </header>

      {history.length === 0 ? (
        <div className="result-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>No Data Available</h2>
          <p>Go to the Dashboard and analyze some text to generate charts!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          <div className="result-card">
            <h2>Prediction Distribution</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="result-card">
            <h2>Recent Scan Confidence Levels</h2>
            <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
              <ResponsiveContainer>
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="var(--text-color)" opacity={0.7} />
                  <YAxis stroke="var(--text-color)" opacity={0.7} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                  />
                  <Legend />
                  <Bar dataKey="confidence" name="Confidence %" radius={[4, 4, 0, 0]}>
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.prediction === 'Fake' ? '#f43f5e' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}

export default Analytics;
