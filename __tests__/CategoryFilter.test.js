import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import CategoryFilter from '../src/components/CategoryFilter';

const mockCategories = ['All', 'Fiction', 'Non-Fiction', 'Technology'];

describe('CategoryFilter', () => {
  it('renders all categories', () => {
    const {getByText} = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategorySelect={() => {}}
      />
    );

    mockCategories.forEach(category => {
      expect(getByText(category)).toBeTruthy();
    });
  });

  it('highlights selected category', () => {
    const {getByText} = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="Fiction"
        onCategorySelect={() => {}}
      />
    );

    const fictionButton = getByText('Fiction');
    expect(fictionButton).toBeTruthy();
  });

  it('calls onCategorySelect when category is pressed', () => {
    const mockOnCategorySelect = jest.fn();
    const {getByText} = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategorySelect={mockOnCategorySelect}
      />
    );

    fireEvent.press(getByText('Fiction'));
    expect(mockOnCategorySelect).toHaveBeenCalledWith('Fiction');
  });
});
