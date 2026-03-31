from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Relationships
    videos = db.relationship('VideoAnalysis', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class VideoAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    filename = db.Column(db.String(255), nullable=False)
    transcription = db.Column(db.Text, nullable=True)
    prediction = db.Column(db.String(50), nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

def setup_db(app):
    """
    Configure the local SQLite database for the Flask app.
    Call this from your main app.py
    """
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fake_news.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Ensure all tables are created the first time the server runs
        db.create_all()
