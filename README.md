# Wind Project - Admin File Upload System

A comprehensive admin interface for uploading and managing manuscripts and audio files with metadata storage, file validation, and secure access control.

## Features

### 🔐 Authentication & Security
- Session-based admin authentication
- File type validation using MIME types
- Input sanitization and validation
- Secure file storage with unique filenames
- File size limits enforcement (500MB max)

### 📄 Manuscript Management
- Upload PDF, DOC, DOCX files
- Store metadata: title, author, upload date, description
- File validation and security scanning
- Download and view manuscript details

### 🎵 Audio File Management
- Upload MP3, WAV, FLAC, M4A files
- Store metadata: title, narrator, duration, upload date, description
- Automatic duration detection using mutagen
- Audio preview functionality
- Support for large file uploads

### 🎨 User Interface
- Responsive Bootstrap-based design
- Intuitive tab-based upload interface
- File listing with pagination
- Dashboard with statistics and recent uploads
- Empty state handling
- Real-time upload progress indicators

### 🔧 Technical Features
- Flask web framework with SQLAlchemy ORM
- SQLite database (easily upgradable to PostgreSQL)
- Modular design for easy extension
- Comprehensive error handling
- File upload progress tracking

## Installation & Setup

### Prerequisites
- Python 3.8+ 
- pip package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wind_project
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the admin panel**
   - Open your browser to `http://localhost:5000`
   - Login with default credentials: `admin` / `admin123`

## Usage

### First Time Setup
- The application automatically creates a default admin user on first run
- Default credentials: **Username:** `admin`, **Password:** `admin123`
- **Important:** Change the default password in production!

### Uploading Files

#### Manuscripts
1. Navigate to **Upload** → **Manuscript** tab
2. Select a PDF, DOC, or DOCX file
3. Fill in required metadata (title, author)
4. Add optional description
5. Click "Upload Manuscript"

#### Audio Files
1. Navigate to **Upload** → **Audio File** tab
2. Select an MP3, WAV, FLAC, or M4A file
3. Fill in required metadata (title, narrator)
4. Add optional description
5. Click "Upload Audio File"

### Managing Files
- **Dashboard**: View statistics and recent uploads
- **Manuscripts**: Browse all manuscript files with pagination
- **Audio Files**: Browse all audio files with pagination
- **File Details**: Click on any file to view detailed information
- **Download**: Download original files from detail pages

## Configuration

### Environment Variables
Create a `.env` file from `.env.example`:

```bash
# Security
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///wind_project.db

# File Upload
MAX_CONTENT_LENGTH=500  # MB
UPLOAD_FOLDER=uploads

# Flask Settings
FLASK_ENV=development
FLASK_DEBUG=True
```

### File Upload Limits
- **Maximum file size**: 500MB (configurable)
- **Manuscript formats**: PDF, DOC, DOCX
- **Audio formats**: MP3, WAV, FLAC, M4A

### Database Configuration
By default uses SQLite. To use PostgreSQL:
1. Install `psycopg2`: `pip install psycopg2-binary`
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost/wind_project
   ```

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Admin Dashboard
- `GET /admin` - Admin dashboard
- `GET /admin/manuscripts` - List manuscripts
- `GET /admin/audio` - List audio files
- `GET /admin/upload` - Upload interface

### File Management
- `POST /admin/upload` - Handle file uploads
- `GET /admin/manuscript/<id>` - Manuscript details
- `GET /admin/audio/<id>` - Audio file details
- `GET /admin/download/manuscript/<id>` - Download manuscript
- `GET /admin/download/audio/<id>` - Download audio file

## Security Features

### File Validation
- MIME type checking using python-magic
- File extension validation
- Content scanning for malicious files
- Size limit enforcement

### Access Control
- Session-based authentication
- Admin-only access to all upload functionality
- CSRF protection
- Input sanitization

### File Storage
- Unique filename generation using UUID
- Secure file organization in separate directories
- No direct file access via URL

## Development

### Project Structure
```
wind_project/
├── app.py              # Main application entry point
├── database.py         # Database initialization
├── models.py           # SQLAlchemy models
├── routes.py           # Flask routes and handlers
├── auth.py             # Authentication utilities
├── utils.py            # File handling utilities
├── requirements.txt    # Python dependencies
├── templates/          # Jinja2 HTML templates
│   ├── base.html
│   ├── login.html
│   ├── admin/          # Admin interface templates
│   └── errors/         # Error page templates
├── static/             # CSS, JavaScript, images
│   ├── css/
│   └── js/
└── uploads/            # File storage directory
    ├── manuscripts/
    └── audio/
```

### Adding New Features
The application is designed to be modular and extensible:

1. **New file types**: Update `utils.py` with new MIME types and extensions
2. **Additional metadata**: Add fields to models in `models.py`
3. **New upload categories**: Create new models and update templates
4. **API endpoints**: Add routes in `routes.py`

### Testing
- Manual testing through the web interface
- File upload with various formats and sizes
- Authentication and access control
- Error handling and edge cases

## Production Deployment

### Security Checklist
- [ ] Change default admin credentials
- [ ] Set strong `SECRET_KEY` in environment
- [ ] Use HTTPS in production
- [ ] Configure proper database (PostgreSQL recommended)
- [ ] Set up file storage with appropriate permissions
- [ ] Configure reverse proxy (nginx recommended)
- [ ] Set up monitoring and logging

### Deployment Options
- **Heroku**: Use Heroku buildpacks for Python
- **Docker**: Create Dockerfile for containerized deployment
- **VPS**: Use gunicorn + nginx for production serving
- **Cloud Storage**: Integrate with AWS S3 or similar for file storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
4. Provide system information and logs when relevant