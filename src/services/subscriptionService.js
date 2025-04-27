// src/services/subscriptionService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

// Constants
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
};

export const PREMIUM_BENEFITS = [
  {
    title: 'Unlimited Cosmic Chat',
    description: 'Ask the stars anything, anytime without message limits',
    icon: 'chat-processing'
  },
  {
    title: 'AI-Powered Personalized Readings',
    description: 'Get deeper, more accurate predictions tailored specifically to your birth chart',
    icon: 'star'
  },
  {
    title: 'Detailed Weekly Forecasts',
    description: 'Receive comprehensive weekly predictions for all aspects of your life',
    icon: 'calendar-week'
  },
  {
    title: 'Advanced Compatibility Analysis',
    description: 'Discover your cosmic compatibility with friends, family, and romantic partners',
    icon: 'heart'
  }
];

// Get user subscription status
export const getSubscriptionStatus = async (userId) => {
  try {
    // First check local storage for performance
    const cachedStatus = await AsyncStorage.getItem('subscriptionStatus');
    
    if (cachedStatus) {
      return JSON.parse(cachedStatus);
    }
    
    // If not in local storage, get from Firestore
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const subscription = userData.subscription || {
        tier: SUBSCRIPTION_TIERS.FREE,
        expiresAt: null,
        startedAt: null,
      };
      
      // Cache for performance
      await AsyncStorage.setItem('subscriptionStatus', JSON.stringify(subscription));
      
      return subscription;
    }
    
    // Default to free tier if no data
    const defaultStatus = {
      tier: SUBSCRIPTION_TIERS.FREE,
      expiresAt: null,
      startedAt: null,
    };
    
    await AsyncStorage.setItem('subscriptionStatus', JSON.stringify(defaultStatus));
    return defaultStatus;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      tier: SUBSCRIPTION_TIERS.FREE,
      expiresAt: null,
      startedAt: null,
      error: error.message
    };
  }
};

// Update subscription status
export const updateSubscription = async (userId, subscriptionDetails) => {
  try {
    // Update in Firestore
    await firestore().collection('users').doc(userId).update({
      subscription: subscriptionDetails,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    
    // Update in local storage
    await AsyncStorage.setItem('subscriptionStatus', JSON.stringify(subscriptionDetails));
    
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Get chat message count for the current week
export const getChatMessageCount = async (userId) => {
  try {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Start of day
    
    // Get count from Firestore
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('chatHistory')
      .where('sender', '==', 'user')
      .where('timestamp', '>=', startOfWeek.toISOString())
      .get();
    
    return snapshot.size;
  } catch (error) {
    console.error('Error getting chat message count:', error);
    
    // Fallback to cached count if available
    try {
      const cachedCount = await AsyncStorage.getItem('weeklyMessageCount');
      return cachedCount ? parseInt(cachedCount, 10) : 0;
    } catch (e) {
      return 0;
    }
  }
};

// Increment chat message count
export const incrementMessageCount = async () => {
  try {
    const currentCount = await AsyncStorage.getItem('weeklyMessageCount');
    const newCount = (currentCount ? parseInt(currentCount, 10) : 0) + 1;
    await AsyncStorage.setItem('weeklyMessageCount', newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing message count:', error);
    return 1; // Assume it's the first message if there's an error
  }
};

// Reset weekly message count
export const resetMessageCount = async () => {
  try {
    await AsyncStorage.setItem('weeklyMessageCount', '0');
    return true;
  } catch (error) {
    console.error('Error resetting message count:', error);
    return false;
  }
};

// Check if user can send a message (for free tier)
export const canSendMessage = async (userId) => {
  try {
    const subscription = await getSubscriptionStatus(userId);
    
    // Premium users can always send messages
    if (subscription.tier === SUBSCRIPTION_TIERS.PREMIUM) {
      return { canSend: true };
    }
    
    // Check count for free users
    const messageCount = await getChatMessageCount(userId);
    
    if (messageCount >= 5) {
      return {
        canSend: false,
        reason: 'message_limit',
        currentCount: messageCount,
        limit: 5
      };
    }
    
    return {
      canSend: true,
      currentCount: messageCount,
      limit: 5,
      remaining: 5 - messageCount
    };
  } catch (error) {
    console.error('Error checking if can send message:', error);
    // Default to allowing messages if there's an error
    return { canSend: true, error: error.message };
  }
};

// Mock function for handling subscription purchase
export const purchasePremium = async (userId, months = 1) => {
  try {
    // This would normally integrate with a payment provider
    // For now, we'll just update the subscription status
    
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(now.getMonth() + months);
    
    const subscriptionDetails = {
      tier: SUBSCRIPTION_TIERS.PREMIUM,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      months: months,
    };
    
    // Update subscription in Firestore and local storage
    await updateSubscription(userId, subscriptionDetails);
    
    Alert.alert(
      "Premium Activated!",
      `Thank you for subscribing to AstroStar Premium for ${months} month${months > 1 ? 's' : ''}! Enjoy your cosmic journey!`,
      [{ text: "OK" }]
    );
    
    return true;
  } catch (error) {
    console.error('Error purchasing premium:', error);
    
    Alert.alert(
      "Subscription Error",
      "There was an error processing your subscription. Please try again later.",
      [{ text: "OK" }]
    );
    
    throw error;
  }
};

// Mock function for handling subscription cancellation
export const cancelPremium = async (userId) => {
  try {
    // Get current subscription
    const currentSubscription = await getSubscriptionStatus(userId);
    
    // Update to keep premium until current period ends, but don't auto-renew
    const updatedSubscription = {
      ...currentSubscription,
      canceledAt: new Date().toISOString(),
      autoRenew: false
    };
    
    // Update subscription in Firestore and local storage
    await updateSubscription(userId, updatedSubscription);
    
    Alert.alert(
      "Subscription Canceled",
      "Your premium subscription has been canceled. You'll still have access until the end of your current billing period.",
      [{ text: "OK" }]
    );
    
    return true;
  } catch (error) {
    console.error('Error canceling premium:', error);
    
    Alert.alert(
      "Cancellation Error",
      "There was an error canceling your subscription. Please try again later.",
      [{ text: "OK" }]
    );
    
    throw error;
  }
};