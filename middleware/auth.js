const jwt = require('jsonwebtoken');
const db = require('../database/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (Array.isArray(roles)) {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
        } else {
            if (req.user.role !== roles) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
        }
        next();
    };
};

// Middleware to check subscription access
const checkSubscriptionAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if subscription is still valid
    if (req.user.subscription_type !== 'free' && req.user.subscription_expires) {
        const now = new Date();
        const expiryDate = new Date(req.user.subscription_expires);
        
        if (now > expiryDate) {
            // Subscription expired, update user to free
            db.run('UPDATE users SET subscription_type = "free", subscription_expires = NULL WHERE id = ?', 
                [req.user.id], (err) => {
                    if (err) console.error('Error updating expired subscription:', err);
                });
            req.user.subscription_type = 'free';
        }
    }

    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    checkSubscriptionAccess,
    JWT_SECRET
};