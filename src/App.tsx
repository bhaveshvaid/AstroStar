// src/App.js
import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

// Navigation
import MainNavigator from './navigation/MainNavigator';

// Theme
import { theme } from './styles/theme';

// Services
import { initializeFirebase } from './services/firebaseService';

// Ignore specific log warnings
LogBox.ignoreLogs(['new NativeEventEmitter']);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize Firebase
    initializeFirebase();
    
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Listen for Firebase auth state changes
    const subscriber = auth().onAuthStateChanged(user => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      setIsAuthenticated(user !== null);
      // Store user ID in AsyncStorage when auth state changes
      if (user) {
        AsyncStorage.setItem('userId', user.uid);
      } else {
        AsyncStorage.removeItem('userId');
      }
    });
    
    // Unsubscribe on unmount
    return subscriber;
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...");
      const userId = await AsyncStorage.getItem('userId');
      console.log("User ID from storage:", userId);
      setIsAuthenticated(userId !== null);
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#0A0F2B" />
        <MainNavigator isLoading={isLoading} isAuthenticated={isAuthenticated} />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;