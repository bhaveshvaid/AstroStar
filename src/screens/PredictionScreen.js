// src/screens/PredictionScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import GradientBackground from '../components/GradientBackground';
import PredictionCard from '../components/PredictionCard';
import ZodiacIcon from '../components/ZodiacIcon';
import CustomButton from '../components/CustomButton';
import { getWeeklyPrediction, getDailyPrediction } from '../services/predictionService';
import { getBirthChart } from '../services/storageService';
import { savePredictionToHistory } from '../services/firebaseService';
import { theme } from '../styles/theme';

const PredictionScreen = ({ navigation }) => {
  const [birthChart, setBirthChart] = useState(null);
  const [dailyPrediction, setDailyPrediction] = useState(null);
  const [weeklyPrediction, setWeeklyPrediction] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get birth chart
      const birthChart = await getBirthChart();
      setBirthChart(birthChart);
      
      if (birthChart) {
        // Get daily prediction
        const daily = await getDailyPrediction(birthChart.sunSign);
        setDailyPrediction(daily);
        
        // Get weekly prediction
        const weekly = await getWeeklyPrediction(birthChart.sunSign);
        setWeeklyPrediction(weekly);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => setActiveTab('weekly')}
          >
            <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
      );
    };
  
    const renderDailyPrediction = () => {
      if (activeTab !== 'daily') return null;
      
      if (!birthChart || !dailyPrediction) {
        return (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Add your birth details to view your daily prediction.
            </Text>
            <CustomButton
              title="Add Birth Details"
              onPress={() => navigation.navigate('BirthDetails')}
              style={styles.button}
            />
          </View>
        );
      }
  
      return (
        <ScrollView style={styles.predictionScrollView}>
          <View style={styles.dateDisplay}>
            <Icon name="calendar-today" size={20} color={theme.colors.cosmic.stardustGold} />
            <Text style={styles.currentDate}>{moment().format('dddd, MMMM D, YYYY')}</Text>
          </View>
          
          <PredictionCard
            title="Daily Cosmic Insight"
            prediction={dailyPrediction.general}
            iconName="star"
          />
          
          <PredictionCard
            title="Focus of the Day"
            prediction={dailyPrediction.focus}
            iconName="target"
          />
          
          <View style={styles.luckyContainer}>
            <Text style={styles.luckyTitle}>Lucky Elements Today</Text>
            
            <View style={styles.luckyItemsContainer}>
              <View style={styles.luckyItem}>
                <Icon name="numeric" size={24} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.luckyLabel}>Number</Text>
                <Text style={styles.luckyValue}>{dailyPrediction.lucky.number}</Text>
              </View>
              
              <View style={styles.luckyItem}>
                <Icon name="palette" size={24} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.luckyLabel}>Color</Text>
                <Text style={styles.luckyValue}>{dailyPrediction.lucky.color}</Text>
              </View>
              
              <View style={styles.luckyItem}>
                <Icon name="clock-outline" size={24} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.luckyLabel}>Time</Text>
                <Text style={styles.luckyValue}>{dailyPrediction.lucky.time}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.refreshNote}>
            <Text style={styles.refreshText}>
              Daily predictions update at midnight. Pull down to refresh.
            </Text>
          </View>
        </ScrollView>
      );
    };
  
    const renderWeeklyPrediction = () => {
      if (activeTab !== 'weekly') return null;
      
      if (!birthChart || !weeklyPrediction) {
        return (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Add your birth details to view your weekly prediction.
            </Text>
            <CustomButton
              title="Add Birth Details"
              onPress={() => navigation.navigate('BirthDetails')}
              style={styles.button}
            />
          </View>
        );
      }
  
      return (
        <ScrollView style={styles.predictionScrollView}>
          <View style={styles.dateDisplay}>
            <Icon name="calendar-week" size={20} color={theme.colors.cosmic.stardustGold} />
            <Text style={styles.currentDate}>
              Week of {moment(weeklyPrediction.weekStartDate).format('MMMM D')} - {moment(weeklyPrediction.weekEndDate).format('MMMM D, YYYY')}
            </Text>
          </View>
          
          <PredictionCard
            title="Weekly Overview"
            prediction={weeklyPrediction.general}
            iconName="star-circle"
          />
          
          <PredictionCard
            title="Love & Relationships"
            prediction={weeklyPrediction.love}
            iconName="heart"
          />
          
          <PredictionCard
            title="Career & Finances"
            prediction={weeklyPrediction.career}
            iconName="briefcase"
          />
          
          <PredictionCard
            title="Health & Wellness"
            prediction={weeklyPrediction.health}
            iconName="medical-bag"
          />
          
          <View style={styles.luckyContainer}>
            <Text style={styles.luckyTitle}>Lucky Elements This Week</Text>
            
            <View style={styles.weeklyLuckyContainer}>
              <View style={styles.luckyRow}>
                <Icon name="calendar-check" size={24} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.luckyLabel}>Days:</Text>
                <Text style={styles.luckyValueWeekly}>{weeklyPrediction.lucky.days.join(', ')}</Text>
              </View>
              
              <View style={styles.luckyRow}>
                <Icon name="numeric" size={24} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.luckyLabel}>Numbers:</Text>
                <Text style={styles.luckyValueWeekly}>{weeklyPrediction.lucky.numbers.join(', ')}</Text>
              </View>
              
              <View style={styles.luckyRow}>
                <Icon name="palette" size={24} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.luckyLabel}>Colors:</Text>
                <Text style={styles.luckyValueWeekly}>{weeklyPrediction.lucky.colors.join(', ')}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.refreshNote}>
            <Text style={styles.refreshText}>
              Weekly predictions refresh every Sunday. Pull down to refresh.
            </Text>
          </View>
        </ScrollView>
      );
    };
  
    return (
      <GradientBackground>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Cosmic Predictions</Text>
            {birthChart && (
              <View style={styles.sunSignContainer}>
                <ZodiacIcon sign={birthChart.sunSign} size={36} />
                <Text style={styles.sunSign}>{birthChart.sunSign}</Text>
              </View>
            )}
          </View>
          
          {renderTabs()}
          
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Consulting the stars...</Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#FFFFFF"
                  />
                }
              >
                {renderDailyPrediction()}
                {renderWeeklyPrediction()}
              </ScrollView>
            </View>
          )}
        </View>
      </GradientBackground>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    sunSignContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sunSign: {
      color: '#FFFFFF',
      fontSize: 16,
      marginLeft: 8,
      textTransform: 'capitalize',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.roundness,
      marginBottom: 20,
      padding: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: theme.roundness - 3,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      color: '#BBBBBB',
      fontWeight: '500',
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    contentContainer: {
      flex: 1,
    },
    predictionScrollView: {
      flex: 1,
    },
    dateDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    currentDate: {
      color: theme.colors.cosmic.stardustGold,
      marginLeft: 10,
      fontSize: 16,
    },
    luckyContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: theme.roundness,
      padding: 20,
      marginVertical: 10,
    },
    luckyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 15,
    },
    luckyItemsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    luckyItem: {
      alignItems: 'center',
      flex: 1,
    },
    luckyLabel: {
      color: '#BBBBBB',
      marginTop: 5,
      marginBottom: 2,
    },
    luckyValue: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    weeklyLuckyContainer: {
      width: '100%',
    },
    luckyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    luckyValueWeekly: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      flex: 1,
      marginLeft: 5,
    },
    refreshNote: {
      alignItems: 'center',
      marginVertical: 20,
    },
    refreshText: {
      color: '#BBBBBB',
      fontStyle: 'italic',
      fontSize: 12,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noDataText: {
      color: '#BBBBBB',
      textAlign: 'center',
      marginBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#BBBBBB',
      marginTop: 15,
    },
    button: {
      width: '100%',
      marginTop: 10,
    },
  });
  
  export default PredictionScreen;