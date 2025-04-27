// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import GradientBackground from '../components/GradientBackground';
import PredictionCard from '../components/PredictionCard';
import ZodiacIcon from '../components/ZodiacIcon';
import CustomButton from '../components/CustomButton';
import { getDailyPrediction } from '../services/predictionService';
import { getUserData } from '../services/firebaseService';
import { getBirthChart } from '../services/storageService';
import { theme } from '../styles/theme';

const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [birthChart, setBirthChart] = useState(null);
  const [dailyPrediction, setDailyPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get user ID
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        // Get user data from Firebase
        const userData = await getUserData(userId);
        setUserData(userData);
        
        // Get birth chart from local storage
        const birthChart = await getBirthChart();
        setBirthChart(birthChart);
        
        // Get daily prediction
        if (userData?.birthDetails?.sunSign || (birthChart && birthChart.sunSign)) {
          const sunSign = userData?.birthDetails?.sunSign || birthChart.sunSign;
          const prediction = await getDailyPrediction(sunSign);
          setDailyPrediction(prediction);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const renderGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const handleViewPrediction = () => {
    navigation.navigate('Predictions');
  };

  const handleViewBirthChart = () => {
    navigation.navigate('Chart');
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{renderGreeting()}</Text>
            <Text style={styles.name}>{userData?.name || 'Cosmic Explorer'}</Text>
          </View>
          
          {userData?.birthDetails?.sunSign && (
            <ZodiacIcon sign={userData.birthDetails.sunSign} size={60} />
          )}
        </View>
        
        <View style={styles.dateContainer}>
          <Icon name="calendar-star" size={18} color={theme.colors.cosmic.stardustGold} />
          <Text style={styles.date}>{moment().format('dddd, MMMM D, YYYY')}</Text>
        </View>
        
        {(userData?.birthDetails?.sunSign || (birthChart && birthChart.sunSign)) ? (
          <View style={styles.predictionContainer}>
            <Text style={styles.sectionTitle}>Your Daily Horoscope</Text>
            
            {dailyPrediction ? (
              <PredictionCard
                title={`${userData?.birthDetails?.sunSign || birthChart.sunSign} Today`}
                prediction={dailyPrediction.general}
                date={moment().format('MMMM D')}
                iconName="star"
                onPress={handleViewPrediction}
              />
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your cosmic insights...</Text>
              </View>
            )}
            
            <CustomButton
              title="View Full Prediction"
              onPress={handleViewPrediction}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.noBirthDetailsContainer}>
            <Image
              source={require('../assets/images/birth-chart.png')}
              style={styles.placeholderImage}
              resizeMode="contain"
            />
            <Text style={styles.noBirthDetailsTitle}>Complete Your Profile</Text>
            <Text style={styles.noBirthDetailsText}>
              Add your birth details to unlock personalized predictions and cosmic insights.
            </Text>
            <CustomButton
              title="Add Birth Details"
              onPress={() => navigation.navigate('BirthDetails')}
              style={styles.button}
            />
          </View>
        )}
        
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Cosmic Features</Text>
          <View style={styles.featureCardsContainer}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={handleViewBirthChart}
            >
              <Icon name="chart-bubble" size={32} color={theme.colors.cosmic.celestialPink} />
              <Text style={styles.featureTitle}>Birth Chart</Text>
              <Text style={styles.featureDescription}>Explore your cosmic blueprint</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('Chat')}
            >
              <Icon name="chat-processing" size={32} color={theme.colors.cosmic.etherealTeal} />
              <Text style={styles.featureTitle}>Cosmic Chat</Text>
              <Text style={styles.featureDescription}>Ask the stars your questions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#BBBBBB',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  date: {
    color: theme.colors.cosmic.stardustGold,
    marginLeft: 5,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  predictionContainer: {
    marginBottom: 30,
  },
  button: {
    marginTop: 10,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.roundness,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
  },
  noBirthDetailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  noBirthDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  noBirthDetailsText: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 15,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.roundness,
    padding: 20,
    width: '48%',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#BBBBBB',
    textAlign: 'center',
  },
});

export default HomeScreen;