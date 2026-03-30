import pickle
import re
import os
import sys
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

# Ensure stopwords are handled smoothly
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class FakeNewsPredictor:
    def __init__(self, model_path='../model/model.pkl', vectorizer_path='../model/vectorizer.pkl'):
        """
        Initializes the model predictor by loading the robust serialized objects.
        Automatically triggers model training if files are missing.
        """
        self.port_stem = PorterStemmer()
        self.stops = set(stopwords.words('english'))
        
        # Resolve exact absolute paths
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        abs_model_path = os.path.normpath(os.path.join(backend_dir, model_path))
        abs_vectorizer_path = os.path.normpath(os.path.join(backend_dir, vectorizer_path))
        
        print(f"[DEBUG] Looking for model at: {abs_model_path}")
        print(f"[DEBUG] Looking for vectorizer at: {abs_vectorizer_path}")
        
        if not os.path.exists(abs_model_path) or not os.path.exists(abs_vectorizer_path):
            print("[DEBUG] Model files not found! Automatically triggering training script...")
            # Automatically run training
            model_script_dir = os.path.normpath(os.path.join(backend_dir, '..', 'model'))
            train_script = os.path.join(model_script_dir, 'train.py')
            
            # Since importing might fail due to paths, we can directly invoke the process or dynamically import
            sys.path.append(model_script_dir)
            try:
                import train
                train.train_model()
            except ImportError as e:
                print(f"[ERROR] Could not import train.py: {e}")
            except Exception as e:
                print(f"[ERROR] Error during training execution: {e}")
            finally:
                if model_script_dir in sys.path:
                    sys.path.remove(model_script_dir)
            
            # Re-check paths after training
            if not os.path.exists(abs_model_path):
                print("[DEBUG] WARNING: Even after training, model.pkl is missing!")
            else:
                print("[DEBUG] SUCCESS: Training completed and model generated.")

        # Load Model
        if os.path.exists(abs_model_path) and os.path.exists(abs_vectorizer_path):
            print(f"[DEBUG] Model and Vectorizer exist. Loading...")
            with open(abs_model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(abs_vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            print("[DEBUG] Models loaded successfully!")
        else:
            self.model = None
            self.vectorizer = None
            print("[ERROR] Models could not be loaded!")

    def preprocess(self, text):
        stemmed_content = re.sub('[^a-zA-Z]', ' ', text)
        stemmed_content = stemmed_content.lower()
        stemmed_content = stemmed_content.split()
        stemmed_content = [self.port_stem.stem(word) for word in stemmed_content if word not in self.stops]
        return ' '.join(stemmed_content)

    def get_explanation(self, text, raw_prediction, vec_doc):
        if not hasattr(self.model, 'coef_') or self.model.coef_ is None:
            return "Explanation not available for this model type."
            
        feature_names = self.vectorizer.get_feature_names_out()
        coefficients = self.model.coef_[0]
        
        nonzero_indices = vec_doc.nonzero()[1]
        
        if len(nonzero_indices) == 0:
            return "No recognized words to analyze."
            
        # Extract word weights
        word_weights = []
        for idx in nonzero_indices:
            word = feature_names[idx]
            weight = coefficients[idx]
            # TF-IDF value * corresponding model weight
            contribution = vec_doc[0, idx] * weight
            word_weights.append((word, contribution))
            
        # For Logistic Regression: positive weight -> Class 1 (Fake), negative weight -> Class 0 (Real)
        # Note: Depending on training label logic 1=Fake, 0=Real
        if raw_prediction == 1:
            word_weights.sort(key=lambda x: x[1], reverse=True)
            top_words = [w[0] for w in word_weights if w[1] > 0][:5]
        else:
            word_weights.sort(key=lambda x: x[1], reverse=False)
            top_words = [w[0] for w in word_weights if w[1] < 0][:5]
            
        if not top_words:
            word_weights.sort(key=lambda x: abs(x[1]), reverse=True)
            top_words = [w[0] for w in word_weights][:5]

        return f"Key deciding terms: {', '.join(top_words)}"

    def predict(self, text):
        if self.model is None or self.vectorizer is None:
            return {"error": "Model not loaded. Please ensure the model directory has valid .pkl files."}

        # 1. Preprocess
        processed_text = self.preprocess(text)
        
        if not processed_text.strip():
            return {
                "prediction": "Unknown",
                "confidence": 0.0,
                "explanation": "Text doesn't contain enough meaningful words."
            }

        # 2. Vectorize
        vectorized_text = self.vectorizer.transform([processed_text])
        
        # 3. Predict & Confidence
        prediction_val = self.model.predict(vectorized_text)[0]
        prediction = "Fake" if prediction_val == 1 else "Real"
        
        # LogisticRegression supports predict_proba
        if hasattr(self.model, 'predict_proba'):
            probas = self.model.predict_proba(vectorized_text)[0]
            confidence = float(max(probas) * 100)
        else:
            confidence = 100.0

        # 4. Explanation
        explanation = self.get_explanation(processed_text, prediction_val, vectorized_text)

        return {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "explanation": explanation
        }
