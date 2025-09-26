# E-Book Library - Personal Library Feature

A React Native e-book library application with a comprehensive Personal Library feature that allows users to manage their purchased books and access them offline.

## 🚀 Features

### Personal Library
- **Display Purchased Books**: View all your purchased books with detailed information
- **Book Information**: Title, author, cover image, purchase date, description, and genre
- **Sorting Options**: Sort by title, author, or purchase date
- **Advanced Filtering**: Filter by download status and genre
- **Offline Access**: Download books for offline reading
- **Visual Indicators**: Clear indicators for downloaded vs. available books
- **Responsive Design**: Works on various screen sizes with placeholder images

### UI/UX Features
- Clean, modern interface
- Pull-to-refresh functionality
- Empty states with helpful messages
- Modal-based sorting and filtering
- Visual download indicators (✓ for downloaded, ↓ for available)
- Genre tags and metadata display

## 📱 Screenshots

The Personal Library screen displays:
- Header with book count
- Sort and filter controls
- Grid/list of book cards
- Individual book details with download buttons

## 🛠 Tech Stack

- **React Native**: Mobile app framework
- **TypeScript**: Type safety and better development experience
- **AsyncStorage**: Local storage for purchased books and offline data
- **Jest**: Testing framework
- **Babel**: JavaScript compiler

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Cayla4224/wind_project.git
cd wind_project
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

## 🏃‍♂️ Running the App

Since this is a React Native app, you would typically run it on a device or simulator:

```bash
# Start Metro bundler
npm start

# Run on Android (requires Android Studio and device/emulator)
npm run android

# Run on iOS (requires Xcode and device/simulator - macOS only)
npm run ios
```

## 📚 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BookCard.tsx    # Individual book display component
│   └── SortFilterBar.tsx # Sorting and filtering controls
├── screens/            # App screens
│   └── PersonalLibraryScreen.tsx # Main library screen
├── services/           # Business logic and data management
│   └── BookService.ts  # Book management and storage service
├── types/              # TypeScript type definitions
│   └── index.ts        # Book and UI types
└── App.tsx             # Main app component
```

## 🎯 Key Components

### PersonalLibraryScreen
Main screen component that:
- Loads purchased books from storage
- Manages sorting and filtering state
- Handles book download/removal
- Provides pull-to-refresh functionality

### BookCard
Individual book display component featuring:
- Book cover (with placeholder for missing images)
- Title, author, and description
- Purchase date and genre tags
- Download/remove buttons with status indicators
- File size display for downloaded books

### SortFilterBar
Horizontal scroll bar with controls for:
- Sorting by title, author, or purchase date
- Filtering by download status and genre
- Clear all filters option
- Active filter count indicators

### BookService
Core service handling:
- Mock data initialization with 5 sample books
- AsyncStorage persistence
- Book download/removal simulation
- Sorting and filtering algorithms
- Error handling and fallbacks

## 📊 Sample Data

The app includes 5 sample books:
1. **The Great Gatsby** by F. Scott Fitzgerald (Downloaded)
2. **To Kill a Mockingbird** by Harper Lee (Not Downloaded)
3. **1984** by George Orwell (Downloaded)
4. **Pride and Prejudice** by Jane Austen (Not Downloaded)
5. **The Catcher in the Rye** by J.D. Salinger (Downloaded)

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- Book sorting functionality (by title, author, date)
- Book filtering (by download status and genre)
- Storage operations (mock AsyncStorage)
- Core service methods

## 🔧 Development

### Adding New Features
1. Define types in `src/types/index.ts`
2. Add business logic to `src/services/BookService.ts`
3. Create/update components in `src/components/`
4. Add tests in `__tests__/`

### Customizing Mock Data
Edit the `mockBooks` array in `src/services/BookService.ts` to add your own sample books.

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

*This Personal Library feature provides a complete solution for managing purchased e-books with offline capabilities, sorting, filtering, and a responsive user interface.*