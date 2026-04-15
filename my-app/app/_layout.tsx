import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate any initialization if needed
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050508', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Dashboard is now the primary entry point */}
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="sign-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="sign-up-form" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
