"""
Wind Project - Admin File Upload System
Main Flask application entry point
"""

import os
from flask import Flask
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///wind_project.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

# Initialize database with app
from database import db
db.init_app(app)

# Create upload directories
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'manuscripts'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'audio'), exist_ok=True)

# Import after app and db are initialized
from models import *
from routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create default admin user if none exists
        from auth import create_admin_user
        from models import AdminUser
        if AdminUser.query.count() == 0:
            success, message = create_admin_user('admin', 'admin123', 'admin@windproject.com')
            if success:
                print("Default admin user created - Username: admin, Password: admin123")
            else:
                print(f"Error creating default admin user: {message}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)