// src/screens/BirthDetailsScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GradientBackground from '../components/GradientBackground';
import CustomButton from '../components/CustomButton';
import { saveBirthDetails } from '../services/firebaseService';
import { calculateBirthChart } from '../services/astrologyService';
import { storeBirthChart } from '../services/storageService';
import { theme } from '../styles/theme';
import { countriesData } from '../data/countriesData';

const BirthDetailsScreen = () => {
  const [birthDate, setBirthDate] = useState(null);
  const [birthTime, setBirthTime] = useState(null);
  const [birthCountry, setBirthCountry] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigation = useNavigation();

  const handleDateConfirm = (date) => {
    setBirthDate(date);
    setDatePickerVisible(false);
  };

  const handleTimeConfirm = (time) => {
    setBirthTime(time);
    setTimePickerVisible(false);
  };

  const filteredCountries = searchQuery 
    ? countriesData.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : countriesData;

  const selectCountry = (country) => {
    setBirthCountry({
      name: country.name,
      lat: country.lat,
      lng: country.lng
    });
    setShowCountryModal(false);
    setSearchQuery('');
  };

  const handleContinue = async () => {
    if (!birthDate || !birthTime || !birthCountry) {
      setError('Please fill in all fields for accurate predictions.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const userId = await AsyncStorage.getItem('userId');
      console.log("Birth details - User ID:", userId);
      
      if (userId) {
        // Calculate birth chart
        const birthChart = calculateBirthChart(
          birthDate,
          birthTime,
          birthCountry.lat,
          birthCountry.lng
        );
        console.log("Birth chart calculated");
        
        // Save birth details to Firebase
        console.log("Saving birth details to Firebase...");
        await saveBirthDetails(userId, {
          birthDate: birthDate.toISOString(),
          birthTime: birthTime.toISOString(),
          birthLocation: {
            name: birthCountry.name,
            lat: birthCountry.lat,
            lng: birthCountry.lng
          },
          sunSign: birthChart.sunSign,
          moonSign: birthChart.moonSign,
          ascendant: birthChart.ascendant
        });
        
        // Store birth chart locally
        console.log("Storing birth chart locally...");
        await storeBirthChart(birthChart);
        
        console.log("Birth details saved successfully");
      } else {
        console.error("No user ID found");
      }
      
      // Navigate back to the main app
      navigation.goBack();
    } catch (err) {
      console.error('Error saving birth details:', err);
      setError('Error saving your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Birth Details</Text>
            <Text style={styles.subtitle}>
              Enter your exact birth details for personalized astrological readings
            </Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setDatePickerVisible(true)}
            >
              <Icon name="calendar" size={24} color="rgba(255, 255, 255, 0.7)" style={styles.icon} />
              <Text style={[styles.input, !birthDate && styles.placeholder]}>
                {birthDate ? moment(birthDate).format('MMMM D, YYYY') : 'Select Birth Date'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setTimePickerVisible(true)}
            >
              <Icon name="clock-outline" size={24} color="rgba(255, 255, 255, 0.7)" style={styles.icon} />
              <Text style={[styles.input, !birthTime && styles.placeholder]}>
                {birthTime ? moment(birthTime).format('h:mm A') : 'Select Birth Time'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowCountryModal(true)}
            >
              <Icon name="earth" size={24} color="rgba(255, 255, 255, 0.7)" style={styles.icon} />
              <Text style={[styles.input, !birthCountry && styles.placeholder]}>
                {birthCountry ? birthCountry.name : 'Select Birth Country'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.infoContainer}>
              <Icon name="information-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.infoText}>
                Your birth details are used to calculate your unique cosmic signature and are stored securely.
              </Text>
            </View>
            
            <CustomButton
              title="Continue"
              onPress={handleContinue}
              loading={loading}
              style={styles.button}
            />
            
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()}
      />
      
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisible(false)}
      />

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={24} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a country..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
              />
            </View>
            
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => selectCountry(item)}
                >
                  <Icon name="earth" size={20} color="#555" style={styles.resultIcon} />
                  <Text style={styles.resultText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
              ListEmptyComponent={
                <Text style={styles.emptyResult}>No countries found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.roundness,
    marginBottom: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  placeholder: {
    color: '#BBBBBB',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  button: {
    width: '100%',
    marginBottom: 15,
    paddingVertical: 16,
  },
  skipText: {
    color: theme.colors.accent,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#000',
    fontSize: 16,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    color: '#333',
    fontSize: 16,
  },
  emptyResult: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  }
});

export default BirthDetailsScreen;