// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import GradientBackground from '../components/GradientBackground';
import CustomButton from '../components/CustomButton';
import ZodiacIcon from '../components/ZodiacIcon';
import { signOut, getUserData } from '../services/firebaseService';
import { getBirthChart } from '../services/storageService';
import { theme } from '../styles/theme';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [birthChart, setBirthChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // When the screen is focused (e.g., after returning from BirthDetails)
      loadUserData();
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        const userData = await getUserData(userId);
        setUserData(userData);
        
        // Get birth chart
        const birthChart = await getBirthChart();
        setBirthChart(birthChart);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBirthDetails = () => {
    navigation.navigate('BirthDetails');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderProfileHeader = () => {
    return (
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {userData?.photoURL ? (
            <Image
              source={{ uri: userData.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>{userData?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{userData?.email || ''}</Text>
        
        {userData?.birthDetails?.sunSign && (
          <View style={styles.signContainer}>
            <ZodiacIcon sign={userData.birthDetails.sunSign} size={30} />
            <Text style={styles.signText}>{userData.birthDetails.sunSign}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderBirthDetails = () => {
    const hasBirthDetails = userData?.birthDetails || birthChart;
    
    if (!hasBirthDetails) {
      return (
        <View style={styles.noBirthDetailsContainer}>
          <Text style={styles.noBirthDetailsText}>
            Add your birth details to get personalized predictions.
          </Text>
          <CustomButton
            title="Add Birth Details"
            onPress={handleEditBirthDetails}
            style={styles.button}
          />
        </View>
      );
    }

    return (
      <View style={styles.birthDetailsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Birth Details</Text>
          <TouchableOpacity onPress={handleEditBirthDetails}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        {userData?.birthDetails?.birthDate && (
          <View style={styles.detailItem}>
            <Icon name="calendar" size={20} color={theme.colors.cosmic.stardustGold} />
            <Text style={styles.detailLabel}>Birth Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(userData.birthDetails.birthDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {userData?.birthDetails?.birthTime && (
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={20} color={theme.colors.cosmic.stardustGold} />
            <Text style={styles.detailLabel}>Birth Time:</Text>
            <Text style={styles.detailValue}>
              {new Date(userData.birthDetails.birthTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        
        {userData?.birthDetails?.birthLocation && (
          <View style={styles.detailItem}>
            <Icon name="map-marker" size={20} color={theme.colors.cosmic.stardustGold} />
            <Text style={styles.detailLabel}>Birth Location:</Text>
            <Text style={styles.detailValue}>
              {userData.birthDetails.birthLocation?.name || 'Unknown'}
            </Text>
          </View>
        )}
        
        <CustomButton
          title="Edit Birth Details"
          onPress={handleEditBirthDetails}
          style={styles.button}
        />
      </View>
    );
  };

  const renderSettings = () => {
    return (
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="bell-outline" size={24} color="#FFFFFF" />
          <Text style={styles.settingText}>Notifications</Text>
          <Icon name="chevron-right" size={24} color="#BBBBBB" />
        </TouchableOpacity>
        
        {/* <TouchableOpacity style={styles.settingItem}>
          <Icon name="theme-light-dark" size={24} color="#FFFFFF" />
          <Text style={styles.settingText}>Appearance</Text>
          <Icon name="chevron-right" size={24} color="#BBBBBB" />
        </TouchableOpacity> */}
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="shield-lock-outline" size={24} color="#FFFFFF" />
          <Text style={styles.settingText}>Privacy</Text>
          <Icon name="chevron-right" size={24} color="#BBBBBB" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Icon name="help-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.settingText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#BBBBBB" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <Icon name="logout" size={24} color={theme.colors.error} />
          <Text style={[styles.settingText, { color: theme.colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderProfileHeader()}
        {renderBirthDetails()}
        {renderSettings()}
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 10,
  },
  signContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  signText: {
    color: '#FFFFFF',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  noBirthDetailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  noBirthDetailsText: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 15,
  },
  birthDetailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editText: {
    color: theme.colors.accent,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#BBBBBB',
    marginLeft: 10,
    width: 100,
  },
  detailValue: {
    color: '#FFFFFF',
    flex: 1,
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingText: {
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 15,
  },
  button: {
    width: '100%',
    marginTop: 15,
  },
  version: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProfileScreen;