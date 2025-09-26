const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ebook_store.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'reader' CHECK(role IN ('reader', 'author', 'admin')),
        subscription_type TEXT DEFAULT 'free' CHECK(subscription_type IN ('free', 'basic', 'premium')),
        subscription_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Books table
    db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        description TEXT,
        genre TEXT,
        isbn TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        is_free BOOLEAN DEFAULT 0,
        cover_image TEXT,
        ebook_file TEXT,
        audiobook_file TEXT,
        has_audiobook BOOLEAN DEFAULT 0,
        published_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
    )`);

    // User book library (purchases/access)
    db.run(`CREATE TABLE IF NOT EXISTS user_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        access_type TEXT CHECK(access_type IN ('purchased', 'subscription', 'free')),
        purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (book_id) REFERENCES books (id),
        UNIQUE(user_id, book_id)
    )`);

    // Subscriptions table
    db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration_months INTEGER NOT NULL,
        features TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default subscription plans
    db.run(`INSERT OR IGNORE INTO subscriptions (id, name, description, price, duration_months, features) VALUES 
        (1, 'Free', 'Access to free books only', 0, 0, 'Free books only'),
        (2, 'Basic', 'Access to premium books', 9.99, 1, 'All books, No audiobooks'),
        (3, 'Premium', 'Full access including audiobooks', 19.99, 1, 'All books, Audiobooks, Priority support')`);

    // Create an admin user for testing
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`INSERT OR IGNORE INTO users (id, username, email, password, role, subscription_type) VALUES 
        (1, 'admin', 'admin@ebookstore.com', ?, 'admin', 'premium')`, [adminPassword]);

    console.log('Database initialized successfully');
});

module.exports = db;