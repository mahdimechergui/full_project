import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Slot, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sidebar } from '@/components/Sidebar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments() as readonly string[];
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  const currentTitle = useMemo(() => {
    const last = segments[segments.length - 1] ?? '(tabs)';
    if (last === '(tabs)' || last === 'index') return 'Home';
    if (last === 'agents' || segments.includes('agents')) return 'AI Hub';
    if (last === 'events') return 'Events';
    if (last === 'members') return 'Members';
    if (last === 'vault') return 'Vault';
    if (last === 'sentinel') return 'Security Center';
    return last.charAt(0).toUpperCase() + last.slice(1);
  }, [segments]);

  useEffect(() => {
    Animated.timing(buttonOpacity, {
      toValue: menuOpen ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [menuOpen, buttonOpacity]);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <View style={styles.container}>
        <View style={styles.header}>
          <Animated.View style={[styles.hamburgerContainer, { opacity: buttonOpacity }]}> 
            <Pressable
              style={[styles.hamburgerButton]}
              onPress={() => setMenuOpen(true)}
              disabled={menuOpen}
            >
              <MaterialCommunityIcons name="menu" size={24} color={theme.tint} />
            </Pressable>
          </Animated.View>

          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {currentTitle}
          </Text>
        </View>

        <View style={styles.body}>
          <Slot />
        </View>

        <Sidebar open={menuOpen} setOpen={setMenuOpen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050508',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#050508',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    backgroundColor: 'rgba(8, 10, 14, 0.96)',
    zIndex: 15,
  },
  hamburgerContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hamburgerButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
