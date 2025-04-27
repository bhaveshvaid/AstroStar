// src/services/firebaseService.js
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBirthChart } from './astrologyService';
import { storeBirthChart } from './storageService';

// Initialize Firebase
export const initializeFirebase = () => {
  GoogleSignin.configure({
    webClientId: '512572274964-pmd9h7s1ge4c4de3ns28tbv1h2tq4dfl.apps.googleusercontent.com',
    offlineAccess: false,
    forceCodeForRefreshToken: false,
    accountName: '',
  });
  console.log("Firebase initialized with Google Sign-In");
};

// Sign up with email and password
export const signUpWithEmail = async (email, password, userData) => {
  try {
    console.log("Attempting sign up with:", email);
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    console.log("Sign up successful, user created with ID:", userCredential.user.uid);
    
    // Update user profile with name if provided
    if (userData.name) {
      await userCredential.user.updateProfile({
        displayName: userData.name,
      });
      console.log("User profile updated with name:", userData.name);
    }
    
    // Add user data to Firestore
    console.log("Saving user data to Firestore...");
    await firestore().collection('users').doc(userCredential.user.uid).set({
      ...userData,
      email,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log("User data saved to Firestore");
    
    // Store user data locally
    await AsyncStorage.setItem('userId', userCredential.user.uid);
    console.log("User ID stored locally:", userCredential.user.uid);
    
    return userCredential.user;
  } catch (error) {
    console.error("Sign up error:", error.code, error.message);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    console.log("Attempting sign in with:", email);
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    console.log("Sign in successful with ID:", userCredential.user.uid);
    
    // Get user data from Firestore
    console.log("Getting user data from Firestore...");
    const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
    let userData = null;
    
    if (userDoc.exists) {
      userData = userDoc.data();
      console.log("User data retrieved from Firestore");
      
      // Check if birth details exist and process them
      if (userData.birthDetails) {
        console.log("Birth details found, calculating birth chart...");
        // Calculate birth chart based on user's birth details
        const birthChart = calculateBirthChart(
          new Date(userData.birthDetails.birthDate),
          new Date(userData.birthDetails.birthTime),
          userData.birthDetails.birthLocation.lat,
          userData.birthDetails.birthLocation.lng
        );
        
        // Store birth chart locally
        await storeBirthChart(birthChart);
        console.log("Birth chart calculated and stored locally");
      }
    } else {
      console.log("No user data found in Firestore, creating basic record");
      // Create basic user data if none exists
      userData = { 
        email: userCredential.user.email, 
        name: userCredential.user.displayName || '',
        createdAt: firestore.FieldValue.serverTimestamp()
      };
      await firestore().collection('users').doc(userCredential.user.uid).set(userData);
    }
    
    // Store user data locally
    await AsyncStorage.setItem('userId', userCredential.user.uid);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log("User data stored locally");
    
    return { user: userCredential.user, userData };
  } catch (error) {
    console.error("Sign in error:", error.code, error.message);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log("Checking Google Play Services...");
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("Google Play Services OK");
    
    // Force clear any existing sessions
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      console.log("Cleared previous Google session");
    } catch (e) {
      console.log("No previous session to clear");
    }
    
    // Start the Google Sign-In flow
    console.log("Starting Google Sign-In flow...");
    const userInfo = await GoogleSignin.signIn();
    console.log("Google Sign-In response received");
    
    // Extract the idToken from the response
    let idToken;
    if (userInfo.data && userInfo.data.idToken) {
      idToken = userInfo.data.idToken;
      console.log("ID Token obtained from data.idToken");
    } else if (userInfo.idToken) {
      idToken = userInfo.idToken;
      console.log("ID Token obtained from idToken");
    } else {
      console.error("Could not find ID token in response:", JSON.stringify(userInfo));
      throw new Error('No ID token found in Google Sign-In response');
    }
    
    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    console.log("Created Google credential, signing in to Firebase...");
    
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log("Firebase sign-in with Google successful, user ID:", userCredential.user.uid);
    
    // Check if user exists in Firestore
    console.log("Checking if user exists in Firestore...");
    const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();
    let userData;
    let isNewUser = false;
    
    if (!userDoc.exists) {
      console.log("Creating new user data in Firestore...");
      // Create new user data if it doesn't exist
      userData = {
        name: userCredential.user.displayName || '',
        email: userCredential.user.email || '',
        photoURL: userCredential.user.photoURL || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      
      await firestore().collection('users').doc(userCredential.user.uid).set(userData);
      console.log("New user data created");
      isNewUser = true;
    } else {
      // Use existing user data
      userData = userDoc.data();
      console.log("User exists, using existing data");
      
      // Check if birth details exist and process them
      if (userData.birthDetails) {
        console.log("Birth details found, calculating birth chart...");
        // Calculate birth chart based on user's birth details
        const birthChart = calculateBirthChart(
          new Date(userData.birthDetails.birthDate),
          new Date(userData.birthDetails.birthTime),
          userData.birthDetails.birthLocation.lat,
          userData.birthDetails.birthLocation.lng
        );
        
        // Store birth chart locally
        await storeBirthChart(birthChart);
        console.log("Birth chart calculated and stored locally");
      }
    }
    
    // Store user data locally
    await AsyncStorage.setItem('userId', userCredential.user.uid);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log("User data stored locally");
    
    return { user: userCredential.user, userData, isNewUser };
  } catch (error) {
    console.error("Google Sign-In error:", error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    // Sign out from Google
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      console.log("Signed out from Google");
    } catch (e) {
      console.log("Error signing out from Google:", e);
    }
    
    // Sign out from Firebase
    await auth().signOut();
    console.log("Signed out from Firebase");
    
    // Clear local storage
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('birthChart');
    console.log("Cleared local storage");
    
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Get user data
export const getUserData = async (userId) => {
  try {
    console.log("Getting user data for:", userId);
    const userDoc = await firestore().collection('users').doc(userId).get();
    if (userDoc.exists) {
      console.log("User data retrieved successfully");
      return userDoc.data();
    }
    console.log("No user data found");
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Save birth details
export const saveBirthDetails = async (userId, birthDetails) => {
  try {
    console.log("Saving birth details for user:", userId);
    await firestore().collection('users').doc(userId).update({
      birthDetails,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log("Birth details saved to Firestore");
    
    // Update local storage
    const userData = JSON.parse(await AsyncStorage.getItem('userData') || '{}');
    userData.birthDetails = birthDetails;
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log("Updated user data in local storage");
    
    return true;
  } catch (error) {
    console.error("Error saving birth details:", error);
    throw error;
  }
};

// Save prediction to history
export const savePredictionToHistory = async (userId, prediction) => {
  try {
    console.log("Saving prediction to history for user:", userId);
    const result = await firestore().collection('users').doc(userId)
      .collection('predictionHistory').add({
        ...prediction,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    console.log("Prediction saved with ID:", result.id);
    return true;
  } catch (error) {
    console.error("Error saving prediction:", error);
    throw error;
  }
};

// Get prediction history
export const getPredictionHistory = async (userId) => {
  try {
    console.log("Getting prediction history for user:", userId);
    const snapshot = await firestore().collection('users').doc(userId)
      .collection('predictionHistory')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    const predictions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log(`Retrieved ${predictions.length} predictions`);
    return predictions;
  } catch (error) {
    console.error("Error getting prediction history:", error);
    throw error;
  }
};

// Save chat message
export const saveChatMessage = async (userId, message) => {
    try {
      const result = await firestore().collection('users').doc(userId)
        .collection('chatHistory').add({
          ...message,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      return result.id;
    } catch (error) {
      console.error("Error saving chat message:", error);
      throw error;
    }
  };
  
  // Get chat history
  export const getChatHistory = async (userId, limit = 50) => {
    try {
      const snapshot = await firestore().collection('users').doc(userId)
        .collection('chatHistory')
        .orderBy('timestamp', 'asc')
        .limit(limit)
        .get();
        
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting chat history:", error);
      throw error;
    }
  };