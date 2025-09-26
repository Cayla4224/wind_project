const express = require('express');
const db = require('../database/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all subscription plans
router.get('/', (req, res) => {
    db.all(
        'SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY price ASC',
        [],
        (err, subscriptions) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({ subscriptions });
        }
    );
});

// Get specific subscription plan
router.get('/:id', (req, res) => {
    const subscriptionId = req.params.id;

    db.get(
        'SELECT * FROM subscriptions WHERE id = ? AND is_active = 1',
        [subscriptionId],
        (err, subscription) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!subscription) {
                return res.status(404).json({ error: 'Subscription plan not found' });
            }

            res.json({ subscription });
        }
    );
});

// Subscribe to a plan
router.post('/:id/subscribe', authenticateToken, (req, res) => {
    const subscriptionId = req.params.id;
    const userId = req.user.id;

    // Get subscription details
    db.get(
        'SELECT * FROM subscriptions WHERE id = ? AND is_active = 1',
        [subscriptionId],
        (err, subscription) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!subscription) {
                return res.status(404).json({ error: 'Subscription plan not found' });
            }

            // Calculate expiry date
            let subscription_expires = null;
            let subscription_type = 'free';

            if (subscription.name.toLowerCase() === 'basic') {
                subscription_type = 'basic';
            } else if (subscription.name.toLowerCase() === 'premium') {
                subscription_type = 'premium';
            }

            if (subscription_type !== 'free') {
                const now = new Date();
                subscription_expires = new Date(now.setMonth(now.getMonth() + subscription.duration_months));
            }

            // Update user subscription
            db.run(
                'UPDATE users SET subscription_type = ?, subscription_expires = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [subscription_type, subscription_expires, userId],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update subscription' });
                    }

                    res.json({
                        message: 'Subscription updated successfully',
                        subscription: {
                            type: subscription_type,
                            expires: subscription_expires,
                            plan: subscription.name
                        }
                    });
                }
            );
        }
    );
});

// Cancel subscription
router.post('/cancel', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.run(
        'UPDATE users SET subscription_type = "free", subscription_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to cancel subscription' });
            }

            res.json({ message: 'Subscription cancelled successfully' });
        }
    );
});

// Get user's subscription status
router.get('/status/my', authenticateToken, (req, res) => {
    db.get(
        'SELECT subscription_type, subscription_expires FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if subscription is expired
            let isActive = true;
            let daysRemaining = null;

            if (user.subscription_expires) {
                const now = new Date();
                const expiryDate = new Date(user.subscription_expires);
                isActive = now <= expiryDate;
                
                if (isActive) {
                    const timeDiff = expiryDate.getTime() - now.getTime();
                    daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                }
            }

            res.json({
                subscription: {
                    type: user.subscription_type,
                    expires: user.subscription_expires,
                    isActive,
                    daysRemaining
                }
            });
        }
    );
});

// Create new subscription plan (admin only)
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
    const { name, description, price, duration_months, features } = req.body;

    if (!name || !price || !duration_months) {
        return res.status(400).json({ error: 'Name, price, and duration are required' });
    }

    db.run(
        'INSERT INTO subscriptions (name, description, price, duration_months, features) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, duration_months, features],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create subscription plan' });
            }

            res.status(201).json({
                message: 'Subscription plan created successfully',
                subscriptionId: this.lastID
            });
        }
    );
});

// Update subscription plan (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
    const subscriptionId = req.params.id;
    const { name, description, price, duration_months, features, is_active } = req.body;

    const updates = [];
    const params = [];

    if (name) {
        updates.push('name = ?');
        params.push(name);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }
    if (price !== undefined) {
        updates.push('price = ?');
        params.push(price);
    }
    if (duration_months !== undefined) {
        updates.push('duration_months = ?');
        params.push(duration_months);
    }
    if (features !== undefined) {
        updates.push('features = ?');
        params.push(features);
    }
    if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(subscriptionId);

    db.run(
        `UPDATE subscriptions SET ${updates.join(', ')} WHERE id = ?`,
        params,
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update subscription plan' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Subscription plan not found' });
            }

            res.json({ message: 'Subscription plan updated successfully' });
        }
    );
});

// Delete subscription plan (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
    const subscriptionId = req.params.id;

    db.run(
        'UPDATE subscriptions SET is_active = 0 WHERE id = ?',
        [subscriptionId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to deactivate subscription plan' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Subscription plan not found' });
            }

            res.json({ message: 'Subscription plan deactivated successfully' });
        }
    );
});

module.exports = router;