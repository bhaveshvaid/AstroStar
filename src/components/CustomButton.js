// src/components/CustomButton.js
import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../styles/theme';

const CustomButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  loading = false,
  disabled = false,
  secondary = false,
  outline = false,
}) => {
  if (outline) {
    return (
      <TouchableOpacity
        style={[styles.outlineButton, style]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <Text style={[styles.outlineButtonText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (secondary) {
    return (
      <TouchableOpacity
        style={[styles.secondaryButton, style]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.buttonContainer, style]}
    >
      <LinearGradient
        colors={disabled ? ['#888888', '#666666'] : [theme.colors.primary, '#6A0DAD']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: theme.roundness,
    overflow: 'hidden',
    // elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: theme.colors.cosmic.etherealTeal,
    borderRadius: theme.roundness,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.roundness,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CustomButton;