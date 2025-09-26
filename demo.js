#!/usr/bin/env node

/**
 * Personal Library Demo
 * This script demonstrates the key functionality of the Personal Library feature
 */

console.log('🚀 E-Book Personal Library Demo');
console.log('=====================================\n');

// Simulate the BookService functionality
const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    purchaseDate: '2024-01-15',
    isDownloaded: true,
    genre: 'Classic Literature',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    purchaseDate: '2024-02-20',
    isDownloaded: false,
    genre: 'Classic Literature',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    purchaseDate: '2024-03-10',
    isDownloaded: true,
    genre: 'Science Fiction',
  },
];

console.log('📚 Sample Books in Library:');
console.log('============================');
mockBooks.forEach((book, index) => {
  const status = book.isDownloaded ? '✅ Downloaded' : '⬇️ Available to Download';
  console.log(`${index + 1}. "${book.title}" by ${book.author}`);
  console.log(`   Genre: ${book.genre}`);
  console.log(`   Purchased: ${book.purchaseDate}`);
  console.log(`   Status: ${status}\n`);
});

// Demonstrate sorting functionality
const sortByTitle = (books) => [...books].sort((a, b) => a.title.localeCompare(b.title));
const sortByAuthor = (books) => [...books].sort((a, b) => a.author.localeCompare(b.author));
const sortByDate = (books) => [...books].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

console.log('🔄 Sorting Demonstration:');
console.log('==========================');

console.log('\n📖 Sorted by Title:');
sortByTitle(mockBooks).forEach((book, index) => {
  console.log(`  ${index + 1}. ${book.title}`);
});

console.log('\n👨‍💼 Sorted by Author:');
sortByAuthor(mockBooks).forEach((book, index) => {
  console.log(`  ${index + 1}. ${book.author} - ${book.title}`);
});

console.log('\n📅 Sorted by Purchase Date (newest first):');
sortByDate(mockBooks).forEach((book, index) => {
  console.log(`  ${index + 1}. ${book.title} (${book.purchaseDate})`);
});

// Demonstrate filtering
console.log('\n🔍 Filtering Demonstration:');
console.log('============================');

const downloadedBooks = mockBooks.filter(book => book.isDownloaded);
console.log('\n✅ Downloaded Books:');
downloadedBooks.forEach((book, index) => {
  console.log(`  ${index + 1}. ${book.title}`);
});

const notDownloadedBooks = mockBooks.filter(book => !book.isDownloaded);
console.log('\n⬇️ Available for Download:');
notDownloadedBooks.forEach((book, index) => {
  console.log(`  ${index + 1}. ${book.title}`);
});

const classicBooks = mockBooks.filter(book => book.genre === 'Classic Literature');
console.log('\n📜 Classic Literature:');
classicBooks.forEach((book, index) => {
  console.log(`  ${index + 1}. ${book.title} by ${book.author}`);
});

// Summary
console.log('\n📊 Library Statistics:');
console.log('=======================');
console.log(`Total Books: ${mockBooks.length}`);
console.log(`Downloaded: ${downloadedBooks.length}`);
console.log(`Available to Download: ${notDownloadedBooks.length}`);
console.log(`Classic Literature: ${classicBooks.length}`);

console.log('\n🎯 Key Features Demonstrated:');
console.log('==============================');
console.log('✓ Book display with metadata');
console.log('✓ Download status indicators');
console.log('✓ Sorting by title, author, and date');
console.log('✓ Filtering by download status');
console.log('✓ Filtering by genre');
console.log('✓ Statistics and counts');

console.log('\n🚀 Ready to run the full React Native app!');
console.log('   Use: npm start (then npm run android/ios)');