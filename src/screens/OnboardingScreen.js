// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import GradientBackground from '../components/GradientBackground';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to AstroStar',
    description: 'Discover your cosmic path through personalized astrology readings and daily insights.',
    animation: require('../assets/animations/stars.json'),
  },
  {
    id: '2',
    title: 'Personalized Birth Chart',
    description: 'Get detailed insights about your personality, strengths, and life path based on your birth details.',
    animation: require('../assets/animations/planets.json'),
  },
  {
    id: '3',
    title: 'Daily Predictions',
    description: 'Receive daily horoscope readings tailored specifically to your zodiac sign and planetary positions.',
    animation: require('../assets/animations/horoscope.json'),
  },
  {
    id: '4',
    title: 'Cosmic Chat Assistant',
    description: 'Ask questions and get astrological guidance from our AI-powered cosmic assistant.',
    animation: require('../assets/animations/chat.json'),
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('Auth');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Auth');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.animationContainer}>
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const index = Math.floor(
              Math.floor(event.nativeEvent.contentOffset.x) /
                Math.floor(event.nativeEvent.layoutMeasurement.width)
            );
            setCurrentIndex(index);
          }}
        />
        
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSkip} style={{padding:15}}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          
          <CustomButton
            title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 24,
  },
  animationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 28,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginVertical: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 6,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginBottom: 40,
    // backgroundColor:'#000'
  },
  skipText: {
    color: '#BBBBBB',
    fontSize: 18,
    fontWeight: '500',
  },
  nextButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
});

export default OnboardingScreen;