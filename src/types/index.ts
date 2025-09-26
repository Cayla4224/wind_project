export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  purchaseDate: string;
  isDownloaded: boolean;
  filePath?: string;
  fileSize?: number;
  description?: string;
  genre?: string;
}

export interface SortOption {
  label: string;
  value: 'title' | 'author' | 'purchaseDate';
}

export interface FilterOption {
  label: string;
  value: string;
  active: boolean;
}