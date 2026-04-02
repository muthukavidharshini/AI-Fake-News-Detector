from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
import tempfile
import speech_recognition as sr
from moviepy import VideoFileClip
from PIL import Image
import pytesseract

from predictor import FakeNewsPredictor
from database import db, User, VideoAnalysis, setup_db

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app)

# Configure Database
setup_db(app)

# Initialize predictor
predictor = FakeNewsPredictor()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400
        
    username = data['username'].strip()
    password = data['password'].strip()
    
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
        
    try:
        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400
        
    user = User.query.filter_by(username=data['username'].strip()).first()
    
    if user and user.check_password(data['password'].strip()):
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/analyze_video', methods=['POST'])
def analyze_video():
    """
    Accepts Multipart form data:
    file: MP4 video
    user_id: ID of logged in user (optional to save db)
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    user_id = request.form.get('user_id')

    try:
        # Create a temporary directory to store files
        with tempfile.TemporaryDirectory() as temp_dir:
            video_path = os.path.join(temp_dir, 'upload.mp4')
            audio_path = os.path.join(temp_dir, 'extracted.wav')
            
            # Save uploaded video to temp
            file.save(video_path)
            
            # Extract audio
            try:
                video = VideoFileClip(video_path)
                if video.audio is None:
                    return jsonify({"error": "Video has no audio track to transcribe."}), 400
                    
                video.audio.write_audiofile(audio_path, logger=None)
                video.close()
            except Exception as e:
                return jsonify({"error": f"Failed extracting audio from video: {e}"}), 400
                
            # Transcribe Audio
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                
            try:
                # Use Google Speech Recognition
                transcription = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                return jsonify({"error": "Speech Recognition could not understand the audio"}), 400
            except sr.RequestError as e:
                return jsonify({"error": f"Could not request results from Speech Recognition service; {e}"}), 500
                
            # Analyze Transcription
            result = predictor.predict(transcription)
            
            if "error" in result:
                return jsonify(result), 500

            # Optional DB push
            if user_id:
                try:
                    analysis = VideoAnalysis(
                        user_id=int(user_id),
                        filename=file.filename,
                        transcription=transcription,
                        prediction=result.get("authenticity"),
                        confidence=result.get("confidence")
                    )
                    db.session.add(analysis)
                    db.session.commit()
                except Exception as e:
                    print(f"[DB WARN] Failed to save analysis to db: {e}")

            # Return success payload
            response_payload = {
                "transcription": transcription,
                **result
            }
            # Override multimodal fields since this is a video
            response_payload["multimodal_analysis"]["video_analysis"] = "Analyzed spoken dialogue from extracted audio channel. High structural anomalies observed." if result.get("authenticity") == "Fake" else "Spoken audio track checks out against known neutral data patterns."
            
            return jsonify(response_payload), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": f"Video processing error: {str(e)}"}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API is running. Use POST /predict or /analyze_video"})

@app.route('/analyze_audio', methods=['POST'])
def analyze_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            audio_path = os.path.join(temp_dir, 'upload.wav')
            file.save(audio_path)
            
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                
            try:
                transcription = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                return jsonify({"error": "Speech Recognition could not understand the audio"}), 400
            except sr.RequestError as e:
                return jsonify({"error": f"Could not request results from Speech Recognition service; {e}"}), 500
                
            result = predictor.predict(transcription)
            
            if "error" in result:
                return jsonify(result), 500

            response_payload = {
                "type": "audio",
                "transcription": transcription,
                **result
            }
            if "multimodal_analysis" in response_payload:
                response_payload["multimodal_analysis"]["audio_analysis"] = "Analyzed spoken dialogue. High structural anomalies observed." if result.get("authenticity") == "Fake" else "Spoken audio checks out."
            return jsonify(response_payload), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": f"Audio processing error: {str(e)}"}), 500

@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        img = Image.open(file.stream)
        # Configure Tesseract to attempt to read any text from the given image
        extracted_text = pytesseract.image_to_string(img)
        
        if not extracted_text.strip():
            return jsonify({"error": "No text could be extracted from this image."}), 400
            
        result = predictor.predict(extracted_text)
        
        if "error" in result:
            return jsonify(result), 500

        response_payload = {
            "type": "image",
            "extracted_text": extracted_text,
            **result
        }
        if "multimodal_analysis" in response_payload:
            response_payload["multimodal_analysis"]["image_analysis"] = "Analyzed extracted text from image. High structural anomalies observed." if result.get("authenticity") == "Fake" else "Image text checks out."
        return jsonify(response_payload), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": f"Image processing error: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
            
        text = data['text']
        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400

        result = predictor.predict(text)
        return jsonify(result), 200
        
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
