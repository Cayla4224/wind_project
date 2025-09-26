import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import BookStoreScreen from '../src/screens/BookStoreScreen';

// Mock the Alert module
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert = {
    alert: jest.fn(),
  };
  return RN;
});

describe('BookStoreScreen', () => {
  it('renders header correctly', () => {
    const {getByText, getByPlaceholderText} = render(<BookStoreScreen />);

    expect(getByText('E-Bookstore')).toBeTruthy();
    expect(getByPlaceholderText('Search books, authors, or keywords...')).toBeTruthy();
  });

  it('displays books initially', () => {
    const {getByText} = render(<BookStoreScreen />);

    // Check if some books are displayed
    expect(getByText('The Great Gatsby')).toBeTruthy();
    expect(getByText('Clean Code')).toBeTruthy();
  });

  it('filters books by search query', () => {
    const {getByPlaceholderText, getByText, queryByText} = render(<BookStoreScreen />);

    const searchInput = getByPlaceholderText('Search books, authors, or keywords...');
    fireEvent.changeText(searchInput, 'Gatsby');

    expect(getByText('The Great Gatsby')).toBeTruthy();
    expect(queryByText('Clean Code')).toBeFalsy();
  });

  it('filters books by category', () => {
    const {getByText, queryByText} = render(<BookStoreScreen />);

    // Select Technology category
    fireEvent.press(getByText('Technology'));

    expect(getByText('Clean Code')).toBeTruthy();
    expect(queryByText('The Great Gatsby')).toBeFalsy();
  });

  it('shows empty state when no books match filters', () => {
    const {getByPlaceholderText, getByText} = render(<BookStoreScreen />);

    const searchInput = getByPlaceholderText('Search books, authors, or keywords...');
    fireEvent.changeText(searchInput, 'nonexistentbook');

    expect(getByText('No books found')).toBeTruthy();
  });

  it('updates book count in header', () => {
    const {getByText} = render(<BookStoreScreen />);

    // Initially shows all books
    expect(getByText(/books found/)).toBeTruthy();
  });
});
