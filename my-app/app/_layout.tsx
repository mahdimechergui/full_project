import 'react-native-reanimated';
import { createContext, useContext, useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Simple Auth Context to share state between screens and layout
export const AuthContext = createContext<{
  isLoggedIn: boolean | null;
  setIsLoggedIn: (val: boolean) => void;
}>({
  isLoggedIn: null,
  setIsLoggedIn: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const val = await AsyncStorage.getItem('vital_logged_in');
        setIsLoggedIn(val === 'true');
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn === null) return;

    // These screens are accessible when NOT logged in
    const isAuthPath = segments[0] === 'sign-in' || segments[0] === 'sign-up-form';

    if (!isLoggedIn && !isAuthPath) {
      router.replace('/sign-in');
    } else if (isLoggedIn && isAuthPath) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments]);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050508', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" options={{ animation: 'fade' }} />
            <Stack.Screen name="sign-up-form" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
