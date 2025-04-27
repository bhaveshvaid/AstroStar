// src/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';

import GradientBackground from '../components/GradientBackground';
import { getBirthChart } from '../services/storageService';
import { saveChatMessage, getChatHistory } from '../services/firebaseService';
import { theme } from '../styles/theme';

const GEMINI_API_KEY = 'AIzaSyAemAcnt52UP4X8e1TxCyekmds2jZi1Ixs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [birthChart, setBirthChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Animation values for typing indicator
  const [dot1Opacity] = useState(new Animated.Value(0.4));
  const [dot2Opacity] = useState(new Animated.Value(0.4));
  const [dot3Opacity] = useState(new Animated.Value(0.4));
  
  const flatListRef = useRef(null);

  useEffect(() => {
    loadBirthChart();
    loadChatHistory();
  }, []);
  
  // Set up typing animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          // Dot 1 animation
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot1Opacity, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          // Dot 2 animation
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          // Dot 3 animation
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTyping]);

  const loadBirthChart = async () => {
    try {
      const chart = await getBirthChart();
      setBirthChart(chart);
    } catch (error) {
      console.error('Error loading birth chart:', error);
    }
  };
  
  const loadChatHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // Add welcome message if no user logged in
        setMessages([{
          id: '1',
          text: 'Hello! I am your cosmic assistant. Ask me anything about astrology, your birth chart, or get personalized guidance.',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        }]);
        return;
      }
      
      // Get existing chat history
      const history = await getChatHistory(userId);
      
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Add welcome message if no history
        setMessages([{
          id: '1',
          text: 'Hello! I am your cosmic assistant. Ask me anything about astrology, your birth chart, or get personalized guidance.',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to welcome message on error
      setMessages([{
        id: '1',
        text: 'Hello! I am your cosmic assistant. Ask me anything about astrology, your birth chart, or get personalized guidance.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Add to state
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    
    // Save to Firebase if user is logged in
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        await saveChatMessage(userId, userMessage);
      }
    } catch (error) {
      console.error('Error saving user message:', error);
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Create prompt with birth chart context if available
      let prompt = userMessage.text;
      
      if (birthChart) {
        prompt = `As a friendly astrological assistant, give a brief response to this question. Keep it conversational, like we're chatting.
        
        User's birth chart:
        - Sun Sign: ${birthChart.sunSign}
        - Moon Sign: ${birthChart.moonSign}
        - Ascendant: ${birthChart.ascendant}
        - Planets: ${Object.entries(birthChart.planets)
            .map(([planet, data]) => `${planet} in ${data.sign}`)
            .join(', ')}
        
        User Question: ${prompt}
        
        Use simple language, vary your response length (but keep under 100 words), and format with markdown where helpful. Sound like a person, not an encyclopedia.`;
      } else {
        // Add markdown request even without birth chart
        prompt = `As a friendly astrological assistant, please respond to: "${prompt}"
        
        Keep it conversational, like we're chatting. Use simple language, vary your response length (but keep under 100 words), and format with markdown where helpful. Sound like a person, not an encyclopedia.`;
      }
      
      // Call Gemini API
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          }
        }
      );
      
      // Add assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.candidates[0].content.parts[0].text,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      // Hide typing indicator after a short delay to ensure smooth transition
      setTimeout(() => {
        setIsTyping(false);
        
        // Add to state
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        
        // Save to Firebase if user is logged in
        const saveMessage = async () => {
          try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
              await saveChatMessage(userId, assistantMessage);
            }
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }
        };
        
        saveMessage();
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the cosmos right now. Please try again later.",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      // Hide typing indicator
      setIsTyping(false);
      
      // Add to state
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Icon name="star" size={20} color={theme.colors.cosmic.stardustGold} />
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {isUser ? (
            <Text style={styles.messageText}>{item.text}</Text>
          ) : (
            <Markdown
              style={markdownStyles}
            >
              {item.text}
            </Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cosmic Chat</Text>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />
        
        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.avatarContainer}>
              <Icon name="star" size={20} color={theme.colors.cosmic.stardustGold} />
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingAnimation}>
                <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
                <Animated.View style={[styles.typingDot, { opacity: dot2Opacity }]} />
                <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask the stars..."
            placeholderTextColor="#BBBBBB"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.disabledButton]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <Icon name="loading" size={24} color="#FFFFFF" />
            ) : (
              <Icon name="send" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

// Markdown styles
const markdownStyles = {
  body: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  heading1: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  heading2: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  heading3: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  link: {
    color: theme.colors.cosmic.stardustGold,
    textDecorationLine: 'underline',
  },
  blockquote: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: theme.colors.cosmic.stardustGold,
    borderLeftWidth: 4,
    paddingLeft: 8,
    marginLeft: 0,
  },
  code_block: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  code_inline: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: theme.colors.cosmic.etherealTeal,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    padding: 2,
  },
  list_item: {
    color: '#FFFFFF',
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet_list: {
    marginLeft: 10,
  },
  ordered_list: {
    marginLeft: 10,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    marginVertical: 10,
  },
  tableHeaderCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: theme.roundness,
    padding: 12,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.roundness,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.5)',
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginLeft: 10,
    alignItems: 'center',
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.roundness,
    padding: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  typingAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: 50,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
});

export default ChatScreen;