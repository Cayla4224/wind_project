"""
Authentication utilities for admin access
"""

import hashlib
from functools import wraps
from flask import session, redirect, url_for, flash, request
from models import AdminUser


def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password, password_hash):
    """Verify password against hash"""
    return hash_password(password) == password_hash


def create_admin_user(username, password, email):
    """Create a new admin user"""
    from database import db
    from models import AdminUser
    
    # Check if user already exists
    existing_user = AdminUser.query.filter_by(username=username).first()
    if existing_user:
        return False, "Username already exists"
    
    existing_email = AdminUser.query.filter_by(email=email).first()
    if existing_email:
        return False, "Email already exists"
    
    # Create new user
    admin_user = AdminUser(
        username=username,
        password_hash=hash_password(password),
        email=email
    )
    
    try:
        db.session.add(admin_user)
        db.session.commit()
        return True, "Admin user created successfully"
    except Exception as e:
        db.session.rollback()
        return False, f"Error creating user: {str(e)}"


def authenticate_user(username, password):
    """Authenticate admin user"""
    user = AdminUser.query.filter_by(username=username, is_active=True).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None


def login_required(f):
    """Decorator to require admin login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_user_id' not in session:
            flash('Please log in to access the admin panel.', 'error')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def is_logged_in():
    """Check if user is logged in"""
    return 'admin_user_id' in session


def get_current_user():
    """Get current logged in user"""
    if 'admin_user_id' in session:
        return AdminUser.query.get(session['admin_user_id'])
    return None