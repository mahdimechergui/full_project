import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function EnterScreen() {
  const router = useRouter();
  const [scale] = useState(new Animated.Value(1));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEnter = async () => {
    // Pulse animation
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(async () => {
      await AsyncStorage.setItem('vital_logged_in', 'true');
      router.replace('/(tabs)');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.content, { opacity }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>VITAL</Text>
          <View style={styles.glowLine} />
        </View>
        
        <Text style={styles.tagline}>AI-DRIVEN MANAGEMENT SYSTEM</Text>

        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleEnter}
          >
            <Text style={styles.buttonText}>ENTER VITAL</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
    textShadowColor: 'rgba(168, 85, 247, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  glowLine: {
    width: 60,
    height: 4,
    backgroundColor: '#a855f7',
    borderRadius: 2,
    marginTop: -10,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  tagline: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 60,
    fontWeight: '600',
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#a855f7',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  buttonPressed: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
