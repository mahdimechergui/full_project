import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, RefreshControl, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { events as allEvents, EventItem } from '../data/vital-data';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('vital_user_data');
      const imageJson = await AsyncStorage.getItem('vital_profile_image');
      const joinedJson = await AsyncStorage.getItem('vital_joined_events');

      if (userJson) setUserData(JSON.parse(userJson));
      if (imageJson) setProfileImage(imageJson);

      if (joinedJson) {
        const joinedIds: number[] = JSON.parse(joinedJson);
        const filtered = allEvents.filter(e => joinedIds.includes(e.id));
        setJoinedEvents(filtered);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const parseDate = (dateStr: string) => {
    // Current date format in vital-data is "April 25, 2026" or "May 5-7, 2026"
    // We'll use a simplified parser for comparison
    const yearMatch = dateStr.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    
    // Default to future if parsing fails to avoid showing as "past" prematurely
    try {
      // Basic check for month
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthIndex = months.findIndex(m => dateStr.includes(m));
      
      const dayMatch = dateStr.match(/(\d+)/);
      const day = dayMatch ? parseInt(dayMatch[1]) : 1;
      
      return new Date(year, monthIndex === -1 ? 0 : monthIndex, day);
    } catch {
      return new Date(2099, 0, 1);
    }
  };

  const now = new Date();
  const upcomingEvents = joinedEvents.filter(e => parseDate(e.date) >= now);
  const pastEvents = joinedEvents.filter(e => parseDate(e.date) < now);

  const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoIconBox}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#a855f7" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  const EventItemCard = ({ event }: { event: EventItem }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventName}>{event.name}</Text>
        <View style={styles.eventMeta}>
          <MaterialCommunityIcons name="calendar" size={14} color="#94a3b8" />
          <Text style={styles.eventDate}>{event.date}</Text>
          <MaterialCommunityIcons name="map-marker" size={14} color="#94a3b8" style={{ marginLeft: 12 }} />
          <Text style={styles.eventDate}>{event.venue.split(',')[0]}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#4b5563" />
    </View>
  );

  return (
    <ScreenScrollView 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          <Image 
            source={profileImage ? { uri: profileImage } : require('../../assets/images/favicon.png')} 
            style={styles.profilePhoto} 
          />
        </View>
        <Text style={styles.fullName}>{userData?.fullName || 'Member Name'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Information</Text>
        <View style={styles.cardsContainer}>
          <InfoCard label="Email" value={userData?.email} icon="email-outline" />
          <InfoCard label="Phone Number" value={userData?.phone} icon="phone-outline" />
          <InfoCard label="Birthday" value={userData?.birthday} icon="cake-variant-outline" />
          <InfoCard label="Academic Year" value={userData?.year} icon="school-outline" />
          <InfoCard label="Degree" value={userData?.degree} icon="book-education-outline" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events Section</Text>
        
        <Text style={styles.subSectionTitle}>Events I will attend (upcoming)</Text>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(e => <EventItemCard key={e.id} event={e} />)
        ) : (
          <Text style={styles.emptyText}>No upcoming events</Text>
        )}

        <Text style={styles.subSectionTitle}>Events I attended (past)</Text>
        {pastEvents.length > 0 ? (
          pastEvents.map(e => <EventItemCard key={e.id} event={e} />)
        ) : (
          <Text style={styles.emptyText}>No past events recorded</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [styles.btn, styles.editBtn, pressed && styles.btnPressed]}
          onPress={() => router.push('/edit-profile')}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#fff" style={styles.btnIcon} />
          <Text style={styles.btnText}>Edit Profile</Text>
        </Pressable>

        <Pressable 
          style={({ pressed }) => [styles.btn, styles.signOutBtn, pressed && styles.btnPressed]}
          onPress={() => {
            Alert.alert(
              "Sign Out",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Sign Out", 
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.removeItem('vital_logged_in');
                    router.replace('/sign-in');
                  }
                }
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#fff" style={styles.btnIcon} />
          <Text style={styles.btnText}>Sign Out</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  editPhotoIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#a855f7',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#050508',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a855f7',
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardsContainer: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#f1f5f9',
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  editBtn: {
    backgroundColor: '#a855f7',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  signOutBtn: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  btnIcon: {
    marginRight: 10,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
