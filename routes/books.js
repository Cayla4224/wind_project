const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/database');
const { authenticateToken, requireRole, checkSubscriptionAccess } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'public/uploads/';
        
        if (file.fieldname === 'cover_image') {
            uploadPath += 'covers/';
        } else if (file.fieldname === 'ebook_file') {
            uploadPath += 'books/';
        } else if (file.fieldname === 'audiobook_file') {
            uploadPath += 'audiobooks/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'cover_image') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Only image files are allowed for cover images'));
            }
        } else if (file.fieldname === 'ebook_file') {
            const allowedTypes = ['application/pdf', 'application/epub+zip', 'text/plain'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Only PDF, EPUB, and TXT files are allowed for ebooks'));
            }
        } else if (file.fieldname === 'audiobook_file') {
            if (!file.mimetype.startsWith('audio/')) {
                return cb(new Error('Only audio files are allowed for audiobooks'));
            }
        }
        cb(null, true);
    }
});

// Get all books (with pagination and filtering)
router.get('/', (req, res) => {
    const { page = 1, limit = 12, genre, search, author_id, has_audiobook } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
        SELECT b.*, u.username as author_name 
        FROM books b 
        JOIN users u ON b.author_id = u.id 
        WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM books b WHERE 1=1';
    const params = [];
    const countParams = [];

    if (genre) {
        query += ' AND b.genre = ?';
        countQuery += ' AND b.genre = ?';
        params.push(genre);
        countParams.push(genre);
    }

    if (search) {
        query += ' AND (b.title LIKE ? OR b.description LIKE ?)';
        countQuery += ' AND (b.title LIKE ? OR b.description LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
    }

    if (author_id) {
        query += ' AND b.author_id = ?';
        countQuery += ' AND b.author_id = ?';
        params.push(author_id);
        countParams.push(author_id);
    }

    if (has_audiobook === 'true') {
        query += ' AND b.has_audiobook = 1';
        countQuery += ' AND b.has_audiobook = 1';
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // Get total count
    db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Get books
        db.all(query, params, (err, books) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                books,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(countResult.total / limit),
                    totalBooks: countResult.total,
                    hasNext: parseInt(page) * limit < countResult.total,
                    hasPrev: parseInt(page) > 1
                }
            });
        });
    });
});

// Get single book
router.get('/:id', (req, res) => {
    const bookId = req.params.id;

    db.get(`
        SELECT b.*, u.username as author_name, u.email as author_email
        FROM books b 
        JOIN users u ON b.author_id = u.id 
        WHERE b.id = ?
    `, [bookId], (err, book) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ book });
    });
});

// Create new book (authors only)
router.post('/', authenticateToken, requireRole(['author', 'admin']), upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'ebook_file', maxCount: 1 },
    { name: 'audiobook_file', maxCount: 1 }
]), (req, res) => {
    try {
        const {
            title,
            description,
            genre,
            isbn,
            price = 0,
            is_free = 0,
            published_date
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const cover_image = req.files['cover_image'] ? req.files['cover_image'][0].filename : null;
        const ebook_file = req.files['ebook_file'] ? req.files['ebook_file'][0].filename : null;
        const audiobook_file = req.files['audiobook_file'] ? req.files['audiobook_file'][0].filename : null;
        const has_audiobook = audiobook_file ? 1 : 0;

        db.run(`
            INSERT INTO books (
                title, author_id, description, genre, isbn, price, is_free,
                cover_image, ebook_file, audiobook_file, has_audiobook, published_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, req.user.id, description, genre, isbn, price, is_free,
            cover_image, ebook_file, audiobook_file, has_audiobook, published_date
        ], function(err) {
            if (err) {
                console.error('Error creating book:', err);
                return res.status(500).json({ error: 'Failed to create book' });
            }

            res.status(201).json({
                message: 'Book created successfully',
                bookId: this.lastID
            });
        });
    } catch (error) {
        console.error('Book creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update book (author or admin only)
router.put('/:id', authenticateToken, requireRole(['author', 'admin']), upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'ebook_file', maxCount: 1 },
    { name: 'audiobook_file', maxCount: 1 }
]), (req, res) => {
    const bookId = req.params.id;
    const {
        title,
        description,
        genre,
        isbn,
        price,
        is_free,
        published_date
    } = req.body;

    // First check if book exists and user has permission
    db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (req.user.role !== 'admin' && book.author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own books' });
        }

        // Prepare update fields
        const updates = [];
        const params = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description) {
            updates.push('description = ?');
            params.push(description);
        }
        if (genre) {
            updates.push('genre = ?');
            params.push(genre);
        }
        if (isbn) {
            updates.push('isbn = ?');
            params.push(isbn);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            params.push(price);
        }
        if (is_free !== undefined) {
            updates.push('is_free = ?');
            params.push(is_free);
        }
        if (published_date) {
            updates.push('published_date = ?');
            params.push(published_date);
        }

        // Handle file updates
        if (req.files['cover_image']) {
            updates.push('cover_image = ?');
            params.push(req.files['cover_image'][0].filename);
        }
        if (req.files['ebook_file']) {
            updates.push('ebook_file = ?');
            params.push(req.files['ebook_file'][0].filename);
        }
        if (req.files['audiobook_file']) {
            updates.push('audiobook_file = ?, has_audiobook = 1');
            params.push(req.files['audiobook_file'][0].filename);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(bookId);

        if (updates.length === 1) { // Only timestamp update
            return res.status(400).json({ error: 'No fields to update' });
        }

        const query = `UPDATE books SET ${updates.join(', ')} WHERE id = ?`;

        db.run(query, params, function(err) {
            if (err) {
                console.error('Error updating book:', err);
                return res.status(500).json({ error: 'Failed to update book' });
            }

            res.json({ message: 'Book updated successfully' });
        });
    });
});

// Delete book (author or admin only)
router.delete('/:id', authenticateToken, requireRole(['author', 'admin']), (req, res) => {
    const bookId = req.params.id;

    // First check if book exists and user has permission
    db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (req.user.role !== 'admin' && book.author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own books' });
        }

        // Delete associated files
        const filesToDelete = [book.cover_image, book.ebook_file, book.audiobook_file].filter(Boolean);
        filesToDelete.forEach(file => {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', 
                file.includes('cover') ? 'covers' : 
                file.includes('audiobook') ? 'audiobooks' : 'books', file);
            
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        });

        db.run('DELETE FROM books WHERE id = ?', [bookId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete book' });
            }

            res.json({ message: 'Book deleted successfully' });
        });
    });
});

// Get user's library
router.get('/library/my', authenticateToken, checkSubscriptionAccess, (req, res) => {
    const query = `
        SELECT b.*, u.username as author_name, ul.access_type, ul.purchase_date
        FROM user_library ul
        JOIN books b ON ul.book_id = b.id
        JOIN users u ON b.author_id = u.id
        WHERE ul.user_id = ?
        ORDER BY ul.purchase_date DESC
    `;

    db.all(query, [req.user.id], (err, books) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ books });
    });
});

// Add book to user's library (purchase or subscription access)
router.post('/:id/access', authenticateToken, checkSubscriptionAccess, (req, res) => {
    const bookId = req.params.id;
    const { access_type = 'purchased' } = req.body;

    // Check if book exists
    db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check access rights
        if (!book.is_free && req.user.subscription_type === 'free' && access_type !== 'purchased') {
            return res.status(403).json({ error: 'This book requires a subscription or purchase' });
        }

        // Add to user library
        db.run(`
            INSERT OR IGNORE INTO user_library (user_id, book_id, access_type)
            VALUES (?, ?, ?)
        `, [req.user.id, bookId, access_type], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to add book to library' });
            }

            res.json({ message: 'Book added to your library successfully' });
        });
    });
});

module.exports = router;