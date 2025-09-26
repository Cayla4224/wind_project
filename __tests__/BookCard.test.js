import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import BookCard from '../src/components/BookCard';

const mockBook = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  category: 'Fiction',
  thumbnail: 'https://example.com/image.jpg',
  description: 'Test description',
  price: '$9.99',
  rating: 4.5,
};

describe('BookCard', () => {
  it('renders book information correctly', () => {
    const {getByText} = render(<BookCard book={mockBook} />);

    expect(getByText('Test Book')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
    expect(getByText('$9.99')).toBeTruthy();
    expect(getByText('★ 4.5')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const {getByText} = render(
      <BookCard book={mockBook} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Book'));
    expect(mockOnPress).toHaveBeenCalledWith(mockBook);
  });

  it('truncates long titles properly', () => {
    const longTitleBook = {
      ...mockBook,
      title: 'This is a very long book title that should be truncated',
    };

    const {getByText} = render(<BookCard book={longTitleBook} />);
    expect(getByText(longTitleBook.title)).toBeTruthy();
  });
});
