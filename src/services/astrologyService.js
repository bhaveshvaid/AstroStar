// src/services/astrologyService.js
import * as astronomy from 'astronomy-engine';
import moment from 'moment';

// Calculate sun sign based on birth date
export const getSunSign = (birthDate) => {
  try {
    const date = new Date(birthDate);
    
    // Calculate Sun's ecliptic longitude
    const sunLongitude = astronomy.EclipticLongitude(astronomy.Body.Sun, date);
    
    return getZodiacSignFromLongitude(sunLongitude);
  } catch (error) {
    console.error('Error calculating sun sign:', error);
    // Fallback to traditional date ranges
    return getTraditionalSunSign(birthDate);
  }
};

// Traditional date-based sun sign calculation as fallback
const getTraditionalSunSign = (birthDate) => {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return 'taurus';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return 'gemini';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return 'cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return 'leo';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return 'virgo';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return 'libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return 'scorpio';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return 'sagittarius';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'capricorn';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return 'aquarius';
  } else {
    return 'pisces';
  }
};

// Get zodiac sign from celestial longitude
export const getZodiacSignFromLongitude = (longitudeDegrees) => {
  const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  const signIndex = Math.floor(longitudeDegrees / 30) % 12;
  return zodiacSigns[signIndex];
};

// Calculate moon sign
export const getMoonSign = (birthDate, birthTime, latitude, longitude) => {
  try {
    const date = new Date(birthDate);
    const time = new Date(birthTime);
    
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    // Calculate Moon's ecliptic longitude
    const moonLongitude = astronomy.EclipticLongitude(astronomy.Body.Moon, date);
    
    return getZodiacSignFromLongitude(moonLongitude);
  } catch (error) {
    console.error('Error calculating moon sign:', error);
    // Fallback to sun sign if calculation fails
    return getSunSign(birthDate);
  }
};

// Calculate ascendant (rising sign)
export const getAscendant = (birthDate, birthTime, latitude, longitude) => {
  try {
    const date = new Date(birthDate);
    const time = new Date(birthTime);
    
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    // Calculate Sidereal Time
    const siderealTime = astronomy.SiderealTime(date);
    
    // Calculate ascendant longitude
    let ascLongitude = (15.0 * siderealTime + longitude) % 360;
    if (ascLongitude < 0) ascLongitude += 360;
    
    // Apply simple latitude adjustment
    // This is a simplified approximation, not the full astronomical formula
    const latitudeAdjustment = 0.33 * Math.sin(latitude * Math.PI / 180);
    ascLongitude += latitudeAdjustment;
    
    // Ensure longitude is within 0-360 range
    ascLongitude = (ascLongitude + 360) % 360;
    
    return getZodiacSignFromLongitude(ascLongitude);
  } catch (error) {
    console.error('Error calculating ascendant:', error);
    // Fallback to a default value if calculation fails
    return 'aries';
  }
};

// Calculate planetary positions
export const getPlanetaryPositions = (birthDate, birthTime, latitude, longitude) => {
  try {
    const date = new Date(birthDate);
    const time = new Date(birthTime);
    
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    const planets = {
      sun: astronomy.Body.Sun,
      moon: astronomy.Body.Moon,
      mercury: astronomy.Body.Mercury,
      venus: astronomy.Body.Venus,
      mars: astronomy.Body.Mars,
      jupiter: astronomy.Body.Jupiter,
      saturn: astronomy.Body.Saturn,
      uranus: astronomy.Body.Uranus,
      neptune: astronomy.Body.Neptune,
      pluto: astronomy.Body.Pluto
    };
    
    const positions = {};
    
    Object.entries(planets).forEach(([planetName, planetBody]) => {
      try {
        let longitude, longitudeSpeed;
        
        if (planetName === 'sun') {
          // Use GeoVector for the Sun
          const vector = astronomy.GeoVector(planetBody, date, true);
          const ecliptic = astronomy.Ecliptic(vector);
          longitude = ecliptic.elon;
          longitudeSpeed = vector.t.lon; // tangential velocity component
        } else {
          // Use EclipticLongitude for other planets
          longitude = astronomy.EclipticLongitude(planetBody, date);
          
          // Calculate speed by comparing positions 1 day apart
          const tomorrow = new Date(date);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const longitudeTomorrow = astronomy.EclipticLongitude(planetBody, tomorrow);
          
          // Calculate daily motion (adjust for crossing 0/360 boundary)
          longitudeSpeed = longitudeTomorrow - longitude;
          if (longitudeSpeed > 180) longitudeSpeed -= 360;
          if (longitudeSpeed < -180) longitudeSpeed += 360;
        }
        
        const sign = getZodiacSignFromLongitude(longitude);
        const degree = longitude % 30;
        const isRetrograde = longitudeSpeed < 0;
        
        positions[planetName] = {
          longitude: longitude,
          sign: sign,
          degree: degree,
          isRetrograde: isRetrograde
        };
      } catch (planetError) {
        console.error(`Error calculating position for ${planetName}:`, planetError);
        
        // Provide fallback data for this planet
        positions[planetName] = {
          longitude: 0,
          sign: 'unknown',
          degree: 0,
          isRetrograde: false
        };
      }
    });
    
    return positions;
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    
    // Return empty object if complete failure
    return {};
  }
};

// Calculate aspects between planets
export const calculateAspects = (planetPositions) => {
  try {
    const aspects = [];
    const planetNames = Object.keys(planetPositions);
    
    // Aspect definitions
    const aspectTypes = {
      conjunction: { angle: 0, orb: 8 },
      sextile: { angle: 60, orb: 6 },
      square: { angle: 90, orb: 7 },
      trine: { angle: 120, orb: 8 },
      opposition: { angle: 180, orb: 8 }
    };
    
    // Check each planet pair for aspects
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet1 = planetNames[i];
        const planet2 = planetNames[j];
        
        if (!planetPositions[planet1] || !planetPositions[planet2]) continue;
        if (!planetPositions[planet1].longitude || !planetPositions[planet2].longitude) continue;
        
        const longitude1 = planetPositions[planet1].longitude;
        const longitude2 = planetPositions[planet2].longitude;
        
        // Calculate the angular distance between the two planets
        let angularDistance = Math.abs(longitude1 - longitude2);
        if (angularDistance > 180) angularDistance = 360 - angularDistance;
        
        // Check if this distance matches any of our aspect types within orb
        for (const [aspectName, aspectDef] of Object.entries(aspectTypes)) {
          const orb = Math.abs(angularDistance - aspectDef.angle);
          if (orb <= aspectDef.orb) {
            aspects.push({
              planet1: planet1,
              planet2: planet2,
              aspect: aspectName,
              orb: orb.toFixed(1)
            });
            break; // Only record the closest aspect
          }
        }
      }
    }
    
    return aspects;
  } catch (error) {
    console.error('Error calculating aspects:', error);
    return [];
  }
};

// Calculate lunar phase
export const getLunarPhase = (sunLongitude, moonLongitude) => {
  try {
    // Calculate the angle between Sun and Moon
    let angle = (moonLongitude - sunLongitude + 360) % 360;
    
    // Convert angle to lunar phase (0-7)
    const phaseIndex = Math.floor(angle / 45);
    
    // Calculate illumination percentage (approximate)
    const illumination = 50 * (1 - Math.cos(angle * Math.PI / 180));
    
    const phases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent"
    ];
    
    return {
      phase: phases[phaseIndex],
      angle: angle.toFixed(1),
      illumination: illumination.toFixed(1)
    };
  } catch (error) {
    console.error('Error calculating lunar phase:', error);
    return {
      phase: "Unknown",
      angle: "0",
      illumination: "0"
    };
  }
};

// Calculate elemental balance
export const calculateElementalBalance = (planets) => {
  try {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementMap = {
      aries: 'fire', leo: 'fire', sagittarius: 'fire',
      taurus: 'earth', virgo: 'earth', capricorn: 'earth',
      gemini: 'air', libra: 'air', aquarius: 'air',
      cancer: 'water', scorpio: 'water', pisces: 'water'
    };
    
    Object.values(planets).forEach(planet => {
      if (planet && planet.sign) {
        const element = elementMap[planet.sign];
        if (element) elements[element]++;
      }
    });
    
    // Find dominant element
    let dominantElement = 'balanced';
    let maxCount = 0;
    
    for (const [element, count] of Object.entries(elements)) {
      if (count > maxCount) {
        maxCount = count;
        dominantElement = element;
      }
    }
    
    return {
      counts: elements,
      dominant: dominantElement
    };
  } catch (error) {
    console.error('Error calculating elemental balance:', error);
    return {
      counts: { fire: 0, earth: 0, air: 0, water: 0 },
      dominant: 'unknown'
    };
  }
};

// Calculate modality balance
export const calculateModalityBalance = (planets) => {
  try {
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
    const modalityMap = {
      aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
      taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
      gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable'
    };
    
    Object.values(planets).forEach(planet => {
      if (planet && planet.sign) {
        const modality = modalityMap[planet.sign];
        if (modality) modalities[modality]++;
      }
    });
    
    // Find dominant modality
    let dominantModality = 'balanced';
    let maxCount = 0;
    
    for (const [modality, count] of Object.entries(modalities)) {
      if (count > maxCount) {
        maxCount = count;
        dominantModality = modality;
      }
    }
    
    return {
      counts: modalities,
      dominant: dominantModality
    };
  } catch (error) {
    console.error('Error calculating modality balance:', error);
    return {
      counts: { cardinal: 0, fixed: 0, mutable: 0 },
      dominant: 'unknown'
    };
  }
};

// Calculate complete birth chart
export const calculateBirthChart = (birthDate, birthTime, latitude, longitude) => {
  try {
    console.log("Calculating birth chart with astronomy-engine");
    
    // Get date object
    const date = new Date(birthDate);
    const time = new Date(birthTime);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    // Calculate planetary positions
    const planetaryPositions = getPlanetaryPositions(birthDate, birthTime, latitude, longitude);
    
    // Extract sun and moon positions
    const sunPosition = planetaryPositions.sun || {};
    const moonPosition = planetaryPositions.moon || {};
    
    // Get sun sign and moon sign
    const sunSign = sunPosition.sign || getSunSign(birthDate);
    const moonSign = moonPosition.sign || getMoonSign(birthDate, birthTime, latitude, longitude);
    
    // Get ascendant
    const ascendant = getAscendant(birthDate, birthTime, latitude, longitude);
    
    // Calculate aspects between planets
    const aspects = calculateAspects(planetaryPositions);
    
    // Calculate lunar phase
    const lunarPhase = getLunarPhase(
      sunPosition.longitude || 0, 
      moonPosition.longitude || 0
    );
    
    // Calculate elemental balance
    const elementalBalance = calculateElementalBalance(planetaryPositions);
    
    // Calculate modality balance
    const modalityBalance = calculateModalityBalance(planetaryPositions);
    
    return {
      sunSign,
      moonSign,
      ascendant,
      planets: planetaryPositions,
      aspects,
      lunarPhase,
      elementalBalance,
      modalityBalance,
      calculatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating birth chart:', error);
    
    // Return minimal birth chart with just sun sign if everything else fails
    return {
      sunSign: getSunSign(birthDate),
      moonSign: 'unknown',
      ascendant: 'unknown',
      planets: {
        sun: {
          longitude: 0,
          sign: getSunSign(birthDate),
          degree: 0,
          isRetrograde: false
        }
      },
      aspects: [],
      lunarPhase: { phase: "Unknown", angle: "0", illumination: "0" },
      elementalBalance: { counts: { fire: 0, earth: 0, air: 0, water: 0 }, dominant: 'unknown' },
      modalityBalance: { counts: { cardinal: 0, fixed: 0, mutable: 0 }, dominant: 'unknown' },
      calculatedAt: new Date().toISOString()
    };
  }
};

// Helper function to get planet descriptions
export const getPlanetDescription = (planet) => {
  const descriptions = {
    sun: "Represents your core essence, ego, and life purpose.",
    moon: "Governs your emotions, instincts, and subconscious mind.",
    mercury: "Rules your communication style, thinking patterns, and learning approach.",
    venus: "Influences your approach to love, beauty, and values.",
    mars: "Determines your energy, ambition, and how you assert yourself.",
    jupiter: "Represents expansion, growth, and your philosophical outlook.",
    saturn: "Governs discipline, responsibility, and life lessons.",
    uranus: "Influences innovation, rebellion, and sudden changes.",
    neptune: "Rules spirituality, dreams, and illusions.",
    pluto: "Represents transformation, power, and rebirth."
  };
  
  return descriptions[planet.toLowerCase()] || "No description available.";
};

// Helper function to get zodiac sign descriptions
export const getZodiacDescription = (sign) => {
  const descriptions = {
    aries: "Bold, ambitious, and energetic fire sign ruled by Mars.",
    taurus: "Practical, reliable, and sensual earth sign ruled by Venus.",
    gemini: "Curious, adaptable, and communicative air sign ruled by Mercury.",
    cancer: "Nurturing, intuitive, and emotional water sign ruled by the Moon.",
    leo: "Confident, dramatic, and warm-hearted fire sign ruled by the Sun.",
    virgo: "Analytical, practical, and meticulous earth sign ruled by Mercury.",
    libra: "Diplomatic, fair-minded, and social air sign ruled by Venus.",
    scorpio: "Passionate, resourceful, and intense water sign ruled by Pluto.",
    sagittarius: "Adventurous, optimistic, and freedom-loving fire sign ruled by Jupiter.",
    capricorn: "Disciplined, responsible, and ambitious earth sign ruled by Saturn.",
    aquarius: "Progressive, original, and humanitarian air sign ruled by Uranus.",
    pisces: "Compassionate, artistic, and intuitive water sign ruled by Neptune."
  };
  
  return descriptions[sign.toLowerCase()] || "No description available.";
};

// Helper function to get aspect descriptions
export const getAspectDescription = (aspect) => {
  const descriptions = {
    conjunction: "A powerful merging of energies that amplifies both planets involved.",
    sextile: "A harmonious and creative connection that offers opportunities for growth.",
    square: "A challenging aspect that creates tension and drive for change.",
    trine: "A highly beneficial aspect that creates harmony and flow between planets.",
    opposition: "A polarizing aspect that creates awareness through contrast and balance."
  };
  
  return descriptions[aspect.toLowerCase()] || "No description available.";
};

// Helper function to get element descriptions
export const getElementDescription = (element) => {
  const descriptions = {
    fire: "Dynamic, passionate, and action-oriented energy that drives creativity and confidence.",
    earth: "Practical, reliable, and grounded energy that builds stability and material security.",
    air: "Intellectual, communicative, and social energy that fosters ideas and connections.",
    water: "Emotional, intuitive, and sensitive energy that deepens feelings and empathy."
  };
  
  return descriptions[element.toLowerCase()] || "No description available.";
};

// Helper function to get modality descriptions
export const getModalityDescription = (modality) => {
  const descriptions = {
    cardinal: "Initiating, proactive energy that starts projects and leads change.",
    fixed: "Stable, determined energy that maintains progress and resists disruption.",
    mutable: "Adaptable, flexible energy that adjusts to circumstances and transitions."
  };
  
  return descriptions[modality.toLowerCase()] || "No description available.";
};