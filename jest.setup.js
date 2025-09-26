// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Alert
global.Alert = {
  alert: jest.fn(),
};

// Silence console warnings in tests
global.__DEV__ = true;