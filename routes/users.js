const express = require('express');
const db = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, username, email, role, subscription_type, subscription_expires, created_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params = [];
    const countParams = [];

    if (role) {
        query += ' WHERE role = ?';
        countQuery += ' WHERE role = ?';
        params.push(role);
        countParams.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // Get total count
    db.get(countQuery, countParams, (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // Get users
        db.all(query, params, (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(countResult.total / limit),
                    totalUsers: countResult.total,
                    hasNext: parseInt(page) * limit < countResult.total,
                    hasPrev: parseInt(page) > 1
                }
            });
        });
    });
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    
    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id != userId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.get(
        'SELECT id, username, email, role, subscription_type, subscription_expires, created_at FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        }
    );
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, requireRole('admin'), (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !['reader', 'author', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Valid role is required (reader, author, admin)' });
    }

    db.run(
        'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [role, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update user role' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User role updated successfully' });
        }
    );
});

// Update user subscription (admin only)
router.put('/:id/subscription', authenticateToken, requireRole('admin'), (req, res) => {
    const userId = req.params.id;
    const { subscription_type, duration_months } = req.body;

    if (!subscription_type || !['free', 'basic', 'premium'].includes(subscription_type)) {
        return res.status(400).json({ error: 'Valid subscription type is required (free, basic, premium)' });
    }

    let subscription_expires = null;
    if (subscription_type !== 'free' && duration_months) {
        const now = new Date();
        subscription_expires = new Date(now.setMonth(now.getMonth() + parseInt(duration_months)));
    }

    db.run(
        'UPDATE users SET subscription_type = ?, subscription_expires = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [subscription_type, subscription_expires, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update user subscription' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User subscription updated successfully' });
        }
    );
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user.id == userId) {
        return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    });
});

// Get user's authored books
router.get('/:id/books', (req, res) => {
    const userId = req.params.id;

    db.all(`
        SELECT id, title, description, genre, price, is_free, has_audiobook, 
               cover_image, published_date, created_at
        FROM books 
        WHERE author_id = ?
        ORDER BY created_at DESC
    `, [userId], (err, books) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ books });
    });
});

// Get user statistics
router.get('/:id/stats', authenticateToken, (req, res) => {
    const userId = req.params.id;

    // Users can only view their own stats unless they're admin
    if (req.user.role !== 'admin' && req.user.id != userId) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const queries = {
        // Books authored (for authors)
        authored_books: 'SELECT COUNT(*) as count FROM books WHERE author_id = ?',
        // Books in library
        library_books: 'SELECT COUNT(*) as count FROM user_library WHERE user_id = ?',
        // Recent activity
        recent_purchases: `
            SELECT COUNT(*) as count 
            FROM user_library 
            WHERE user_id = ? AND purchase_date >= datetime('now', '-30 days')
        `
    };

    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.get(query, [userId], (err, result) => {
            if (!err && result) {
                stats[key] = result.count;
            } else {
                stats[key] = 0;
            }
            
            completed++;
            if (completed === total) {
                res.json({ stats });
            }
        });
    });
});

module.exports = router;