import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { events, EventItem } from '@/app/data/vital-data';

function parseEventDateRange(dateString: string) {
  const trimmed = dateString.trim();
  const rangeMatch = trimmed.match(/^(\w+)\s+(\d+)-(\d+),\s*(\d{4})$/);
  if (rangeMatch) {
    const [_, month, start, end, year] = rangeMatch;
    const startDate = new Date(`${month} ${start}, ${year}`);
    const endDate = new Date(`${month} ${end}, ${year}`);
    return { startDate, endDate };
  }
  const date = new Date(trimmed);
  return { startDate: date, endDate: date };
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [joinedEventIds, setJoinedEventIds] = useState<number[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      const userRaw = await AsyncStorage.getItem('vital_user_data');
      const imageRaw = await AsyncStorage.getItem('vital_profile_image');
      const eventsRaw = await AsyncStorage.getItem('vital_joined_events');

      if (userRaw) setUserData(JSON.parse(userRaw));
      if (imageRaw) setProfileImage(imageRaw);
      if (eventsRaw) {
        const parsed = JSON.parse(eventsRaw);
        setJoinedEventIds(parsed.map((id: any) => Number(id)));
      }
    };
    loadProfileData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem('vital_profile_image', uri);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Exit", 
          onPress: async () => {
            await AsyncStorage.removeItem('vital_logged_in');
            router.replace('/sign-in');
          }
        }
      ]
    );
  };

  const todayNormalized = new Date();
  todayNormalized.setHours(0, 0, 0, 0);

  const joinedEvents = events.filter(e => joinedEventIds.includes(e.id));
  
  const upcomingJoined = joinedEvents.filter(e => {
    const { endDate } = parseEventDateRange(e.date);
    return endDate >= todayNormalized;
  });

  const pastJoined = joinedEvents.filter(e => {
    const { endDate } = parseEventDateRange(e.date);
    return endDate < todayNormalized;
  });

  const renderMiniEventList = (eventList: EventItem[], title: string) => {
    if (eventList.length === 0) return null;
    return (
      <View style={styles.eventSubSection}>
        <Text style={styles.eventSubTitle}>{title}</Text>
        {eventList.map(event => (
          <View key={event.id} style={styles.eventMiniCard}>
            <View style={[styles.eventIconBox, { backgroundColor: event.status === 'confirmed' ? '#163f25' : '#45350c' }]}>
              <MaterialCommunityIcons 
                name="calendar-check" 
                size={20} 
                color={event.status === 'confirmed' ? '#22c55e' : '#f59e0b'} 
              />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
            <View style={styles.statusTag}>
               <Text style={[styles.statusTabText, { color: event.status === 'confirmed' ? '#22c55e' : '#f59e0b' }]}>
                 {event.status.toUpperCase()}
               </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenScrollView contentStyle={styles.content}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.avatarLetter}>{userData?.fullName?.charAt(0) || 'V'}</Text>
                </View>
              )}
            </View>
            <Pressable style={styles.editIconBtn} onPress={pickImage}>
              <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{userData?.fullName || 'VITAL Member'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'member@tpl.tn'}</Text>
        </View>

        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACADEMIC INFO</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Year</Text>
              <Text style={styles.infoValue}>{userData?.academicYear || 'N/A'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Degree</Text>
              <Text style={styles.infoValue}>{userData?.degree || 'N/A'}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: 12 }]}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userData?.phoneNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Birthday</Text>
              <Text style={styles.infoValue}>{userData?.birthday || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVENTS I JOINED</Text>
          {joinedEvents.length > 0 ? (
            <>
              {renderMiniEventList(upcomingJoined, "Upcoming Activities")}
              {renderMiniEventList(pastJoined, "Historical Records")}
            </>
          ) : (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyText}>You haven't joined any events yet.</Text>
            </View>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.footer}>
          <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
          <Text style={styles.versionText}>VITAL v1.0.4 - Developer Build</Text>
        </View>

      </ScreenScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#a855f7',
    padding: 4,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#a855f7',
    fontSize: 42,
    fontWeight: '900',
  },
  editIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#a855f7',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#050508',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    color: '#64748b',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  eventSubSection: {
    marginBottom: 20,
  },
  eventSubTitle: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
  eventMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  eventIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  eventDate: {
    color: '#64748b',
    fontSize: 12,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTabText: {
    fontSize: 9,
    fontWeight: '800',
  },
  emptyEvents: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 16,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ef444415',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ef444430',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 40,
  },
});
