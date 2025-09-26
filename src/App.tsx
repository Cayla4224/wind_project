import React from 'react';
import {StatusBar} from 'react-native';
import PersonalLibraryScreen from './screens/PersonalLibraryScreen';

const App: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <PersonalLibraryScreen />
    </>
  );
};

export default App;