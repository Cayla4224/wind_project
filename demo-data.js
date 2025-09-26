// Demo data script to populate the database with sample books
const db = require('./database/database');
const bcrypt = require('bcryptjs');

async function populateDemoData() {
    console.log('Adding demo data...');
    
    // Create demo authors
    const authorPassword = bcrypt.hashSync('password123', 10);
    
    // Demo authors
    const authors = [
        { username: 'jane_austen', email: 'jane@demo.com', password: authorPassword, role: 'author' },
        { username: 'mark_twain', email: 'mark@demo.com', password: authorPassword, role: 'author' },
        { username: 'agatha_christie', email: 'agatha@demo.com', password: authorPassword, role: 'author' }
    ];
    
    // Create demo readers
    const readerPassword = bcrypt.hashSync('reader123', 10);
    const readers = [
        { username: 'book_lover', email: 'reader@demo.com', password: readerPassword, role: 'reader', subscription_type: 'premium' },
        { username: 'casual_reader', email: 'casual@demo.com', password: readerPassword, role: 'reader', subscription_type: 'basic' }
    ];
    
    // Insert authors
    for (const author of authors) {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [author.username, author.email, author.password, author.role],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
    
    // Insert readers
    for (const reader of readers) {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO users (username, email, password, role, subscription_type) VALUES (?, ?, ?, ?, ?)',
                [reader.username, reader.email, reader.password, reader.role, reader.subscription_type],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
    
    // Get author IDs
    const authorIds = await new Promise((resolve, reject) => {
        db.all('SELECT id, username FROM users WHERE role = "author"', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
    
    // Demo books
    const books = [
        {
            title: 'Pride and Prejudice',
            author_id: authorIds.find(a => a.username === 'jane_austen')?.id || 2,
            description: 'A romantic novel of manners written by Jane Austen. The story follows Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage.',
            genre: 'Romance',
            isbn: '978-0-14-143951-8',
            price: 9.99,
            is_free: 0,
            published_date: '1813-01-28'
        },
        {
            title: 'Emma',
            author_id: authorIds.find(a => a.username === 'jane_austen')?.id || 2,
            description: 'A novel about youthful hubris and romantic misunderstandings. Emma Woodhouse is a young, beautiful, witty, and privileged woman who is also spoiled, headstrong, and self-satisfied.',
            genre: 'Romance',
            isbn: '978-0-14-143969-3',
            price: 8.99,
            is_free: 0,
            published_date: '1815-12-23'
        },
        {
            title: 'The Adventures of Tom Sawyer',
            author_id: authorIds.find(a => a.username === 'mark_twain')?.id || 3,
            description: 'The story chronicles the adventures of Tom Sawyer, a mischievous boy growing up along the Mississippi River.',
            genre: 'Fiction',
            isbn: '978-0-14-243717-4',
            price: 0,
            is_free: 1,
            published_date: '1876-01-01'
        },
        {
            title: 'Adventures of Huckleberry Finn',
            author_id: authorIds.find(a => a.username === 'mark_twain')?.id || 3,
            description: 'The story follows Huck Finn as he travels down the Mississippi River with a runaway slave named Jim.',
            genre: 'Fiction',
            isbn: '978-0-14-243714-3',
            price: 12.99,
            is_free: 0,
            has_audiobook: 1,
            published_date: '1884-12-10'
        },
        {
            title: 'Murder on the Orient Express',
            author_id: authorIds.find(a => a.username === 'agatha_christie')?.id || 4,
            description: 'A detective novel featuring Hercule Poirot. The story is set on the famous train journey from Istanbul to Calais.',
            genre: 'Mystery',
            isbn: '978-0-00-712279-5',
            price: 11.99,
            is_free: 0,
            has_audiobook: 1,
            published_date: '1934-01-01'
        },
        {
            title: 'The ABC Murders',
            author_id: authorIds.find(a => a.username === 'agatha_christie')?.id || 4,
            description: 'Hercule Poirot faces a serial killer who seems to be working his way through the alphabet.',
            genre: 'Mystery',
            isbn: '978-0-00-816484-6',
            price: 0,
            is_free: 1,
            published_date: '1936-01-06'
        }
    ];
    
    // Insert books
    for (const book of books) {
        await new Promise((resolve, reject) => {
            db.run(`
                INSERT OR IGNORE INTO books (
                    title, author_id, description, genre, isbn, price, is_free, 
                    has_audiobook, published_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                book.title, book.author_id, book.description, book.genre, book.isbn,
                book.price, book.is_free, book.has_audiobook || 0, book.published_date
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }
    
    console.log('Demo data added successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@ebookstore.com / admin123');
    console.log('Authors: jane@demo.com, mark@demo.com, agatha@demo.com / password123');
    console.log('Readers: reader@demo.com, casual@demo.com / reader123');
    console.log('\nSample books have been added to the database.');
}

// Run if called directly
if (require.main === module) {
    populateDemoData()
        .then(() => {
            console.log('Demo data population completed!');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error populating demo data:', err);
            process.exit(1);
        });
}

module.exports = { populateDemoData };