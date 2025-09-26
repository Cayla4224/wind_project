const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database path
const dbPath = path.join(__dirname, '..', 'database.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table for admin authentication
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        
        // Manuscripts table
        db.run(`
            CREATE TABLE IF NOT EXISTS manuscripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT,
                category TEXT,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                uploaded_by INTEGER,
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating manuscripts table:', err);
                return;
            }
            
            // Audio files table
            db.run(`
                CREATE TABLE IF NOT EXISTS audio_files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    description TEXT,
                    duration TEXT,
                    file_name TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    cloud_url TEXT,
                    file_type TEXT NOT NULL,
                    file_size INTEGER,
                    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    uploaded_by INTEGER,
                    FOREIGN KEY (uploaded_by) REFERENCES users(id)
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating audio_files table:', err);
                    return;
                }
                
                // Create default admin user after all tables are created
                createDefaultAdmin();
            });
        });
    });
}

// Create default admin user
function createDefaultAdmin() {
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';
    
    db.get('SELECT * FROM users WHERE username = ?', [defaultUsername], (err, row) => {
        if (err) {
            console.error('Error checking for admin user:', err);
            return;
        }
        
        if (!row) {
            const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
            db.run(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [defaultUsername, hashedPassword, 'admin'],
                function(err) {
                    if (err) {
                        console.error('Error creating default admin:', err);
                    } else {
                        console.log('Default admin user created (username: admin, password: admin123)');
                    }
                }
            );
        }
    });
}

module.exports = db;