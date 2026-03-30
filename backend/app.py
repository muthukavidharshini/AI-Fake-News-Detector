from flask import Flask, request, jsonify
from flask_cors import CORS
from predictor import FakeNewsPredictor
import traceback

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app)

# Initialize predictor (will load models on startup)
predictor = FakeNewsPredictor(
    model_path='../model/model.pkl',
    vectorizer_path='../model/vectorizer.pkl'
)

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Fake News Detection API is running. Use POST /predict to classify text."}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint mapping: /predict
    Accepts JSON: {"text": "news content..."}
    Returns JSON: {"prediction": "Fake"/"Real", "confidence": <float>, "explanation": "..."}
    """
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
    # Run Flask server securely on development mode
    app.run(host='0.0.0.0', port=5000, debug=True)
