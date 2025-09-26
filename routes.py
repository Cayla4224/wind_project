"""
Flask routes for the admin file upload system
"""

import os
from flask import render_template, request, redirect, url_for, flash, session, jsonify, send_file
from werkzeug.utils import secure_filename
from app import app
from database import db
from models import Manuscript, AudioFile, AdminUser
from auth import login_required, authenticate_user, create_admin_user, is_logged_in, get_current_user
from utils import (
    allowed_manuscript_file, allowed_audio_file, validate_file_type,
    get_audio_duration, generate_unique_filename, format_file_size, format_duration
)


@app.route('/')
def index():
    """Main index page - redirect to admin if logged in"""
    if is_logged_in():
        return redirect(url_for('admin_dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    if is_logged_in():
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        if not username or not password:
            flash('Please enter both username and password.', 'error')
            return render_template('login.html')
        
        user = authenticate_user(username, password)
        if user:
            session['admin_user_id'] = user.id
            session['admin_username'] = user.username
            flash(f'Welcome back, {user.username}!', 'success')
            
            # Redirect to next page if specified
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('login.html')


@app.route('/logout')
def logout():
    """Admin logout"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


@app.route('/admin')
@login_required
def admin_dashboard():
    """Main admin dashboard"""
    manuscript_count = Manuscript.query.count()
    audio_count = AudioFile.query.count()
    
    recent_manuscripts = Manuscript.query.order_by(Manuscript.upload_date.desc()).limit(5).all()
    recent_audio = AudioFile.query.order_by(AudioFile.upload_date.desc()).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         manuscript_count=manuscript_count,
                         audio_count=audio_count,
                         recent_manuscripts=recent_manuscripts,
                         recent_audio=recent_audio,
                         format_file_size=format_file_size,
                         format_duration=format_duration)


@app.route('/admin/manuscripts')
@login_required
def list_manuscripts():
    """List all manuscripts"""
    page = request.args.get('page', 1, type=int)
    manuscripts = Manuscript.query.order_by(Manuscript.upload_date.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template('admin/manuscripts.html', 
                         manuscripts=manuscripts,
                         format_file_size=format_file_size)


@app.route('/admin/audio')
@login_required
def list_audio():
    """List all audio files"""
    page = request.args.get('page', 1, type=int)
    audio_files = AudioFile.query.order_by(AudioFile.upload_date.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template('admin/audio.html', 
                         audio_files=audio_files,
                         format_file_size=format_file_size,
                         format_duration=format_duration)


@app.route('/admin/upload', methods=['GET', 'POST'])
@login_required
def upload_files():
    """File upload page"""
    if request.method == 'POST':
        upload_type = request.form.get('upload_type')
        
        if upload_type == 'manuscript':
            return handle_manuscript_upload()
        elif upload_type == 'audio':
            return handle_audio_upload()
        else:
            flash('Invalid upload type.', 'error')
    
    return render_template('admin/upload.html')


def handle_manuscript_upload():
    """Handle manuscript file upload"""
    if 'file' not in request.files:
        flash('No file selected.', 'error')
        return redirect(url_for('upload_files'))
    
    file = request.files['file']
    title = request.form.get('title', '').strip()
    author = request.form.get('author', '').strip()
    description = request.form.get('description', '').strip()
    
    if file.filename == '':
        flash('No file selected.', 'error')
        return redirect(url_for('upload_files'))
    
    if not title or not author:
        flash('Title and author are required.', 'error')
        return redirect(url_for('upload_files'))
    
    if not allowed_manuscript_file(file.filename):
        flash('Invalid file type. Only PDF and DOCX files are allowed.', 'error')
        return redirect(url_for('upload_files'))
    
    try:
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(original_filename)
        
        # Save file
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], 'manuscripts', unique_filename)
        file.save(upload_path)
        
        # Validate file type
        if not validate_file_type(upload_path, 'manuscript'):
            os.remove(upload_path)
            flash('Invalid file type detected.', 'error')
            return redirect(url_for('upload_files'))
        
        # Get file info
        file_size = os.path.getsize(upload_path)
        file_type = original_filename.rsplit('.', 1)[1].lower()
        
        # Create database record
        manuscript = Manuscript(
            title=title,
            author=author,
            filename=unique_filename,
            original_filename=original_filename,
            file_size=file_size,
            file_type=file_type,
            description=description
        )
        
        db.session.add(manuscript)
        db.session.commit()
        
        flash(f'Manuscript "{title}" uploaded successfully!', 'success')
        return redirect(url_for('list_manuscripts'))
        
    except Exception as e:
        # Clean up file if it was saved
        if os.path.exists(upload_path):
            os.remove(upload_path)
        flash(f'Error uploading file: {str(e)}', 'error')
        return redirect(url_for('upload_files'))


def handle_audio_upload():
    """Handle audio file upload"""
    if 'file' not in request.files:
        flash('No file selected.', 'error')
        return redirect(url_for('upload_files'))
    
    file = request.files['file']
    title = request.form.get('title', '').strip()
    narrator = request.form.get('narrator', '').strip()
    description = request.form.get('description', '').strip()
    
    if file.filename == '':
        flash('No file selected.', 'error')
        return redirect(url_for('upload_files'))
    
    if not title or not narrator:
        flash('Title and narrator are required.', 'error')
        return redirect(url_for('upload_files'))
    
    if not allowed_audio_file(file.filename):
        flash('Invalid file type. Only MP3, WAV, FLAC, and M4A files are allowed.', 'error')
        return redirect(url_for('upload_files'))
    
    try:
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(original_filename)
        
        # Save file
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], 'audio', unique_filename)
        file.save(upload_path)
        
        # Validate file type
        if not validate_file_type(upload_path, 'audio'):
            os.remove(upload_path)
            flash('Invalid file type detected.', 'error')
            return redirect(url_for('upload_files'))
        
        # Get file info
        file_size = os.path.getsize(upload_path)
        file_type = original_filename.rsplit('.', 1)[1].lower()
        duration = get_audio_duration(upload_path)
        
        # Create database record
        audio_file = AudioFile(
            title=title,
            narrator=narrator,
            filename=unique_filename,
            original_filename=original_filename,
            file_size=file_size,
            file_type=file_type,
            duration=duration,
            description=description
        )
        
        db.session.add(audio_file)
        db.session.commit()
        
        flash(f'Audio file "{title}" uploaded successfully!', 'success')
        return redirect(url_for('list_audio'))
        
    except Exception as e:
        # Clean up file if it was saved
        if os.path.exists(upload_path):
            os.remove(upload_path)
        flash(f'Error uploading file: {str(e)}', 'error')
        return redirect(url_for('upload_files'))


@app.route('/admin/manuscript/<int:manuscript_id>')
@login_required
def view_manuscript(manuscript_id):
    """View manuscript details"""
    manuscript = Manuscript.query.get_or_404(manuscript_id)
    return render_template('admin/manuscript_detail.html', 
                         manuscript=manuscript,
                         format_file_size=format_file_size)


@app.route('/admin/audio/<int:audio_id>')
@login_required
def view_audio(audio_id):
    """View audio file details"""
    audio_file = AudioFile.query.get_or_404(audio_id)
    return render_template('admin/audio_detail.html', 
                         audio_file=audio_file,
                         format_file_size=format_file_size,
                         format_duration=format_duration)


@app.route('/admin/download/manuscript/<int:manuscript_id>')
@login_required
def download_manuscript(manuscript_id):
    """Download manuscript file"""
    manuscript = Manuscript.query.get_or_404(manuscript_id)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'manuscripts', manuscript.filename)
    
    if not os.path.exists(file_path):
        flash('File not found.', 'error')
        return redirect(url_for('view_manuscript', manuscript_id=manuscript_id))
    
    return send_file(file_path, as_attachment=True, download_name=manuscript.original_filename)


@app.route('/admin/download/audio/<int:audio_id>')
@login_required
def download_audio(audio_id):
    """Download audio file"""
    audio_file = AudioFile.query.get_or_404(audio_id)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'audio', audio_file.filename)
    
    if not os.path.exists(file_path):
        flash('File not found.', 'error')
        return redirect(url_for('view_audio', audio_id=audio_id))
    
    return send_file(file_path, as_attachment=True, download_name=audio_file.original_filename)


# Error handlers
@app.errorhandler(413)
def file_too_large(error):
    flash('File is too large. Maximum file size is 500MB.', 'error')
    return redirect(url_for('upload_files'))


@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500


# Initialize default admin user if none exists - removed from here since it's now in app.py