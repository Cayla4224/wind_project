const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }

    const { username, password } = req.body;

    // Find user in database
    db.get(
        'SELECT * FROM users WHERE username = ? AND role = ?',
        [username, 'admin'],
        (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Internal server error' 
                });
            }

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }

            // Verify password
            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials' 
                });
            }

            // Create JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie
            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({ 
                success: true, 
                message: 'Login successful',
                redirectUrl: '/admin/dashboard'
            });
        }
    );
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ 
        success: true, 
        message: 'Logged out successfully',
        redirectUrl: '/admin/login'
    });
});

module.exports = router;