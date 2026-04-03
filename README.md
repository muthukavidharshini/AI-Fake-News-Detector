# AI Fake News Detector

## Description
The AI Fake News Detector is a web application that analyzes news content—including **text, images, audio, and videos**—to determine whether it is **Real**, **Fake**, or **Possibly Misleading**.  
It uses **AI multimodal analysis**, **automated summarization**, and **source verification** to provide clear, structured, and actionable results.

👉 Supports **Text 📝, Image 🖼️, Audio 🎙️, and Video 🎥 analysis using AI**

---

## Features

### 🔹 Core Features
- User Registration & Login: Secure authentication with token-based login.
- News Submission: Submit news articles or upload **text, image, audio, and video** content.
- Media Upload & Preview: Preview images, audio, and videos before checking.
- Multimodal AI Analysis: Combines **text, image, audio, and video analysis**.
- Multi-language Support: Detects and translates news from multiple languages.
- News Categorization & Filtering: Categories like Politics, Health, Tech, Entertainment, Science.
- Automated Summarization: Generates a short summary of the news.
- Tone & Emotion Detection: Detects fear, anger, sensationalism, or misleading emotions.
- Suggested Actions: Recommends whether to verify, ignore, or share with caution.
- Fact-check References: Provides links to credible sources.

---

### 🔹 Multimodal Analysis Features
- 📝 **Text Analysis**: Analyze news articles, headlines, and written content.
- 🖼️ **Image Analysis**: Detect manipulated images, OCR text extraction, and visual inconsistencies.
- 🎙️ **Audio Analysis**: Transcribe and analyze speech for misinformation or deepfake audio.
- 🎥 **Video Analysis**: Detect deepfake videos and analyze frames for suspicious content.

---

### 🔹 Advanced Features
- Trending Fake News Alerts: Notifies users about trending fake news.
- Error Handling: Handles invalid input or corrupted media gracefully.
- Source Reliability Score: Evaluates trustworthiness of news sources.
- Cross-modal Verification: Combines multiple media types for higher accuracy.

---

## 🧠 Multimodal AI Capability

This project uses advanced AI models to analyze multiple types of content:

- **Text** → NLP-based fake news detection  
- **Image** → OCR + manipulation detection  
- **Audio** → Speech-to-text + sentiment analysis  
- **Video** → Frame extraction + deepfake detection  

---

## Tech Stack
- Frontend: React.js, HTML, CSS, Tailwind
- Backend: Node.js, Express.js
- Database: MongoDB
- AI & NLP: OpenAI / Antigravity API
- Authentication: JWT-based token system

---

## Installation & Setup

### Clone the repository
```bash
git clone https://github.com/yourusername/fake-news-detector.git
cd fake-news-detector
Backend Setup
cd backend
npm install
npm start
Frontend Setup
cd frontend
npm install
npm start
🌐 Open the Application
http://localhost:5173/news-check
Usage
Register/Login
Go to News Check page
Enter Title, Content, Source, URL
Upload image, audio, or video (optional)
Select category or let AI auto-detect
Click Check News
📊 Example Output
{
  "authenticity": "Fake",
  "confidence": "95%",
  "explanation": "The claim that lemon juice cures COVID-19 is false.",
  "suggested_action": "Do not share; verify from official sources",
  "tone_emotion": "Fear, sensationalism",
  "category": "Health",
  "summary": "False claim about lemon juice curing COVID-19",
  "source_reliability": "Low",
  "multimodal_analysis": {
    "text_analysis": "",
    "image_analysis": "",
    "audio_analysis": "",
    "video_analysis": ""
  }
}
📁 Folder Structure
fake-news-detector/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
│
├── README.md
└── .gitignore
🚀 Future Enhancements
Browser extension for instant news verification
Gamification and leaderboards
AI feedback learning system
Real-time social media monitoring
📜 License

MIT License © 2026 – Your Name

✅ Local News Check page: http://localhost:5173/news-check


---

## 🎯 What I improved

✔ Added **Audio 🎙️ feature**  
✔ Clearly separated **Multimodal section**  
✔ Improved **professional formatting**  
✔ Fixed **structure & readability**  
✔ Added **clear feature highlighting**  

---

## 🔥 If you want next level
I can:
- ⭐ Add **GitHub badges (build, license, AI)**
- 🖼️ Add **screenshots section**
- 📊 Make it **portfolio-level README**

Just tell me 👍
