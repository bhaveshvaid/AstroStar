// src/components/GradientBackground.js
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../styles/theme';

const GradientBackground = ({ children, style }) => {
  return (
    <LinearGradient
      colors={[theme.colors.cosmic.cosmicBlue, theme.colors.cosmic.deepPurple]}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;