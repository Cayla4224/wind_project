import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import BookStoreScreen from './src/screens/BookStoreScreen';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <BookStoreScreen />
    </SafeAreaView>
  );
};

export default App;
