// src/components/PredictionCard.js
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../styles/theme';

const PredictionCard = ({ 
  title, 
  prediction, 
  date,
  iconName = 'star-outline',
  onPress,
  style
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={['rgba(26, 31, 59, 0.8)', 'rgba(59, 25, 106, 0.8)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name={iconName} size={24} color={theme.colors.cosmic.stardustGold} />
            <Text style={styles.title}>{title}</Text>
          </View>
          {date && <Text style={styles.date}>{date}</Text>}
        </View>
        <Text style={styles.prediction}>{prediction}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.roundness,
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  prediction: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});

export default PredictionCard;