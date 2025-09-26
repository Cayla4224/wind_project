import AsyncStorage from '@react-native-async-storage/async-storage';
import {Book} from '../types';

const BOOKS_STORAGE_KEY = 'purchased_books';
const DOWNLOADED_BOOKS_KEY = 'downloaded_books';

// Mock data for demonstration
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    purchaseDate: '2024-01-15',
    isDownloaded: true,
    description: 'A classic American novel set in the Jazz Age.',
    genre: 'Classic Literature',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    purchaseDate: '2024-02-20',
    isDownloaded: false,
    description: 'A gripping tale of racial injustice and childhood innocence.',
    genre: 'Classic Literature',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    purchaseDate: '2024-03-10',
    isDownloaded: true,
    description: 'A dystopian social science fiction novel.',
    genre: 'Science Fiction',
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    purchaseDate: '2024-01-05',
    isDownloaded: false,
    description: 'A romantic novel of manners.',
    genre: 'Romance',
  },
  {
    id: '5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    purchaseDate: '2024-02-28',
    isDownloaded: true,
    description: 'A coming-of-age story in New York.',
    genre: 'Coming of Age',
  },
];

export class BookService {
  static async getPurchasedBooks(): Promise<Book[]> {
    try {
      const stored = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with mock data if no stored data
      await this.savePurchasedBooks(mockBooks);
      return mockBooks;
    } catch (error) {
      console.error('Error fetching purchased books:', error);
      return mockBooks;
    }
  }

  static async savePurchasedBooks(books: Book[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving purchased books:', error);
    }
  }

  static async downloadBook(bookId: string): Promise<boolean> {
    try {
      const books = await this.getPurchasedBooks();
      const bookIndex = books.findIndex(book => book.id === bookId);
      
      if (bookIndex !== -1) {
        // Simulate download process
        books[bookIndex].isDownloaded = true;
        books[bookIndex].filePath = `/downloads/book_${bookId}.epub`;
        books[bookIndex].fileSize = Math.floor(Math.random() * 5000000) + 1000000; // Random size between 1-5MB
        
        await this.savePurchasedBooks(books);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error downloading book:', error);
      return false;
    }
  }

  static async removeDownload(bookId: string): Promise<boolean> {
    try {
      const books = await this.getPurchasedBooks();
      const bookIndex = books.findIndex(book => book.id === bookId);
      
      if (bookIndex !== -1) {
        books[bookIndex].isDownloaded = false;
        books[bookIndex].filePath = undefined;
        books[bookIndex].fileSize = undefined;
        
        await this.savePurchasedBooks(books);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing download:', error);
      return false;
    }
  }

  static sortBooks(books: Book[], sortBy: 'title' | 'author' | 'purchaseDate'): Book[] {
    return [...books].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'purchaseDate':
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        default:
          return 0;
      }
    });
  }

  static filterBooks(books: Book[], filters: {[key: string]: boolean}): Book[] {
    return books.filter(book => {
      // Filter by download status
      if (filters.downloaded && !book.isDownloaded) return false;
      if (filters.notDownloaded && book.isDownloaded) return false;
      
      // Filter by genre
      if (filters.genre && book.genre && !filters[book.genre]) return false;
      
      return true;
    });
  }
}