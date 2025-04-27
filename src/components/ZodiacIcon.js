// src/components/ZodiacIcon.js
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const ZodiacIcon = ({ sign, size = 40, style }) => {
  const getZodiacImage = () => {
    switch (sign.toLowerCase()) {
      case 'aries':
        return require('../assets/images/zodiac-icons/aries.png');
      case 'taurus':
        return require('../assets/images/zodiac-icons/taurus.png');
      case 'gemini':
        return require('../assets/images/zodiac-icons/gemini.png');
      case 'cancer':
        return require('../assets/images/zodiac-icons/cancer.png');
      case 'leo':
        return require('../assets/images/zodiac-icons/leo.png');
      case 'virgo':
        return require('../assets/images/zodiac-icons/virgo.png');
      case 'libra':
        return require('../assets/images/zodiac-icons/libra.png');
      case 'scorpio':
        return require('../assets/images/zodiac-icons/scorpio.png');
      case 'sagittarius':
        return require('../assets/images/zodiac-icons/sagittarius.png');
      case 'capricorn':
        return require('../assets/images/zodiac-icons/capricorn.png');
      case 'aquarius':
        return require('../assets/images/zodiac-icons/aquarius.png');
      case 'pisces':
        return require('../assets/images/zodiac-icons/pisces.png');
      default:
        return require('../assets/images/zodiac-icons/aries.png');
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={getZodiacImage()}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ZodiacIcon;