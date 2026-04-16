import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/themed-text';
import { members, MemberRecord } from '@/app/data/vital-data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const roleStyles = {
  President: { background: '#0f1720', color: '#06b6d4' },
  'Vice President': { background: '#0f1720', color: '#a855f7' },
  Treasurer: { background: '#0f1720', color: '#ec4899' },
  'Events Coordinator': { background: '#0f1720', color: '#f97316' },
  Member: { background: '#0f1720', color: '#94a3b8' },
};

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const filtered = members.filter((member) =>
    [member.name, member.email, member.role].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  const openPanel = (member: MemberRecord) => {
    setSelectedMember(member);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePanel = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedMember(null);
    });
  };


  return (
    <View style={styles.container}>
      <ScreenScrollView contentStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>Members</ThemedText>
        <ThemedText style={styles.subtitle}>Directory of our club members and leads.</ThemedText>

        <View style={styles.searchRow}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, role or dept..."
            placeholderTextColor="#64748b"
            style={styles.input}
          />
        </View>

        <View style={styles.listContainer}>
          {filtered.map((member) => (
            <Pressable 
              key={member.id} 
              style={({ pressed }) => [
                styles.memberRow,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => openPanel(member)}
            >
              <Image source={{ uri: member.avatar }} style={styles.rowAvatar} />
              <View style={styles.rowInfo}>
                <ThemedText style={styles.rowName}>{member.name}</ThemedText>
                <ThemedText style={styles.rowSub}>{member.role} • {member.year}</ThemedText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
            </Pressable>
          ))}
        </View>
      </ScreenScrollView>

      {/* Sliding Panel Overlay */}
      {selectedMember && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={styles.overlayDismiss} onPress={closePanel} />
        </Animated.View>
      )}

      {/* Sliding Panel */}
      <Animated.View 
        style={[
          styles.slidePanel, 
          { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 20 }
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8, 10, 14, 0.98)' }]} />
        )}
        
        <View style={styles.panelHandle} />
        
        {selectedMember && (
          <View style={styles.panelContent}>
            <View style={styles.panelHeader}>
              <Image source={{ uri: selectedMember.avatar }} style={styles.largeAvatar} />
              <ThemedText type="defaultSemiBold" style={styles.panelName}>{selectedMember.name}</ThemedText>
              <View style={[styles.rolePill, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <ThemedText style={styles.roleText}>{selectedMember.role}</ThemedText>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <DetailRow label="Email" value={selectedMember.email} icon="email-outline" />
              <DetailRow label="Phone" value={selectedMember.phone} icon="phone-outline" />
              <DetailRow label="Birthday" value={selectedMember.birthday} icon="cake-variant-outline" />
              <DetailRow label="Degree" value={selectedMember.degree} icon="school-outline" />
              <DetailRow label="Department" value={selectedMember.department} icon="book-outline" />
              <DetailRow label="Joined" value={selectedMember.joinDate} icon="clock-outline" />
            </View>

            <Pressable style={styles.closeButton} onPress={closePanel}>
              <ThemedText style={styles.closeButtonText}>CLOSE PROFILE</ThemedText>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={18} color="#a855f7" />
      </View>
      <View>
        <ThemedText style={styles.detailLabel}>{label}</ThemedText>
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
      </View>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#f1f5f9',
    fontSize: 15,
  },
  listContainer: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080a0e',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#111827',
  },
  rowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 13,
    color: '#64748b',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
  },
  overlayDismiss: {
    flex: 1,
  },
  slidePanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    zIndex: 101,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  panelContent: {
    flex: 1,
    padding: 30,
  },
  panelHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#a855f7',
  },
  panelName: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});