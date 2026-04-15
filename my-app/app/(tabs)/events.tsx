import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/themed-text';
import { events } from '@/app/data/vital-data';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
type ViewState = 'month' | 'week' | 'day';

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

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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

export default function EventsScreen() {
  const [viewState, setViewState] = useState<ViewState>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const [fadeAnim] = useState(() => new Animated.Value(1));

  const today = new Date();

  const eventRanges = useMemo(() => events.map(event => {
    const { startDate, endDate } = parseEventDateRange(event.date);
    return { event, startDate, endDate };
  }), []);

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    eventRanges.forEach(({ startDate, endDate }) => {
      let current = new Date(startDate);
      while (current <= endDate) {
        set.add(formatDateKey(current));
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
      }
    });
    return set;
  }, [eventRanges]);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstOfMonthDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  const getMonthMatrix = () => {
    const matrix: Array<Array<Date | null>> = [];
    let currentWeek: Array<Date | null> = Array(firstOfMonthDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
      if (currentWeek.length === 7) {
        matrix.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      matrix.push(currentWeek);
    }
    return matrix;
  };

  const getWeekArray = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
      return d;
    });
  };

  const navigateDate = (dir: number) => {
    setSelectedDate(prev => {
      const newD = new Date(prev);
      if (viewState === 'month') newD.setMonth(prev.getMonth() + dir);
      else if (viewState === 'week') newD.setDate(prev.getDate() + dir * 7);
      else if (viewState === 'day') newD.setDate(prev.getDate() + dir);
      return newD;
    });
  };

  const selectedEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return events.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(normalizedSearch);
      if (!matchSearch) return false;
      const range = eventRanges.find(r => r.event.id === item.id);
      return range ? isDateInRange(selectedDate, range.startDate, range.endDate) : false;
    });
  }, [selectedDate, search, eventRanges]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedEvents.length, selectedDate, fadeAnim]);

  const renderDayCell = (day: Date | null, keyStr: string) => {
    if (!day) return <View key={keyStr} style={styles.dayCellEmpty} />;
    
    const isToday = isSameDate(day, today);
    const isSelected = isSameDate(day, selectedDate);
    const hasEvent = markedDates.has(formatDateKey(day));

    return (
      <Pressable 
        key={keyStr}
        onPress={() => setSelectedDate(day)}
        style={({ pressed }) => [
          styles.dayCell,
          isToday && styles.dayCellToday,
          isSelected && styles.dayCellSelected,
          hasEvent && !isSelected && !isToday && styles.dayCellWithEvent,
          pressed && { opacity: 0.75 }
        ]}
      >
        <Text style={[styles.dayText, (isToday || isSelected) && styles.dayTextActive]}>{day.getDate()}</Text>
        <View style={styles.dotsRow}>
          {hasEvent && <View style={[styles.dot, { backgroundColor: isSelected || isToday ? '#fff' : '#22c55e' }]} />}
          {isToday && !hasEvent && <View style={[styles.dot, { backgroundColor: isSelected ? '#a855f7' : '#38bdf8' }]} />}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenScrollView contentStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Events</ThemedText>
        
        <View style={styles.viewToggleGroup}>
          <Pressable 
            style={[styles.viewToggleBtn, viewState === 'day' && styles.viewToggleBtnActive]} 
            onPress={() => setViewState('day')}>
            <Text style={[styles.viewToggleText, viewState === 'day' && styles.viewToggleTextActive]}>Day</Text>
          </Pressable>
          <Pressable 
            style={[styles.viewToggleBtn, viewState === 'week' && styles.viewToggleBtnActive]} 
            onPress={() => setViewState('week')}>
            <Text style={[styles.viewToggleText, viewState === 'week' && styles.viewToggleTextActive]}>Week</Text>
          </Pressable>
          <Pressable 
            style={[styles.viewToggleBtn, viewState === 'month' && styles.viewToggleBtnActive]} 
            onPress={() => setViewState('month')}>
            <Text style={[styles.viewToggleText, viewState === 'month' && styles.viewToggleTextActive]}>Month</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search events..."
          placeholderTextColor="#64748b"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calHeader}>
          <Pressable onPress={() => navigateDate(-1)} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#94a3b8" />
          </Pressable>
          <ThemedText type="subtitle" style={styles.calMonthText}>
            {viewState === 'day' ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` : `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
          </ThemedText>
          <Pressable onPress={() => navigateDate(1)} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
          </Pressable>
        </View>

        {viewState !== 'day' && (
          <View style={styles.dayNamesRow}>
            {dayNamesShort.map(n => <Text key={n} style={styles.dayName}>{n}</Text>)}
          </View>
        )}

        {viewState === 'month' && getMonthMatrix().map((week, idx) => (
          <View key={`week-${idx}`} style={styles.weekRow}>
            {week.map((day, dIdx) => renderDayCell(day, `m-${idx}-${dIdx}`))}
          </View>
        ))}

        {viewState === 'week' && (
          <View style={styles.weekRow}>
            {getWeekArray().map((day, idx) => renderDayCell(day, `w-${idx}`))}
          </View>
        )}

        {viewState === 'day' && (
          <View style={styles.singleDayView}>
             <ThemedText style={{ color: '#94a3b8', fontSize: 15 }}>
               {markedDates.has(formatDateKey(selectedDate)) ? 'Events Scheduled for this day' : 'No Events Today'}
             </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.agendaContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {selectedEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={32} color="#334155" />
              <ThemedText style={{ color: '#64748b', marginTop: 8 }}>No events selected.</ThemedText>
            </View>
          ) : (
            selectedEvents.map((evt) => (
              <View key={evt.id} style={styles.eventItem}>
                <View style={styles.eventTimeCol}>
                  <Text style={styles.eventTime}>{evt.time || 'All Day'}</Text>
                  <View style={styles.eventLine} />
                </View>
                <View style={styles.eventInfoCard}>
                  <View style={styles.eventTypeTag}>
                    <Text style={styles.eventTypeText}>{evt.status.toUpperCase()}</Text>
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.eventName}>{evt.name}</ThemedText>
                  <Text style={styles.eventSubDetails}>{evt.venue}</Text>
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    backgroundColor: '#050508',
    paddingBottom: 40,
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
  searchInput: {
    flex: 1,
    color: '#e2e8f0',
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    marginBottom: 0,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 4,
  },
  viewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: '#38bdf8',
  },
  viewToggleText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  viewToggleTextActive: {
    color: '#0f1720',
  },
  calendarContainer: {
    backgroundColor: '#0f1720',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 24,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calMonthText: {
    fontSize: 18,
    color: '#e2e8f0',
  },
  navBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCellEmpty: {
    flex: 1,
    marginHorizontal: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 46,
    marginHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCellToday: {
    borderColor: '#22c55e',
    backgroundColor: 'transparent',
  },
  dayCellSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  dayCellWithEvent: {
    backgroundColor: '#0c4a6e',
    borderColor: '#38bdf8',
  },
  dayText: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#fff',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    bottom: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  singleDayView: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  agendaContainer: {
    flex: 1,
    paddingTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#0a0f16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderStyle: 'dashed',
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  eventTimeCol: {
    width: 80,
    alignItems: 'center',
  },
  eventTime: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1f2937',
    marginTop: 8,
    borderRadius: 1,
  },
  eventInfoCard: {
    flex: 1,
    backgroundColor: '#0f1720',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  eventTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#082f49',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  eventTypeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  eventName: {
    fontSize: 16,
    marginBottom: 6,
  },
  eventSubDetails: {
    color: '#64748b',
    fontSize: 13,
  },
});
