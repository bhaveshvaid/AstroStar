// src/screens/AuthScreen.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GradientBackground from '../components/GradientBackground';
import CustomButton from '../components/CustomButton';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/firebaseService';
import { theme } from '../styles/theme';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigation = useNavigation();

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && !name) {
      setError('Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isLogin) {
        console.log("Attempting to sign in with email:", email);
        // Sign in
        const result = await signInWithEmail(email, password);
        console.log("Sign in successful, navigating to main app");
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } else {
        console.log("Attempting to sign up with email:", email);
        // Sign up
        await signUpWithEmail(email, password, { name });
        console.log("Sign up successful, navigating to birth details");
        
        navigation.navigate('BirthDetails');
      }
    } catch (err) {
      console.error("Auth error:", err);
      
      let errorMsg = 'Authentication failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMsg = 'Invalid email or password';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Email is already in use';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log("Starting Google Sign-In process...");
      const result = await signInWithGoogle();
      console.log("Google Sign-In complete");
      
      if (result.isNewUser) {
        // Navigate to birth details for new users
        navigation.navigate('BirthDetails');
      } else {
        // Navigate to main app for existing users
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      
      let errorMsg = 'Google sign-in failed';
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMsg = 'Sign-in was cancelled';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMsg = 'Google Play Services not available or outdated';
      } else if (error.message) {
        errorMsg = `Google sign-in failed: ${error.message}`;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Image
              source={require('../assets/images/logo.png')}
              style={[styles.logo,{width:100}]}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            {!isLogin && (
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
                outlineColor="rgba(255, 255, 255, 0.3)"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon={() => <Icon name="account" size={24} color="rgba(255, 255, 255, 0.7)" />} />}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#BBBBBB', background: 'transparent' } }}
              />
            )}
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon={() => <Icon name="email" size={24} color="rgba(255, 255, 255, 0.7)" />} />}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{ colors: { text: '#FFFFFF', placeholder: '#BBBBBB', background: 'transparent' } }}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              mode="outlined"
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon={() => <Icon name="lock" size={24} color="rgba(255, 255, 255, 0.7)" />} />}
              right={
                <TextInput.Icon
                  icon={() => <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="rgba(255, 255, 255, 0.7)" />}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              theme={{ colors: { text: '#FFFFFF', placeholder: '#BBBBBB', background: 'transparent' } }}
            />
            
            <CustomButton
              title={isLogin ? 'Sign In' : 'Sign Up'}
              onPress={handleAuth}
              loading={loading}
              style={styles.button}
            />
            
            <Text style={styles.orText}>OR</Text>
            
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Icon name="google" size={24} color="#FFFFFF" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop:2,
    paddingBottom:2
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  button: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 14,
  },
  orText: {
    color: '#BBBBBB',
    marginVertical: 20,
    fontWeight: '500',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: theme.roundness,
    width: '100%',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 12,
    fontWeight: '500',
  },
  toggleText: {
    color: theme.colors.accent,
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AuthScreen;