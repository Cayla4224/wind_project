"""
Database models for the Wind Project admin system
"""

from datetime import datetime
from database import db


class Manuscript(db.Model):
    """Model for manuscript uploads"""
    __tablename__ = 'manuscripts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    upload_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Manuscript {self.title} by {self.author}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'upload_date': self.upload_date.isoformat(),
            'description': self.description
        }


class AudioFile(db.Model):
    """Model for audio file uploads"""
    __tablename__ = 'audio_files'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    narrator = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Float)  # Duration in seconds
    upload_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.Text)
    
    def __repr__(self):
        return f'<AudioFile {self.title} narrated by {self.narrator}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'narrator': self.narrator,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'duration': self.duration,
            'upload_date': self.upload_date.isoformat(),
            'description': self.description
        }


class AdminUser(db.Model):
    """Model for admin users"""
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    def __repr__(self):
        return f'<AdminUser {self.username}>'