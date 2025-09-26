import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Book, SortOption} from '../types';
import {BookService} from '../services/BookService';
import BookCard from '../components/BookCard';
import SortFilterBar from '../components/SortFilterBar';

const PersonalLibraryScreen: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'purchaseDate'>('purchaseDate');
  const [filters, setFilters] = useState({
    downloaded: false,
    notDownloaded: false,
    'Classic Literature': false,
    'Science Fiction': false,
    'Romance': false,
    'Coming of Age': false,
  });

  const loadBooks = useCallback(async () => {
    try {
      const purchasedBooks = await BookService.getPurchasedBooks();
      setBooks(purchasedBooks);
      applyFiltersAndSort(purchasedBooks, sortBy, filters);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Error', 'Failed to load your library');
    } finally {
      setLoading(false);
    }
  }, [sortBy, filters]);

  const applyFiltersAndSort = (
    bookList: Book[],
    sortOption: 'title' | 'author' | 'purchaseDate',
    filterOptions: typeof filters,
  ) => {
    let processed = BookService.filterBooks(bookList, filterOptions);
    processed = BookService.sortBooks(processed, sortOption);
    setFilteredBooks(processed);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleDownload = async (bookId: string) => {
    try {
      const success = await BookService.downloadBook(bookId);
      if (success) {
        Alert.alert('Success', 'Book downloaded successfully!');
        await loadBooks();
      } else {
        Alert.alert('Error', 'Failed to download book');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download book');
    }
  };

  const handleRemoveDownload = async (bookId: string) => {
    try {
      const success = await BookService.removeDownload(bookId);
      if (success) {
        Alert.alert('Success', 'Download removed successfully!');
        await loadBooks();
      } else {
        Alert.alert('Error', 'Failed to remove download');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove download');
    }
  };

  const handleSortChange = (newSort: 'title' | 'author' | 'purchaseDate') => {
    setSortBy(newSort);
    applyFiltersAndSort(books, newSort, filters);
  };

  const handleFilterChange = (filterKey: string, active: boolean) => {
    const newFilters = {...filters, [filterKey]: active};
    setFilters(newFilters);
    applyFiltersAndSort(books, sortBy, newFilters);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const renderBookItem = ({item}: {item: Book}) => (
    <BookCard
      book={item}
      onDownload={handleDownload}
      onRemoveDownload={handleRemoveDownload}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Books Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {Object.values(filters).some(f => f)
          ? 'Try adjusting your filters'
          : 'Your library is empty'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personal Library</Text>
        <Text style={styles.subtitle}>
          {filteredBooks.length} of {books.length} books
        </Text>
      </View>

      <SortFilterBar
        sortBy={sortBy}
        filters={filters}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default PersonalLibraryScreen;