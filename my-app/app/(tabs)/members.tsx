import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/themed-text';
import { members } from '@/app/data/vital-data';

const roleStyles = {
  President: { background: '#0f1720', color: '#06b6d4' },
  'Vice President': { background: '#0f1720', color: '#a855f7' },
  Treasurer: { background: '#0f1720', color: '#ec4899' },
  'Events Coordinator': { background: '#0f1720', color: '#f97316' },
  Member: { background: '#0f1720', color: '#94a3b8' },
};

export default function MembersScreen() {
  const [search, setSearch] = useState('');
  const filtered = members.filter((member) =>
    [member.name, member.email, member.role].some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ScreenScrollView contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>Members</ThemedText>
      <ThemedText style={styles.subtitle}>Club directory, roles, and access information.</ThemedText>

      <View style={styles.searchRow}>
        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search members by name, email, or role"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      {filtered.map((member) => {
        const style = roleStyles[member.role as keyof typeof roleStyles] ?? roleStyles.Member;
        return (
          <View key={member.id} style={styles.profileCard}>
            <View style={styles.headerRow}>
              <ThemedText type="defaultSemiBold">{member.name}</ThemedText>
              <View style={[styles.rolePill, { backgroundColor: style.background }]}> 
                <ThemedText style={[styles.roleText, { color: style.color }]}>{member.role}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.detailText}>{member.email}</ThemedText>
            <ThemedText style={styles.detailText}>{member.phone}</ThemedText>
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaText}>{member.department}</ThemedText>
              <ThemedText style={styles.metaText}>{member.year}</ThemedText>
              <ThemedText style={styles.metaText}>{member.joinDate}</ThemedText>
            </View>
          </View>
        );
      })}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050508',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: '#e2e8f0',
  },
  profileCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#0f1720',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailText: {
    color: '#cbd5e1',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});