// src/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store birth chart data
export const storeBirthChart = async (birthChart) => {
  try {
    await AsyncStorage.setItem('birthChart', JSON.stringify(birthChart));
    return true;
  } catch (error) {
    console.error('Error storing birth chart:', error);
    return false;
  }
};

// Get birth chart data
export const getBirthChart = async () => {
  try {
    const birthChart = await AsyncStorage.getItem('birthChart');
    return birthChart ? JSON.parse(birthChart) : null;
  } catch (error) {
    console.error('Error getting birth chart:', error);
    return null;
  }
};

// Store user preferences
export const storeUserPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error storing user preferences:', error);
    return false;
  }
};

// Get user preferences
export const getUserPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem('userPreferences');
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};