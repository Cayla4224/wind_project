# Wind E-Book Store

A comprehensive e-book store library with audiobooks, subscriptions, and user management features.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access Control**: Reader, Author, and Admin roles
- **Book Management**: Full CRUD operations for e-books and audiobooks
- **Subscription System**: Free, Basic, and Premium subscription tiers
- **Personal Library**: Users can build their own book collections
- **File Upload Support**: Cover images, e-book files (PDF, EPUB, TXT), and audiobook files

### User Roles

#### 📖 Readers
- Browse and search the book catalog
- Subscribe to different plans for access levels
- Build a personal library
- Read e-books and listen to audiobooks
- Manage subscription and profile

#### ✍️ Authors
- Publish and manage their books
- Upload e-book files and audiobooks
- Set pricing and availability
- View statistics and analytics
- Manage book metadata and descriptions

#### 🛡️ Administrators
- Full access to all features
- User management and role assignment
- Subscription plan management
- System oversight and maintenance

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (lightweight and portable)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system
- **UI Framework**: Custom responsive CSS with Font Awesome icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cayla4224/wind_project.git
   cd wind_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🎯 Quick Start

### Demo Account
Use this pre-created admin account to explore all features:
- **Email**: `admin@ebookstore.com`
- **Password**: `admin123`

### First Steps
1. **For Readers**: Register as a reader, browse books, and subscribe to a plan
2. **For Authors**: Register as an author, access the author dashboard, and start publishing books
3. **Explore Features**: Try uploading books, managing subscriptions, and using the library system

## 📱 Usage Guide

### Registration and Login
1. Navigate to `/login`
2. Choose between Login and Register tabs
3. For registration, select your role (Reader or Author)
4. Complete the form and submit

### Author Workflow
1. **Access Dashboard**: After login, authors are redirected to `/author`
2. **Add Books**: Click "Add New Book" to publish a new title
3. **Upload Files**: 
   - Cover image (JPG, PNG recommended: 600x800px)
   - E-book file (PDF, EPUB, or TXT)
   - Audiobook file (MP3, WAV, M4A - optional)
4. **Set Details**: Add title, description, genre, pricing, and publication info
5. **Manage Books**: Edit, update, or delete existing books from the dashboard

### Reader Experience
1. **Browse Books**: Use the home page to discover new titles
2. **Search and Filter**: Use genre filters and search functionality
3. **Subscription Plans**: Choose from Free, Basic ($9.99/month), or Premium ($19.99/month)
4. **Build Library**: Add books to your personal collection
5. **Read/Listen**: Access your books through the reader dashboard

### Subscription Tiers

| Feature | Free | Basic | Premium |
|---------|------|-------|---------|
| Free Books | ✅ | ✅ | ✅ |
| Premium Books | ❌ | ✅ | ✅ |
| Audiobooks | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

## 🗂️ Project Structure

```
wind_project/
├── database/
│   └── database.js          # SQLite database setup and initialization
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/
│   ├── css/
│   │   └── style.css        # Application styles
│   ├── js/
│   │   ├── app.js           # Main application logic
│   │   ├── auth.js          # Authentication handling
│   │   ├── author.js        # Author dashboard functionality
│   │   └── reader.js        # Reader dashboard functionality
│   ├── uploads/             # File storage directory
│   ├── index.html           # Home page
│   ├── login.html           # Login/Register page
│   ├── author.html          # Author dashboard
│   └── reader.html          # Reader dashboard
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── books.js             # Book management routes
│   ├── subscriptions.js     # Subscription management routes
│   └── users.js             # User management routes
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Books
- `GET /api/books` - Get all books (with pagination and filters)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book (authors only)
- `PUT /api/books/:id` - Update book (authors only)
- `DELETE /api/books/:id` - Delete book (authors only)
- `GET /api/books/library/my` - Get user's library
- `POST /api/books/:id/access` - Add book to library

### Subscriptions
- `GET /api/subscriptions` - Get all subscription plans
- `POST /api/subscriptions/:id/subscribe` - Subscribe to plan
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status/my` - Get subscription status

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/books` - Get user's authored books
- `GET /api/users/:id/stats` - Get user statistics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for different user types
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Restricted file types and size limits
- **Password Hashing**: Secure password storage using bcrypt

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, intuitive user interface
- **Interactive Elements**: Modals, dropdowns, and dynamic content
- **Real-time Feedback**: Toast notifications for user actions
- **Loading States**: Visual feedback during API calls

## 🚀 Future Enhancements

- **Payment Integration**: Stripe or PayPal for real subscription payments
- **Book Reader**: Enhanced e-book reader with bookmarks and notes
- **Audio Player**: Advanced audiobook player with speed control
- **Search Engine**: Full-text search across book content
- **Reviews and Ratings**: User review system
- **Email Notifications**: Account and subscription notifications
- **Analytics Dashboard**: Detailed analytics for authors and admins
- **Social Features**: Book sharing and recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the GitHub repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide your environment details (OS, Node.js version, etc.)

## 🙏 Acknowledgments

- Font Awesome for the beautiful icons
- Express.js community for the excellent framework
- SQLite for the lightweight database solution
- All contributors and users of this project

---

**Happy Reading! 📚✨**