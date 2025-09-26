const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.adminToken;

    if (!token) {
        return res.redirect('/admin/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.clearCookie('adminToken');
            return res.redirect('/admin/login');
        }
        
        // Verify user still exists in database
        db.get('SELECT * FROM users WHERE id = ? AND role = ?', [user.id, 'admin'], (dbErr, dbUser) => {
            if (dbErr || !dbUser) {
                res.clearCookie('adminToken');
                return res.redirect('/admin/login');
            }
            
            req.user = user;
            next();
        });
    });
};

// Middleware to check if user is already authenticated
const checkAuthenticated = (req, res, next) => {
    const token = req.cookies.adminToken;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                return res.redirect('/admin/dashboard');
            }
        });
    }
    
    next();
};

module.exports = {
    authenticateToken,
    checkAuthenticated,
    JWT_SECRET
};