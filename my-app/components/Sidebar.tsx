import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const navItems = [
  { key: 'index', label: 'Home', icon: 'view-dashboard-outline', route: '/(tabs)' },
  { key: 'agents', label: 'AI Hub', icon: 'robot', route: '/(tabs)/agents' },
  { key: 'events', label: 'Events', icon: 'calendar-month', route: '/(tabs)/events' },
  { key: 'members', label: 'Members', icon: 'account-group-outline', route: '/(tabs)/members' },
  { key: 'vault', label: 'Vault', icon: 'shield-lock-outline', route: '/(tabs)/vault' },
  { key: 'sentinel', label: 'Security Center', icon: 'shield-check', route: '/(tabs)/agents/sentinel' },
] as const;

const drawerWidth = Math.min(Dimensions.get('window').width * 0.72, 300);

export function Sidebar({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const router = useRouter();
  const segments = useSegments() as readonly string[];
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const activeKey = useMemo(() => {
    const last = segments[segments.length - 1] ?? 'index';
    if (last === '(tabs)') return 'index';
    if (last === 'sentinel') return 'sentinel';
    if (segments.includes('agents')) return 'agents';
    return last;
  }, [segments]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: open ? 0 : -drawerWidth,
        duration: 240,
        useNativeDriver: false,
      }),
      Animated.timing(overlayOpacity, {
        toValue: open ? 0.55 : 0,
        duration: 240,
        useNativeDriver: false,
      }),
    ]).start();
  }, [open, translateX, overlayOpacity]);

  const handleNavigate = (route: typeof navItems[number]['route']) => {
    setOpen(false);
    router.push(route as any);
  };

  const handleReset = async () => {
    setOpen(false);
    await AsyncStorage.removeItem('vital_logged_in');
    router.replace('/enter');
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { width: drawerWidth, transform: [{ translateX }] }]}> 
        <View style={[styles.drawerContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}> 

          {navItems.map((item) => {
            const active = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleNavigate(item.route)}
                style={({ pressed }) => [
                  styles.itemButton,
                  active && { backgroundColor: theme.tint + '18' },
                  pressed && styles.itemButtonPressed,
                ]}
              >
                <View style={[styles.iconBox, active && { backgroundColor: theme.tint + '22' }]}> 
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={active ? theme.tint : '#94a3b8'} />
                </View>
                <View style={styles.itemLabelWrapper}>
                  <Text style={[styles.itemLabel, active && { color: theme.tint }]}>{item.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable 
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && { opacity: 0.7 }
            ]}
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#475569" />
            <Text style={styles.resetText}>RESET SESSION</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  hamburgerButton: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 10, 14, 0.96)',
    borderRightWidth: 1,
    borderRightColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 24,
    zIndex: 25,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 10,
  },
  itemButtonPressed: {
    opacity: 0.9,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  itemLabelWrapper: {
    marginLeft: 14,
    flex: 1,
  },
  itemLabel: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    opacity: 0.5,
  },
  resetText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
