// src/services/predictionService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { weeklyPredictions } from '../data/weeklyPredictions';

// Get weekly prediction based on sun sign
export const getWeeklyPrediction = async (sunSign) => {
  try {
    if (!sunSign) {
      throw new Error('Sun sign is required');
    }
    
    // Check if prediction is cached and still valid for current week
    const cachedPrediction = await AsyncStorage.getItem(`weeklyPrediction_${sunSign}`);
    if (cachedPrediction) {
      const parsedPrediction = JSON.parse(cachedPrediction);
      
      // Check if prediction is for the current week
      if (isCurrentWeek(parsedPrediction.weekStartDate)) {
        console.log(`Using cached prediction for ${sunSign}`);
        return parsedPrediction;
      }
    }
    
    // Get the current date and calculate week number
    const today = new Date();
    const weekNumber = getWeekNumber(today);
    const year = today.getFullYear();
    
    // Get predictions for the sign
    const signPredictions = weeklyPredictions[sunSign.toLowerCase()];
    if (!signPredictions || signPredictions.length === 0) {
      throw new Error(`No predictions available for ${sunSign}`);
    }
    
    // Get birth chart for user-specific variation
    const birthChart = await AsyncStorage.getItem('birthChart');
    const parsedBirthChart = birthChart ? JSON.parse(birthChart) : null;
    
    // Calculate variation based on birth chart if available
    const userVariation = calculateUserVariation(parsedBirthChart);
    
    // Combine factors to get prediction index
    const rotationFactor = (weekNumber + year) % signPredictions.length;
    const finalIndex = (rotationFactor + userVariation) % signPredictions.length;
    
    // Get the selected prediction
    const selectedPrediction = signPredictions[finalIndex];
    
    // Add metadata
    const weekStartDate = getWeekStartDate(today);
    const weekEndDate = getWeekEndDate(today);
    
    const formattedPrediction = {
      ...selectedPrediction,
      weekStartDate: weekStartDate.toISOString(),
      weekEndDate: weekEndDate.toISOString(),
      weekNumber: weekNumber,
      sunSign: sunSign,
      updatedAt: new Date().toISOString()
    };
    
    // Cache the prediction
    await AsyncStorage.setItem(
      `weeklyPrediction_${sunSign}`, 
      JSON.stringify(formattedPrediction)
    );
    
    console.log(`Generated new prediction for ${sunSign}, week ${weekNumber}`);
    
    return formattedPrediction;
  } catch (error) {
    console.error('Error getting weekly prediction:', error);
    return getFallbackPrediction(sunSign);
  }
};

// Get a daily prediction slice from the weekly prediction
export const getDailyPrediction = async (sunSign) => {
  try {
    // Get the weekly prediction first
    const weeklyPrediction = await getWeeklyPrediction(sunSign);
    
    // Get the day of the week (0-6, where 0 is Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[dayOfWeek];
    
    // Check if day is one of the lucky days
    const isLuckyDay = weeklyPrediction.lucky.days.includes(currentDay);
    
    // Create different emphasis for different days of the week
    let dayEmphasis;
    switch (dayOfWeek) {
      case 0: // Sunday
        dayEmphasis = 'reflection and renewal';
        break;
      case 1: // Monday
        dayEmphasis = 'getting started and setting intentions';
        break;
      case 2: // Tuesday
        dayEmphasis = 'taking action and making progress';
        break;
      case 3: // Wednesday
        dayEmphasis = 'communication and connection';
        break;
      case 4: // Thursday
        dayEmphasis = 'expansion and opportunity';
        break;
      case 5: // Friday
        dayEmphasis = 'harmony and completion';
        break;
      case 6: // Saturday
        dayEmphasis = 'enjoyment and alignment';
        break;
      default:
        dayEmphasis = 'focus and awareness';
    }
    
    // Create a daily-specific introduction
    let dailyIntro = `Today emphasizes ${dayEmphasis} for ${sunSign}.`;
    if (isLuckyDay) {
      dailyIntro += ` As one of your lucky days this week, the stars are particularly aligned in your favor.`;
    }
    
    // Select portion of weekly prediction relevant for today
    const dailyGeneral = selectDailyPortion(weeklyPrediction.general, dayOfWeek);
    
    // Select from different categories based on day of week
    let dailyFocus;
    if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6) {
      // Sunday, Wednesday, Saturday - love focus
      dailyFocus = selectDailyPortion(weeklyPrediction.love, dayOfWeek);
    } else if (dayOfWeek === 1 || dayOfWeek === 4) {
      // Monday, Thursday - career focus
      dailyFocus = selectDailyPortion(weeklyPrediction.career, dayOfWeek);
    } else {
      // Tuesday, Friday - health focus
      dailyFocus = selectDailyPortion(weeklyPrediction.health, dayOfWeek);
    }
    
    // Get lucky number for today (rotate through the available numbers)
    const luckyNumberIndex = dayOfWeek % weeklyPrediction.lucky.numbers.length;
    const luckyNumber = weeklyPrediction.lucky.numbers[luckyNumberIndex];
    
    // Get lucky color for today (rotate through the available colors)
    const luckyColorIndex = dayOfWeek % weeklyPrediction.lucky.colors.length;
    const luckyColor = weeklyPrediction.lucky.colors[luckyColorIndex];
    
    return {
      general: dailyIntro + " " + dailyGeneral,
      focus: dailyFocus,
      lucky: {
        number: luckyNumber,
        color: luckyColor,
        time: isLuckyDay ? "All day" : getRandomTime()
      },
      date: today.toISOString(),
      sunSign: sunSign
    };
  } catch (error) {
    console.error('Error getting daily prediction:', error);
    return getFallbackDailyPrediction(sunSign);
  }
};

// Helper function to select a portion of the weekly text based on day of week
const selectDailyPortion = (weeklyText, dayOfWeek) => {
  // Split the text into sentences
  const sentences = weeklyText.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length <= 3) {
    return weeklyText; // Return the whole text if it's short
  }
  
  // Select different portions for different days
  const sentenceCount = sentences.length;
  const portionSize = Math.ceil(sentenceCount / 3); // Divide into thirds
  
  let startIndex;
  if (dayOfWeek === 0 || dayOfWeek === 1) {
    // Sunday-Monday: first portion
    startIndex = 0;
  } else if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) {
    // Tuesday-Thursday: middle portion
    startIndex = portionSize;
  } else {
    // Friday-Saturday: last portion
    startIndex = portionSize * 2;
  }
  
  // Ensure we don't go out of bounds
  const endIndex = Math.min(startIndex + portionSize, sentenceCount);
  
  // Join the selected sentences
  return sentences.slice(startIndex, endIndex).join('').trim();
};

// Generate a random time for lucky time
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 12) + 1; // 1-12
  const timeOfDay = Math.random() > 0.5 ? 'AM' : 'PM';
  return `${hours} ${timeOfDay}`;
};

// Check if a date is in the current week
const isCurrentWeek = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  
  const currentWeekStart = getWeekStartDate(today);
  const currentWeekEnd = getWeekEndDate(today);
  
  return date >= currentWeekStart && date <= currentWeekEnd;
};

// Get the start date (Sunday) of the week containing the given date
const getWeekStartDate = (date) => {
  const result = new Date(date);
  const day = result.getDay(); // 0-6, where 0 is Sunday
  result.setDate(result.getDate() - day); // Go back to Sunday
  result.setHours(0, 0, 0, 0); // Start of day
  return result;
};

// Get the end date (Saturday) of the week containing the given date
const getWeekEndDate = (date) => {
  const result = new Date(date);
  const day = result.getDay(); // 0-6, where 0 is Sunday
  result.setDate(result.getDate() + (6 - day)); // Go forward to Saturday
  result.setHours(23, 59, 59, 999); // End of day
  return result;
};

// Get week number (1-52) from date
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Calculate user variation based on birth chart factors
const calculateUserVariation = (birthChart) => {
  if (!birthChart) return 0;
  
  let variation = 0;
  
  // Add value based on moon sign
  if (birthChart.moonSign) {
    const moonSignValue = getMoonSignValue(birthChart.moonSign);
    variation += moonSignValue;
  }
  
  // Add value based on ascendant
  if (birthChart.ascendant) {
    const ascendantValue = getAscendantValue(birthChart.ascendant);
    variation += ascendantValue;
  }
  
  // Add value based on planetary positions
  if (birthChart.planets && birthChart.planets.jupiter) {
    const jupiterSignValue = getJupiterSignValue(birthChart.planets.jupiter.sign);
    variation += jupiterSignValue;
  }
  
  // Ensure the variation stays within a reasonable range
  return variation % 7; // 0-6 variation
};

// Get numeric value for moon sign
const getMoonSignValue = (moonSign) => {
  const moonValues = {
    aries: 0, taurus: 1, gemini: 2, cancer: 3,
    leo: 4, virgo: 5, libra: 6, scorpio: 7,
    sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11
  };
  
  return moonValues[moonSign.toLowerCase()] || 0;
};

// Get numeric value for ascendant
const getAscendantValue = (ascendant) => {
  const ascendantValues = {
    aries: 0, taurus: 1, gemini: 2, cancer: 3,
    leo: 4, virgo: 5, libra: 6, scorpio: 7,
    sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11
  };
  
  return ascendantValues[ascendant.toLowerCase()] || 0;
};

// Get numeric value for Jupiter sign
const getJupiterSignValue = (jupiterSign) => {
  const jupiterValues = {
    aries: 0, taurus: 1, gemini: 2, cancer: 3,
    leo: 4, virgo: 5, libra: 6, scorpio: 7,
    sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11
  };
  
  return jupiterValues[jupiterSign.toLowerCase()] || 0;
};

// Fallback prediction if something goes wrong
const getFallbackPrediction = (sunSign) => {
  return {
    general: "This week brings a balance of challenges and opportunities. Focus on your strengths and remain adaptable as circumstances evolve.",
    love: "Communication is key in your relationships this week. Express your feelings honestly while remaining open to others' perspectives.",
    career: "Professional growth comes through attention to detail and collaboration. Stay organized and be willing to support team members.",
    health: "Balance activity with proper rest to maintain your energy levels. Pay attention to what your body needs each day.",
    lucky: {
      days: ["Monday", "Thursday"],
      numbers: [7, 15, 22],
      colors: ["Blue", "Silver"]
    },
    weekStartDate: new Date().toISOString(),
    weekEndDate: new Date().toISOString(),
    weekNumber: getWeekNumber(new Date()),
    sunSign: sunSign,
    updatedAt: new Date().toISOString()
  };
};

// Fallback daily prediction
const getFallbackDailyPrediction = (sunSign) => {
  return {
    general: "Today offers a chance to align with your authentic self. Stay focused on your priorities while remaining open to unexpected opportunities.",
    focus: "Your relationships benefit from honest communication and genuine interest in others' perspectives.",
    lucky: {
      number: 7,
      color: "Blue",
      time: "3 PM"
    },
    date: new Date().toISOString(),
    sunSign: sunSign
  };
};