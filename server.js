const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for now to allow inline styles/scripts
}));
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (using EJS for templating)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Install EJS if not already installed
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'node_modules', 'ejs'))) {
    console.log('Installing EJS template engine...');
    require('child_process').execSync('npm install ejs', { stdio: 'inherit' });
}

// Database initialization
const db = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Route middleware
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
    res.redirect('/admin/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Page not found' });
});

app.listen(PORT, () => {
    console.log(`E-Book Library Admin Server running on port ${PORT}`);
    console.log(`Access the admin panel at: http://localhost:${PORT}/admin/login`);
});