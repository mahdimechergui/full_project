import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/themed-text';
import { archivistExampleQueries } from '@/app/data/vital-data';

type SearchResult = {
  title: string;
  source: string;
  date: string;
  summary: string;
  relevance: number;
  tags: string[];
};

export default function ArchivistScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const normalized = query.toLowerCase();
      let loaded: SearchResult[] = [];

      if (normalized.includes('hackathon') || normalized.includes('sponsor')) {
        loaded = [
          {
            title: 'Hackathon 2024 - Sponsor Feedback Summary',
            source: 'Meeting Minutes',
            date: 'Mar 15, 2024',
            summary:
              'Sponsors from TechCorp and InnovateTN offered positive feedback. TechCorp requested more talent exposure, while InnovateTN asked for longer networking sessions.',
            relevance: 95,
            tags: ['Hackathon', 'Sponsors', 'Feedback'],
          },
        ];
      } else if (normalized.includes('workshop') || normalized.includes('react')) {
        loaded = [
          {
            title: 'React Workshop Retrospective',
            source: 'Event Report',
            date: 'Feb 5, 2025',
            summary:
              '62 attendees, 85% participation rate, excellent satisfaction. Recommend preread materials and additional hands-on time.',
            relevance: 92,
            tags: ['Workshop', 'React', 'Feedback'],
          },
        ];
      } else {
        loaded = [
          {
            title: 'TPL Club Annual Summary',
            source: 'Annual Report',
            date: 'Oct 1, 2024',
            summary:
              '156 active members, 12 major events, and 5 corporate partnerships. Focus areas include AI workshops, hackathons, and career development.',
            relevance: 70,
            tags: ['Overview', 'Report'],
          },
        ];
      }
      setResults(loaded);
      setSearching(false);
    }, 1400);
  };

  return (
    <ScreenScrollView contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>Archivist Agent</ThemedText>
      <ThemedText style={styles.subtitle}>Search club knowledge using retrieval-augmented intelligence.</ThemedText>

      <View style={styles.formCard}>
        <ThemedText type="subtitle">Query the archives</ThemedText>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ask about past events, budgets, or partner feedback"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        <Pressable style={[styles.button, searching && styles.buttonDisabled]} onPress={handleSearch} disabled={searching}>
          <MaterialCommunityIcons name={searching ? 'progress-clock' : 'magnify'} size={20} color="#000" />
          <ThemedText style={styles.buttonText}>{searching ? 'Searching…' : 'Search Archives'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.exampleSection}>
        <ThemedText type="subtitle">Try one of these</ThemedText>
        <View style={styles.queryList}>
          {archivistExampleQueries.map((item) => (
            <Pressable key={item} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]} onPress={() => setQuery(item)}>
              <ThemedText>{item}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsSection}>
          {results.map((result) => (
            <View key={result.title} style={styles.resultCard}>
              <View style={styles.resultTitleRow}>
                <ThemedText type="defaultSemiBold">{result.title}</ThemedText>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{result.relevance}%</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.resultMeta}>{result.source} · {result.date}</ThemedText>
              <ThemedText style={styles.resultText}>{result.summary}</ThemedText>
              <View style={styles.tagsRow}>
                {result.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>{<ThemedText style={styles.tagText}>{tag}</ThemedText>}</View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
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
  formCard: {
    padding: 18,
    backgroundColor: '#0f1720',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  input: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    color: '#e2e8f0',
    backgroundColor: '#020617',
    marginBottom: 14,
  },
  button: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#f472b6',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
  },
  exampleSection: {
    marginBottom: 20,
  },
  queryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#0f1720',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  resultTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  resultMeta: {
    color: '#94a3b8',
    marginBottom: 10,
  },
  resultText: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});