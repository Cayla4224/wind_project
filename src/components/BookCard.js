import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2; // Two columns with padding

const BookCard = ({book, onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(book)}>
      <View style={styles.imageContainer}>
        <Image source={{uri: book.thumbnail}} style={styles.thumbnail} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{book.price}</Text>
          <Text style={styles.rating}>★ {book.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  thumbnail: {
    width: 100,
    height: 130,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 10,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    minHeight: 34, // Ensure consistent height for 2 lines
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rating: {
    fontSize: 12,
    color: '#FF9500',
  },
});

export default BookCard;
