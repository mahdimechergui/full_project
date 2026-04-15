import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/themed-text';
import { events } from '@/app/data/vital-data';

const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateInRange(date: Date, start: Date, end: Date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return normalized >= startTime && normalized <= endTime;
}

const metrics = [
  { label: 'Active Members', value: '156', icon: 'account-group-outline', accent: '#38bdf8', detail: '+12% last month' },
  { label: 'Events This Month', value: '8', icon: 'calendar-month', accent: '#a855f7', detail: '5 upcoming' },
  { label: 'Budget Usage', value: '68%', icon: 'cash-multiple', accent: '#ec4899', detail: '$6,800 / $10,000' },
  { label: 'Security Alerts', value: '2', icon: 'shield-alert-outline', accent: '#f97316', detail: 'Low priority' },
];

const agentCards: { route: any, label: string, icon: string }[] = [
  { route: '/agents?agent=architect', label: 'Architect', icon: 'brain' },
  { route: '/agents?agent=liaison', label: 'Liaison', icon: 'message-text-outline' },
  { route: '/agents?agent=archivist', label: 'Archivist', icon: 'database' },
  { route: '/agents/sentinel', label: 'Security Center', icon: 'shield-check' },
];

export default function HomeScreen() {
  const router = useRouter();

  const today = new Date();
  const currentWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  const eventRanges = events.map(e => {
    const { startDate, endDate } = parseEventDateRange(e.date);
    return { event: e, startDate, endDate };
  });

  return (
    <ScreenScrollView contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>Club Vital Signs</ThemedText>
      <ThemedText style={styles.subtitle}>Overview of health, AI operations, and next actions.</ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={{ marginBottom: 4 }}>This Week's Schedule</ThemedText>
        <View style={styles.scheduleRow}>
          {currentWeek.map((day, idx) => {
            const isToday = isSameDate(day, today);
            const dayEvents = eventRanges.filter(r => isDateInRange(day, r.startDate, r.endDate));
            const hasEvent = dayEvents.length > 0;
            
            return (
              <Pressable 
                key={idx}
                onPress={() => router.push('/events')}
                style={({ pressed }) => [
                  styles.scheduleDay,
                  isToday && styles.scheduleToday,
                  hasEvent && !isToday && styles.scheduleDayWithEvent,
                  pressed && { opacity: 0.75 }
                ]}
              >
                <ThemedText style={[styles.scheduleDayName, isToday && styles.scheduleTodayText]}>{dayNamesShort[day.getDay()]}</ThemedText>
                <ThemedText style={[styles.scheduleDayNumber, isToday && styles.scheduleTodayText]}>{day.getDate()}</ThemedText>
                
                <View style={styles.indicatorContainer}>
                  {hasEvent && <View style={[styles.scheduleEventDot, { backgroundColor: '#38bdf8' }]} />}
                  {isToday && <View style={[styles.scheduleEventDot, { backgroundColor: '#22c55e' }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={[styles.metricCard, { borderColor: metric.accent }]}> 
            <View style={[styles.metricIcon, { backgroundColor: `${metric.accent}20` }]}>
              <MaterialCommunityIcons name={metric.icon as any} size={20} color={metric.accent} />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.metricValue}>{metric.value}</ThemedText>
            <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
            <ThemedText style={styles.metricDetail}>{metric.detail}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">AI Assistants</ThemedText>
          <ThemedText style={styles.sectionHint}>Tap a card to open its agent.</ThemedText>
        </View>
        <View style={styles.grid}>
          {agentCards.map((card) => (
            <Pressable
              key={card.route}
              onPress={() => router.push(card.route)}
              style={({ pressed }) => [styles.agentCard, pressed && styles.agentCardPressed]}
            >
              <View style={styles.agentIcon}>
                <MaterialCommunityIcons name={card.icon as any} size={22} color="#a855f7" />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.agentLabel}>{card.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

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
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 18,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 24,
  },
  scheduleDay: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#0f1720',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 72,
  },
  scheduleToday: {
    borderColor: '#a855f7',
    backgroundColor: '#2e1065',
  },
  scheduleDayWithEvent: {
    borderColor: '#0284c7',
    backgroundColor: '#0c4a6e',
  },
  scheduleDayName: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
    fontWeight: '600',
  },
  scheduleDayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  scheduleTodayText: {
    color: '#fff',
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 6,
    gap: 4,
  },
  scheduleEventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#0f1720',
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    marginBottom: 6,
  },
  metricLabel: {
    color: '#cbd5e1',
    marginBottom: 6,
  },
  metricDetail: {
    color: '#94a3b8',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  agentCard: {
    width: '48%',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#0f1720',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  agentCardPressed: {
    opacity: 0.85,
  },
  agentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  agentLabel: {
    fontSize: 16,
  },
});
