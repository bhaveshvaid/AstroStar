// src/screens/SubscriptionScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import GradientBackground from '../components/GradientBackground';
import CustomButton from '../components/CustomButton';
import { theme } from '../styles/theme';
import {
  getSubscriptionStatus,
  purchasePremium,
  cancelPremium,
  SUBSCRIPTION_TIERS,
  PREMIUM_BENEFITS
} from '../services/subscriptionService';

const SubscriptionScreen = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(1); // 1 month default
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const navigation = useNavigation();
  
  useEffect(() => {
    loadSubscription();
  }, []);
  
  const loadSubscription = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (userId) {
        const subscriptionStatus = await getSubscriptionStatus(userId);
        setSubscription(subscriptionStatus);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePurchase = async () => {
    try {
      setProcessingPayment(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      await purchasePremium(userId, selectedPlan);
      await loadSubscription();
      
      // Navigate back to previous screen if coming from a message limit
      navigation.goBack();
    } catch (error) {
      console.error('Error purchasing subscription:', error);
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const handleCancel = async () => {
    try {
      setProcessingPayment(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      await cancelPremium(userId);
      await loadSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const renderPricingPlans = () => (
    <View style={styles.pricingContainer}>
      <Text style={styles.pricingTitle}>Choose Your Plan</Text>
      
      <View style={styles.planOptions}>
        <TouchableOpacity
          style={[styles.planOption, selectedPlan === 1 && styles.selectedPlan]}
          onPress={() => setSelectedPlan(1)}
        >
          <Text style={[styles.planPrice, selectedPlan === 1 && styles.selectedPlanText]}>$9.99</Text>
          <Text style={[styles.planDuration, selectedPlan === 1 && styles.selectedPlanText]}>1 Month</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.planOption, selectedPlan === 3 && styles.selectedPlan]}
          onPress={() => setSelectedPlan(3)}
        >
          <View style={styles.saveBadge}>
            <Text style={styles.saveText}>SAVE 15%</Text>
          </View>
          <Text style={[styles.planPrice, selectedPlan === 3 && styles.selectedPlanText]}>$25.99</Text>
          <Text style={[styles.planDuration, selectedPlan === 3 && styles.selectedPlanText]}>3 Months</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.planOption, selectedPlan === 12 && styles.selectedPlan]}
          onPress={() => setSelectedPlan(12)}
        >
          <View style={styles.saveBadge}>
            <Text style={styles.saveText}>SAVE 33%</Text>
          </View>
          <Text style={[styles.planPrice, selectedPlan === 12 && styles.selectedPlanText]}>$79.99</Text>
          <Text style={[styles.planDuration, selectedPlan === 12 && styles.selectedPlanText]}>1 Year</Text>
        </TouchableOpacity>
      </View>
      
      <CustomButton
        title={processingPayment ? "Processing..." : "Upgrade to Premium"}
        onPress={handlePurchase}
        loading={processingPayment}
        style={styles.upgradeButton}
      />
    </View>
  );
  
  const renderCurrentSubscription = () => {
    if (!subscription) return null;
    
    const isPremium = subscription.tier === SUBSCRIPTION_TIERS.PREMIUM;
    const expiryDate = subscription.expiresAt ? new Date(subscription.expiresAt) : null;
    
    return (
      <View style={styles.currentPlanContainer}>
        <Text style={styles.currentPlanTitle}>
          Current Plan: {isPremium ? 'Premium' : 'Free'}
        </Text>
        
        {isPremium && expiryDate && (
          <Text style={styles.expiryText}>
            Your premium benefits expire on {expiryDate.toLocaleDateString()}
          </Text>
        )}
        
        {isPremium && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={processingPayment}
          >
            <Text style={styles.cancelText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderPremiumBenefits = () => (
    <View style={styles.benefitsContainer}>
      <Text style={styles.benefitsTitle}>Premium Benefits</Text>
      
      {PREMIUM_BENEFITS.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <View style={styles.benefitIconContainer}>
            <Icon name={benefit.icon} size={24} color={theme.colors.cosmic.stardustGold} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>{benefit.title}</Text>
            <Text style={styles.benefitDescription}>{benefit.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading subscription info...</Text>
        </View>
      </GradientBackground>
    );
  }

  const isPremium = subscription?.tier === SUBSCRIPTION_TIERS.PREMIUM;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>AstroStar Premium</Text>
          <Text style={styles.subtitle}>
            Unlock deeper cosmic insights and personalized guidance
          </Text>
        </View>
        
        {renderCurrentSubscription()}
        
        {!isPremium && renderPricingPlans()}
        
        {renderPremiumBenefits()}
        
        <View style={styles.freeInfoContainer}>
          <Text style={styles.freeInfoTitle}>Free Plan Includes:</Text>
          <View style={styles.freeInfoItem}>
            <Icon name="message-text-outline" size={20} color="#BBBBBB" />
            <Text style={styles.freeInfoText}>5 chat messages per week</Text>
          </View>
          <View style={styles.freeInfoItem}>
            <Icon name="star-outline" size={20} color="#BBBBBB" />
            <Text style={styles.freeInfoText}>Basic daily horoscope</Text>
          </View>
          <View style={styles.freeInfoItem}>
            <Icon name="chart-bubble" size={20} color="#BBBBBB" />
            <Text style={styles.freeInfoText}>Standard birth chart</Text>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBBBBB',
    textAlign: 'center',
  },
  currentPlanContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  expiryText: {
    color: '#BBBBBB',
    marginBottom: 15,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  pricingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  planOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.roundness,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    position: 'relative',
  },
  selectedPlan: {
    backgroundColor: theme.colors.primary,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  planDuration: {
    color: '#BBBBBB',
  },
  selectedPlanText: {
    color: '#FFFFFF',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: theme.colors.cosmic.stardustGold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  saveText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  upgradeButton: {
    width: '100%',
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  benefitDescription: {
    color: '#BBBBBB',
    lineHeight: 20,
  },
  freeInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
  },
  freeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  freeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  freeInfoText: {
    color: '#BBBBBB',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    marginTop: 10,
  },
});

export default SubscriptionScreen;