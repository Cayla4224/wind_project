"""
Utility functions for file handling and validation
"""

import os
import uuid
import magic
from mutagen import File as MutagenFile
from werkzeug.utils import secure_filename


# Allowed file extensions
ALLOWED_MANUSCRIPT_EXTENSIONS = {'pdf', 'docx', 'doc'}
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'flac', 'm4a'}

# MIME types for validation
ALLOWED_MANUSCRIPT_MIMES = {
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
}

ALLOWED_AUDIO_MIMES = {
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/mp4',
    'audio/x-m4a'
}


def allowed_manuscript_file(filename):
    """Check if filename has allowed manuscript extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_MANUSCRIPT_EXTENSIONS


def allowed_audio_file(filename):
    """Check if filename has allowed audio extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS


def validate_file_type(file_path, expected_type='manuscript'):
    """Validate file type using python-magic"""
    try:
        mime_type = magic.from_file(file_path, mime=True)
        
        if expected_type == 'manuscript':
            return mime_type in ALLOWED_MANUSCRIPT_MIMES
        elif expected_type == 'audio':
            return mime_type in ALLOWED_AUDIO_MIMES
        
        return False
    except Exception:
        return False


def get_audio_duration(file_path):
    """Get audio file duration using mutagen"""
    try:
        audio_file = MutagenFile(file_path)
        if audio_file is not None and hasattr(audio_file, 'info'):
            return audio_file.info.length
        return None
    except Exception:
        return None


def generate_unique_filename(original_filename):
    """Generate a unique filename while preserving extension"""
    filename = secure_filename(original_filename)
    name, ext = os.path.splitext(filename)
    unique_name = f"{name}_{uuid.uuid4().hex}{ext}"
    return unique_name


def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"


def format_duration(seconds):
    """Format duration in human readable format"""
    if seconds is None:
        return "Unknown"
    
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes:02d}:{seconds:02d}"