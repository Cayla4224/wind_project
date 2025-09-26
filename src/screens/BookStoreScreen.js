import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import BookCard from '../components/BookCard';
import CategoryFilter from '../components/CategoryFilter';
import {BOOKS, CATEGORIES} from '../data/books';

const BookStoreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter books based on search query and selected category
  const filteredBooks = useMemo(() => {
    let filtered = BOOKS;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleBookPress = book => {
    Alert.alert(
      book.title,
      `Author: ${book.author}\nCategory: ${book.category}\nPrice: ${book.price}\nRating: ${book.rating} stars\n\n${book.description}`,
      [
        {text: 'Close', style: 'cancel'},
        {text: 'Add to Cart', style: 'default'},
      ],
    );
  };

  const renderBookItem = ({item, index}) => (
    <View style={[styles.bookItem, index % 2 === 1 && styles.rightColumn]}>
      <BookCard book={item} onPress={handleBookPress} />
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>E-Bookstore</Text>
        <Text style={styles.headerSubtitle}>
          {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors, or keywords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No books found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Try adjusting your search or category filter
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  bookItem: {
    flex: 0.48,
  },
  rightColumn: {
    marginLeft: '4%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default BookStoreScreen;
