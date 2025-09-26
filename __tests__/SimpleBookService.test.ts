import {BookService} from '../src/services/BookService';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const mockBooks = [
  {
    id: '1',
    title: 'Book A',
    author: 'Author A',
    purchaseDate: '2024-01-15',
    isDownloaded: false,
    genre: 'Fiction',
  },
  {
    id: '2',
    title: 'Book B',
    author: 'Author B',
    purchaseDate: '2024-02-20',
    isDownloaded: true,
    genre: 'Non-Fiction',
  },
];

describe('BookService Core Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sortBooks', () => {
    it('sorts books by title', () => {
      const sorted = BookService.sortBooks(mockBooks, 'title');
      
      expect(sorted[0].title).toBe('Book A');
      expect(sorted[1].title).toBe('Book B');
    });

    it('sorts books by author', () => {
      const sorted = BookService.sortBooks(mockBooks, 'author');
      
      expect(sorted[0].author).toBe('Author A');
      expect(sorted[1].author).toBe('Author B');
    });

    it('sorts books by purchase date (newest first)', () => {
      const sorted = BookService.sortBooks(mockBooks, 'purchaseDate');
      
      expect(sorted[0].purchaseDate).toBe('2024-02-20');
      expect(sorted[1].purchaseDate).toBe('2024-01-15');
    });
  });

  describe('filterBooks', () => {
    it('filters downloaded books', () => {
      const filtered = BookService.filterBooks(mockBooks, {downloaded: true});
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isDownloaded).toBe(true);
    });

    it('filters not downloaded books', () => {
      const filtered = BookService.filterBooks(mockBooks, {notDownloaded: true});
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isDownloaded).toBe(false);
    });

    it('returns all books when no filters applied', () => {
      const filtered = BookService.filterBooks(mockBooks, {});
      
      expect(filtered).toHaveLength(2);
    });

    it('filters by genre', () => {
      const filtered = BookService.filterBooks(mockBooks, {Fiction: true});
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].genre).toBe('Fiction');
    });
  });

  describe('getPurchasedBooks', () => {
    it('returns stored books when available', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBooks));
      
      const books = await BookService.getPurchasedBooks();
      
      expect(books).toEqual(mockBooks);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('purchased_books');
    });

    it('returns default books when no stored data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const books = await BookService.getPurchasedBooks();
      
      expect(books).toHaveLength(5); // Default mock books
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('downloadBook', () => {
    it('successfully downloads a book', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBooks));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const result = await BookService.downloadBook('1');
      
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('fails when book not found', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBooks));
      
      const result = await BookService.downloadBook('999');
      
      expect(result).toBe(false);
    });
  });
});