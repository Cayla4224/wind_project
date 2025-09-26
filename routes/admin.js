const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkAuthenticated } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = file.fieldname === 'manuscriptFile' 
            ? 'public/uploads/manuscripts' 
            : 'public/uploads/audio';
        
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for manuscripts
const manuscriptFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.epub'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOCX, and EPUB files are allowed for manuscripts'));
    }
};

// File filter for audio files
const audioFilter = (req, file, cb) => {
    const allowedTypes = ['.mp3', '.wav', '.m4a', '.flac'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error('Only MP3, WAV, M4A, and FLAC files are allowed for audio'));
    }
};

const manuscriptUpload = multer({ 
    storage, 
    fileFilter: manuscriptFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const audioUpload = multer({ 
    storage, 
    fileFilter: audioFilter,
    limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit
});

// Login page
router.get('/login', checkAuthenticated, (req, res) => {
    res.render('login', { title: 'Admin Login' });
});

// Dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
    // Get counts for dashboard
    db.all(`
        SELECT 
            (SELECT COUNT(*) FROM manuscripts) as manuscriptCount,
            (SELECT COUNT(*) FROM audio_files) as audioCount
    `, (err, counts) => {
        if (err) {
            console.error('Dashboard query error:', err);
            return res.status(500).render('error', { error: 'Database error' });
        }
        
        const stats = counts[0] || { manuscriptCount: 0, audioCount: 0 };
        res.render('dashboard', { 
            title: 'Admin Dashboard',
            user: req.user,
            stats
        });
    });
});

// Manuscripts management
router.get('/manuscripts', authenticateToken, (req, res) => {
    const { category, author, search } = req.query;
    let query = 'SELECT * FROM manuscripts WHERE 1=1';
    const params = [];
    
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    
    if (author) {
        query += ' AND author LIKE ?';
        params.push(`%${author}%`);
    }
    
    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY upload_date DESC';
    
    db.all(query, params, (err, manuscripts) => {
        if (err) {
            console.error('Manuscripts query error:', err);
            return res.status(500).render('error', { error: 'Database error' });
        }
        
        // Get unique categories for filter
        db.all('SELECT DISTINCT category FROM manuscripts WHERE category IS NOT NULL', (catErr, categories) => {
            res.render('manuscripts', {
                title: 'Manage Manuscripts',
                manuscripts,
                categories: categories || [],
                filters: { category, author, search }
            });
        });
    });
});

// Audio files management
router.get('/audio', authenticateToken, (req, res) => {
    const { author, search } = req.query;
    let query = 'SELECT * FROM audio_files WHERE 1=1';
    const params = [];
    
    if (author) {
        query += ' AND author LIKE ?';
        params.push(`%${author}%`);
    }
    
    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY upload_date DESC';
    
    db.all(query, params, (err, audioFiles) => {
        if (err) {
            console.error('Audio files query error:', err);
            return res.status(500).render('error', { error: 'Database error' });
        }
        
        res.render('audio', {
            title: 'Manage Audio Files',
            audioFiles,
            filters: { author, search }
        });
    });
});

// Upload manuscript
router.post('/manuscripts/upload', authenticateToken, manuscriptUpload.single('manuscriptFile'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('description').optional().trim(),
    body('category').optional().trim()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'File is required' 
        });
    }

    const { title, author, description, category } = req.body;
    
    db.run(`
        INSERT INTO manuscripts (title, author, description, category, file_name, file_path, file_type, file_size, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        title,
        author,
        description || null,
        category || null,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        req.user.id
    ], function(err) {
        if (err) {
            console.error('Manuscript insert error:', err);
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Manuscript uploaded successfully',
            manuscriptId: this.lastID
        });
    });
});

// Upload audio file
router.post('/audio/upload', authenticateToken, audioUpload.single('audioFile'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('description').optional().trim(),
    body('duration').optional().trim()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'File is required' 
        });
    }

    const { title, author, description, duration } = req.body;
    
    // TODO: Implement cloud storage upload here (AWS S3)
    // For now, we'll store files locally
    
    db.run(`
        INSERT INTO audio_files (title, author, description, duration, file_name, file_path, file_type, file_size, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        title,
        author,
        description || null,
        duration || null,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        req.user.id
    ], function(err) {
        if (err) {
            console.error('Audio file insert error:', err);
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Audio file uploaded successfully',
            audioId: this.lastID
        });
    });
});

// Delete manuscript
router.delete('/manuscripts/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    // Get file path before deleting record
    db.get('SELECT file_path FROM manuscripts WHERE id = ?', [id], (err, manuscript) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (!manuscript) {
            return res.status(404).json({ success: false, message: 'Manuscript not found' });
        }
        
        // Delete from database
        db.run('DELETE FROM manuscripts WHERE id = ?', [id], function(deleteErr) {
            if (deleteErr) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            // Delete physical file
            if (fs.existsSync(manuscript.file_path)) {
                fs.unlinkSync(manuscript.file_path);
            }
            
            res.json({ success: true, message: 'Manuscript deleted successfully' });
        });
    });
});

// Delete audio file
router.delete('/audio/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    // Get file path before deleting record
    db.get('SELECT file_path FROM audio_files WHERE id = ?', [id], (err, audioFile) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (!audioFile) {
            return res.status(404).json({ success: false, message: 'Audio file not found' });
        }
        
        // Delete from database
        db.run('DELETE FROM audio_files WHERE id = ?', [id], function(deleteErr) {
            if (deleteErr) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            // Delete physical file
            if (fs.existsSync(audioFile.file_path)) {
                fs.unlinkSync(audioFile.file_path);
            }
            
            res.json({ success: true, message: 'Audio file deleted successfully' });
        });
    });
});

module.exports = router;