import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';

interface SortFilterBarProps {
  sortBy: 'title' | 'author' | 'purchaseDate';
  filters: {[key: string]: boolean};
  onSortChange: (sort: 'title' | 'author' | 'purchaseDate') => void;
  onFilterChange: (filterKey: string, active: boolean) => void;
}

const SortFilterBar: React.FC<SortFilterBarProps> = ({
  sortBy,
  filters,
  onSortChange,
  onFilterChange,
}) => {
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const sortOptions = [
    {label: 'Purchase Date', value: 'purchaseDate' as const},
    {label: 'Title', value: 'title' as const},
    {label: 'Author', value: 'author' as const},
  ];

  const filterOptions = [
    {label: 'Downloaded', key: 'downloaded'},
    {label: 'Not Downloaded', key: 'notDownloaded'},
    {label: 'Classic Literature', key: 'Classic Literature'},
    {label: 'Science Fiction', key: 'Science Fiction'},
    {label: 'Romance', key: 'Romance'},
    {label: 'Coming of Age', key: 'Coming of Age'},
  ];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Sort';
  };

  const handleSortSelect = (value: 'title' | 'author' | 'purchaseDate') => {
    onSortChange(value);
    setShowSortModal(false);
  };

  const handleFilterToggle = (key: string) => {
    onFilterChange(key, !filters[key]);
  };

  const clearAllFilters = () => {
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        onFilterChange(key, false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.sortButtonText}>
            Sort: {getSortLabel()}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.filterButtonActive
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            activeFiltersCount > 0 && styles.filterButtonTextActive
          ]}>
            Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  sortBy === option.value && styles.modalOptionActive
                ]}
                onPress={() => handleSortSelect(option.value)}
              >
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.value && styles.modalOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by</Text>
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  filters[option.key] && styles.modalOptionActive
                ]}
                onPress={() => handleFilterToggle(option.key)}
              >
                <Text style={[
                  styles.modalOptionText,
                  filters[option.key] && styles.modalOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {filters[option.key] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  arrow: {
    fontSize: 10,
    color: '#666',
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  clearButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    maxWidth: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionActive: {
    backgroundColor: '#E3F2FD',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default SortFilterBar;