# Wind Project - E-Bookstore App

A React Native e-bookstore app that allows users to browse books by categories and search for specific books.

## Features

- **Book Browsing**: Display books in a responsive grid layout with thumbnails, titles, authors, prices, and ratings
- **Category Filtering**: Filter books by categories (All, Fiction, Non-Fiction, Technology, Health, Business, Science, Biography)
- **Search Functionality**: Search books by title, author, description, or category
- **Responsive Design**: Works well on different device sizes
- **Interactive UI**: Tap on books to view detailed information

## Components

### BookStoreScreen
Main screen component that includes:
- Header with app title and book count
- Search bar with real-time filtering
- Category filter bar
- Grid layout of books
- Empty state handling

### BookCard
Reusable component for displaying individual books:
- Book thumbnail image
- Title and author information
- Price and rating display
- Touch interaction support

### CategoryFilter
Horizontal scrollable category selector:
- All available categories
- Selected state highlighting
- Smooth scrolling experience

## Installation

```bash
npm install
```

## Running the App

### For React Native CLI:
```bash
# iOS
npm run ios

# Android
npm run android
```

### Development Server:
```bash
npm start
```

## Testing

Run all tests:
```bash
npm test
```

## Linting

Check code style:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint -- --fix
```

## Project Structure

```
src/
├── components/
│   ├── BookCard.js          # Individual book display component
│   └── CategoryFilter.js    # Category filtering component
├── data/
│   └── books.js            # Mock book data
└── screens/
    └── BookStoreScreen.js  # Main bookstore screen
__tests__/
├── BookCard.test.js        # BookCard component tests
├── BookStoreScreen.test.js # Main screen tests
└── CategoryFilter.test.js  # Category filter tests
```

## Mock Data

The app includes 10 sample books across different categories:
- Fiction: The Great Gatsby, To Kill a Mockingbird
- Technology: Clean Code, React Native in Action
- Non-Fiction: Sapiens
- Business: The Lean Startup
- Health: Atomic Habits, The 7 Habits of Highly Effective People
- Science: A Brief History of Time
- Biography: Steve Jobs

## Technologies Used

- React Native 0.72.0
- React 18.2.0
- Jest for testing
- React Native Testing Library
- ESLint for code quality