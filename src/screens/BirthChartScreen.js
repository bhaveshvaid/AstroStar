// src/screens/BirthChartScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import GradientBackground from '../components/GradientBackground';
import ZodiacIcon from '../components/ZodiacIcon';
import CustomButton from '../components/CustomButton';
import { getBirthChart } from '../services/storageService';
import { 
  getZodiacDescription, 
  getPlanetDescription, 
  getAspectDescription,
  getElementDescription,
  getModalityDescription 
} from '../services/astrologyService';
import { theme } from '../styles/theme';

const BirthChartScreen = () => {
  const [birthChart, setBirthChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedTab, setSelectedTab] = useState('planets'); // 'planets', 'aspects', 'elements'
  
  const navigation = useNavigation();

  useEffect(() => {
    loadBirthChart();
    
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // When the screen is focused (e.g., after returning from BirthDetails)
      loadBirthChart();
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, [navigation]);

  const loadBirthChart = async () => {
    try {
      setLoading(true);
      const chart = await getBirthChart();
      setBirthChart(chart);
    } catch (error) {
      console.error('Error loading birth chart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadBirthChart();
    setRefreshing(false);
  };

  const renderBirthChartSummary = () => {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Your Cosmic Blueprint</Text>
        
        <View style={styles.signRow}>
          <View style={styles.signItem}>
            <ZodiacIcon sign={birthChart.sunSign} size={50} />
            <Text style={styles.signLabel}>Sun Sign</Text>
            <Text style={styles.signValue}>{birthChart.sunSign}</Text>
          </View>
          
          <View style={styles.signItem}>
            <ZodiacIcon sign={birthChart.moonSign} size={50} />
            <Text style={styles.signLabel}>Moon Sign</Text>
            <Text style={styles.signValue}>{birthChart.moonSign}</Text>
          </View>
          
          <View style={styles.signItem}>
            <ZodiacIcon sign={birthChart.ascendant} size={50} />
            <Text style={styles.signLabel}>Ascendant</Text>
            <Text style={styles.signValue}>{birthChart.ascendant}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.description}>
          Your sun sign represents your core identity, your moon sign reflects your emotional nature, 
          and your ascendant reveals how others perceive you.
        </Text>
        
        {birthChart.lunarPhase && (
          <View style={styles.lunarPhaseContainer}>
            <Text style={styles.lunarPhaseTitle}>Lunar Phase: {birthChart.lunarPhase.phase}</Text>
            <Text style={styles.lunarPhaseDetails}>
              The moon was {birthChart.lunarPhase.illumination}% illuminated at your birth.
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'planets' && styles.activeTab]}
          onPress={() => setSelectedTab('planets')}
        >
          <Text style={[styles.tabText, selectedTab === 'planets' && styles.activeTabText]}>
            Planets
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'aspects' && styles.activeTab]}
          onPress={() => setSelectedTab('aspects')}
        >
          <Text style={[styles.tabText, selectedTab === 'aspects' && styles.activeTabText]}>
            Aspects
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'elements' && styles.activeTab]}
          onPress={() => setSelectedTab('elements')}
        >
          <Text style={[styles.tabText, selectedTab === 'elements' && styles.activeTabText]}>
            Elements
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPlanetaryPositions = () => {
    if (selectedTab !== 'planets') return null;
    
    const planets = [
      { id: 'sun', name: 'Sun', icon: 'white-balance-sunny' },
      { id: 'moon', name: 'Moon', icon: 'moon-waning-crescent' },
      { id: 'mercury', name: 'Mercury', icon: 'mercury' },
      { id: 'venus', name: 'Venus', icon: 'venus' },
      { id: 'mars', name: 'Mars', icon: 'mars' },
      { id: 'jupiter', name: 'Jupiter', icon: 'jupiter' },
      { id: 'saturn', name: 'Saturn', icon: 'saturn' },
      { id: 'uranus', name: 'Uranus', icon: 'finance' },
      { id: 'neptune', name: 'Neptune', icon: 'waves' },
      { id: 'pluto', name: 'Pluto', icon: 'atom' },
    ];

    return (
      <View style={styles.planetaryContainer}>
        <Text style={styles.sectionTitle}>Planetary Positions</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {planets.map((planet) => {
            const planetData = birthChart.planets[planet.id];
            if (!planetData) return null;
            
            return (
              <TouchableOpacity
                key={planet.id}
                style={[
                  styles.planetCard,
                  selectedPlanet === planet.id && styles.selectedPlanetCard
                ]}
                onPress={() => setSelectedPlanet(planet.id === selectedPlanet ? null : planet.id)}
              >
                <Icon
                  name={planet.icon}
                  size={28}
                  color={selectedPlanet === planet.id ? '#FFFFFF' : theme.colors.cosmic.stardustGold}
                />
                <Text style={styles.planetName}>{planet.name}</Text>
                <ZodiacIcon sign={planetData.sign} size={30} />
                <Text style={styles.planetSign}>{planetData.sign}</Text>
                <Text style={styles.planetDegree}>{Math.round(planetData.degree)}°</Text>
                {planetData.isRetrograde && (
                  <Text style={styles.retrogradeText}>R</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {selectedPlanet && (
          <View style={styles.planetDetailsContainer}>
            <Text style={styles.planetDetailsTitle}>
              {selectedPlanet.charAt(0).toUpperCase() + selectedPlanet.slice(1)} in {birthChart.planets[selectedPlanet].sign}
              {birthChart.planets[selectedPlanet].isRetrograde ? ' (Retrograde)' : ''}
            </Text>
            <Text style={styles.planetDetails}>
              {getPlanetDescription(selectedPlanet)}
            </Text>
            <Text style={styles.planetDetails}>
              In {birthChart.planets[selectedPlanet].sign}, your {selectedPlanet} expresses through {getZodiacDescription(birthChart.planets[selectedPlanet].sign)}
            </Text>
            {birthChart.planets[selectedPlanet].isRetrograde && (
              <Text style={styles.planetDetails}>
                The retrograde motion suggests a more internalized, reflective expression of this energy.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };
  
  const renderAspects = () => {
    if (selectedTab !== 'aspects' || !birthChart.aspects) return null;
    
    // Get aspect icon based on type
    const getAspectIcon = (aspect) => {
      switch(aspect) {
        case 'conjunction': return 'circle';
        case 'opposition': return 'ray-vertex';
        case 'trine': return 'triangle';
        case 'square': return 'square';
        case 'sextile': return 'hexagon';
        default: return 'asterisk';
      }
    };
    
    return (
      <View style={styles.aspectsContainer}>
        <Text style={styles.sectionTitle}>Planetary Aspects</Text>
        <Text style={styles.aspectsDescription}>
          Aspects are angular relationships between planets that influence how their energies interact.
        </Text>
        
        {birthChart.aspects.length === 0 ? (
          <Text style={styles.noAspectsText}>No major aspects found in your chart.</Text>
        ) : (
          birthChart.aspects.map((aspect, index) => (
            <View key={index} style={styles.aspectItem}>
              <View style={styles.aspectHeader}>
                <Icon name={getAspectIcon(aspect.aspect)} size={20} color={theme.colors.cosmic.stardustGold} />
                <Text style={styles.aspectTitle}>
                  {aspect.planet1.charAt(0).toUpperCase() + aspect.planet1.slice(1)} {aspect.aspect} {aspect.planet2.charAt(0).toUpperCase() + aspect.planet2.slice(1)}
                </Text>
                <Text style={styles.aspectOrb}>({aspect.orb}°)</Text>
              </View>
              <Text style={styles.aspectDescription}>
                {getAspectDescription(aspect.aspect)}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };
  
  const renderElements = () => {
    if (selectedTab !== 'elements' || !birthChart.elementalBalance) return null;
    
    const { elementalBalance, modalityBalance } = birthChart;
    
    // Get color for each element
    const getElementColor = (element) => {
      switch(element) {
        case 'fire': return '#FF5722';
        case 'earth': return '#8BC34A';
        case 'air': return '#03A9F4';
        case 'water': return '#9C27B0';
        default: return '#FFFFFF';
      }
    };
    
    // Get icon for each element
    const getElementIcon = (element) => {
      switch(element) {
        case 'fire': return 'fire';
        case 'earth': return 'earth';
        case 'air': return 'weather-windy';
        case 'water': return 'water';
        default: return 'help-circle';
      }
    };
    
    // Get icon for each modality
    const getModalityIcon = (modality) => {
      switch(modality) {
        case 'cardinal': return 'arrow-right-bold';
        case 'fixed': return 'lock';
        case 'mutable': return 'sync';
        default: return 'help-circle';
      }
    };
    
    return (
      <View style={styles.elementsContainer}>
        <Text style={styles.sectionTitle}>Elemental Balance</Text>
        
        <View style={styles.elementalBox}>
          {Object.entries(elementalBalance.counts).map(([element, count]) => (
            <View key={element} style={styles.elementItem}>
              <Icon 
                name={getElementIcon(element)} 
                size={24} 
                color={getElementColor(element)} 
              />
              <Text style={styles.elementName}>{element.charAt(0).toUpperCase() + element.slice(1)}</Text>
              <View style={[styles.elementBar, { backgroundColor: getElementColor(element), width: `${Math.max(count * 10, 10)}%` }]} />
              <Text style={styles.elementCount}>{count}</Text>
            </View>
          ))}
        </View>
        
        {elementalBalance.dominant !== 'unknown' && (
          <View style={styles.dominantContainer}>
            <Text style={styles.dominantTitle}>
              Dominant Element: {elementalBalance.dominant.charAt(0).toUpperCase() + elementalBalance.dominant.slice(1)}
            </Text>
            <Text style={styles.dominantDescription}>
              {getElementDescription(elementalBalance.dominant)}
            </Text>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Modality Balance</Text>
        
        <View style={styles.elementalBox}>
          {Object.entries(modalityBalance.counts).map(([modality, count]) => (
            <View key={modality} style={styles.elementItem}>
              <Icon 
                name={getModalityIcon(modality)} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.elementName}>{modality.charAt(0).toUpperCase() + modality.slice(1)}</Text>
              <View style={[styles.elementBar, { width: `${Math.max(count * 10, 10)}%` }]} />
              <Text style={styles.elementCount}>{count}</Text>
            </View>
          ))}
        </View>
        
        {modalityBalance.dominant !== 'unknown' && (
          <View style={styles.dominantContainer}>
            <Text style={styles.dominantTitle}>
              Dominant Modality: {modalityBalance.dominant.charAt(0).toUpperCase() + modalityBalance.dominant.slice(1)}
            </Text>
            <Text style={styles.dominantDescription}>
              {getModalityDescription(modalityBalance.dominant)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderNoBirthChart = () => {
    return (
      <View style={styles.noBirthChartContainer}>
        <Icon name="chart-bubble" size={80} color={theme.colors.cosmic.stardustGold} />
        <Text style={styles.noBirthChartTitle}>No Birth Chart Available</Text>
        <Text style={styles.noBirthChartText}>
          Add your birth details to generate your personalized birth chart and discover your cosmic blueprint.
        </Text>
        <CustomButton
          title="Add Birth Details"
          onPress={() => navigation.navigate('BirthDetails')}
          style={styles.button}
        />
      </View>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Birth Chart</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your birth chart...</Text>
            </View>
          ) : birthChart ? (
            <>
              {renderBirthChartSummary()}
              {renderTabs()}
              {renderPlanetaryPositions()}
              {renderAspects()}
              {renderElements()}
            </>
          ) : (
            renderNoBirthChart()
          )}
        </ScrollView>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  signItem: {
    alignItems: 'center',
    flex: 1,
  },
  signLabel: {
    color: '#BBBBBB',
    marginTop: 10,
    marginBottom: 2,
  },
  signValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 15,
  },
  description: {
    color: '#BBBBBB',
    lineHeight: 22,
    marginBottom: 15,
  },
  lunarPhaseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.roundness,
    padding: 12,
    marginTop: 10,
  },
  lunarPhaseTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lunarPhaseDetails: {
    color: '#BBBBBB',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  planetaryContainer: {
    marginBottom: 20,
  },
  planetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.roundness,
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    height: 170,
    justifyContent: 'space-between',
  },
  selectedPlanetCard: {
    backgroundColor: theme.colors.primary,
  },
  planetName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
  planetSign: {
    color: '#BBBBBB',
    textTransform: 'capitalize',
  },
  planetDegree: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  retrogradeText: {
    color: theme.colors.cosmic.celestialPink,
    fontWeight: 'bold',
    fontSize: 16,
  },
  planetDetailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 15,
    marginTop: 15,
  },
  planetDetailsTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  planetDetails: {
    color: '#BBBBBB',
    lineHeight: 22,
    marginBottom: 10,
  },
  // Aspects styles
  aspectsContainer: {
    marginBottom: 20,
  },
  aspectsDescription: {
    color: '#BBBBBB',
    lineHeight: 22,
    marginBottom: 15,
  },
  noAspectsText: {
    color: '#BBBBBB',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  aspectItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 15,
    marginBottom: 10,
  },
  aspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aspectTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    textTransform: 'capitalize',
  },
  aspectOrb: {
    color: theme.colors.cosmic.stardustGold,
  },
  aspectDescription: {
    color: '#BBBBBB',
    lineHeight: 22,
  },
  // Elements styles
  elementsContainer: {
    marginBottom: 20,
  },
  elementalBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 15,
    marginBottom: 15,
  },
  elementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  elementName: {
    color: '#FFFFFF',
    width: 70,
    marginLeft: 10,
  },
  elementBar: {
    height: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    flex: 1,
    marginRight: 10,
  },
  elementCount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  dominantContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.roundness,
    padding: 15,
    marginBottom: 20,
  },
  dominantTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dominantDescription: {
    color: '#BBBBBB',
    lineHeight: 22,
  },
  noBirthChartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noBirthChartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  noBirthChartText: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#BBBBBB',
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
});

export default BirthChartScreen;