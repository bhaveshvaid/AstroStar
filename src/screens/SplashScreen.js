// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import GradientBackground from '../components/GradientBackground';

const SplashScreen = () => {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <LottieView
          source={require('../assets/animations/stars.json')}
          autoPlay
          loop
          style={styles.animation}
        />
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
  logo: {
    width: 200,
    height: 200,
  },
  animation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;