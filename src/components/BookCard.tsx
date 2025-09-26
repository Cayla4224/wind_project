import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Book} from '../types';

interface BookCardProps {
  book: Book;
  onDownload: (bookId: string) => void;
  onRemoveDownload: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onDownload,
  onRemoveDownload,
}) => {
  const handleDownloadPress = () => {
    if (book.isDownloaded) {
      Alert.alert(
        'Remove Download',
        'Are you sure you want to remove this downloaded book?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Remove', style: 'destructive', onPress: () => onRemoveDownload(book.id)},
        ],
      );
    } else {
      onDownload(book.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.coverContainer}>
        {book.coverImage ? (
          <Image source={{uri: book.coverImage}} style={styles.cover} />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
        
        {/* Download status indicator */}
        <View style={[
          styles.downloadIndicator,
          {backgroundColor: book.isDownloaded ? '#4CAF50' : '#FFC107'}
        ]}>
          <Text style={styles.downloadIndicatorText}>
            {book.isDownloaded ? '✓' : '↓'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          by {book.author}
        </Text>
        
        {book.description && (
          <Text style={styles.description} numberOfLines={2}>
            {book.description}
          </Text>
        )}
        
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Purchased: {formatDate(book.purchaseDate)}
          </Text>
          {book.genre && (
            <Text style={styles.genreTag}>
              {book.genre}
            </Text>
          )}
        </View>

        {book.isDownloaded && book.fileSize && (
          <Text style={styles.fileSize}>
            Downloaded • {formatFileSize(book.fileSize)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.downloadButton,
          {backgroundColor: book.isDownloaded ? '#FF5722' : '#007AFF'}
        ]}
        onPress={handleDownloadPress}
      >
        <Text style={styles.downloadButtonText}>
          {book.isDownloaded ? 'Remove' : 'Download'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coverContainer: {
    position: 'relative',
    marginRight: 16,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  downloadIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  downloadIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
  },
  genreTag: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  downloadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    height: 36,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookCard;