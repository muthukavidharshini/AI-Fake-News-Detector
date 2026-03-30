import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pickle
import os

def train_model():
    nltk.download('stopwords', quiet=True)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, 'mock_data.csv')

    print(f"Loading data from {data_path}...")
    
    if not os.path.exists(data_path):
        # Create a tiny mock dataset if it doesn't exist so training won't crash
        mock_data = pd.DataFrame({
            'author': ['John Doe', 'Jane Smith', 'Anon'],
            'title': ['Real News Update', 'Fake Story Wow', 'Another true fact'],
            'text': ['This is a completely real article with factual information.', 'Clickbait! You won\'t believe this made up story.', 'The sky is blue today.'],
            'label': [0, 1, 0]
        })
        mock_data.to_csv(data_path, index=False)
        
    dataset = pd.read_csv(data_path)
    dataset = dataset.fillna('')
    dataset['content'] = dataset['author'] + ' ' + dataset['title'] + ' ' + dataset['text']

    port_stem = PorterStemmer()
    stops = set(stopwords.words('english'))

    def stemming(content):
        stemmed_content = re.sub('[^a-zA-Z]', ' ', content)
        stemmed_content = stemmed_content.lower()
        stemmed_content = stemmed_content.split()
        stemmed_content = [port_stem.stem(word) for word in stemmed_content if word not in stops]
        return ' '.join(stemmed_content)

    print("Preprocessing text...")
    dataset['content'] = dataset['content'].apply(stemming)

    X = dataset['content'].values
    Y = dataset['label'].values

    print("Vectorizing with TF-IDF...")
    vectorizer = TfidfVectorizer(max_df=0.7)
    vectorizer.fit(X)
    X = vectorizer.transform(X)

    # Use a small test size and handle small dataset edge-cases
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

    print("Training LogisticRegression...")
    model = LogisticRegression(random_state=42)
    model.fit(X_train, Y_train)

    print(f"Training Accuracy: {model.score(X_train, Y_train):.4f}")
    if len(Y_test) > 0:
        print(f"Test Accuracy: {model.score(X_test, Y_test):.4f}")

    model_output_path = os.path.join(base_dir, 'model.pkl')
    vec_output_path = os.path.join(base_dir, 'vectorizer.pkl')

    print(f"Saving model to {model_output_path}")
    with open(model_output_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Saving vectorizer to {vec_output_path}")
    with open(vec_output_path, 'wb') as f:
        pickle.dump(vectorizer, f)

    print("Done! model.pkl and vectorizer.pkl saved successfully.")

if __name__ == "__main__":
    train_model()

