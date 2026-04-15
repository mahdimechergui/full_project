import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/themed-text';
import { events } from '@/app/data/vital-data';

const statusStyles = {
  confirmed: { label: 'CONFIRMED', color: '#22c55e', background: '#163f25' },
  planning: { label: 'PLANNING', color: '#f59e0b', background: '#45350c' },
  draft: { label: 'DRAFT', color: '#94a3b8', background: '#111827' },
};

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
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Modal Local State
  const [tempView, setTempView] = useState<ViewState>('month');
  const [focusedDate, setFocusedDate] = useState<Date>(new Date());
  
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

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return events.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(normalizedSearch);
      if (!matchSearch) return false;
      if (!selectedDate) return true;
      const range = eventRanges.find(r => r.event.id === item.id);
      return range ? isDateInRange(selectedDate, range.startDate, range.endDate) : false;
    });
  }, [search, selectedDate, eventRanges]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [filtered.length, selectedDate, fadeAnim]);

  const getMonthMatrix = (refDate: Date) => {
    const firstOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const firstDay = firstOfMonth.getDay();
    const daysIn = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0).getDate();

    const matrix: Array<Array<Date | null>> = [];
    let currentWeek: Array<Date | null> = Array(firstDay).fill(null);

    for (let day = 1; day <= daysIn; day++) {
      currentWeek.push(new Date(refDate.getFullYear(), refDate.getMonth(), day));
      if (currentWeek.length === 7) {
        matrix.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      matrix.push(currentWeek);
    }
    return matrix;
  };

  const getWeekArray = (refDate: Date) => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - refDate.getDay() + i);
      return d;
    });
  };

  const navigateDate = (dir: number) => {
    setFocusedDate(prev => {
      const newD = new Date(prev);
      if (tempView === 'month') newD.setMonth(prev.getMonth() + dir);
      else if (tempView === 'week') newD.setDate(prev.getDate() + dir * 7);
      else if (tempView === 'day') newD.setDate(prev.getDate() + dir);
      return newD;
    });
  };

  const renderDayCell = (day: Date | null, keyStr: string) => {
    if (!day) return <View key={keyStr} style={styles.dayCellEmpty} />;
    
    const isToday = isSameDate(day, today);
    const isSelected = isSameDate(day, focusedDate);
    const hasEvent = markedDates.has(formatDateKey(day));

    return (
      <Pressable 
        key={keyStr}
        onPress={() => setFocusedDate(day)}
        style={[
          styles.dayCell,
          isToday && styles.dayCellToday,
          isSelected && styles.dayCellSelected,
          hasEvent && !isSelected && !isToday && styles.dayCellWithEvent,
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

  const selectedDateLabel = selectedDate
    ? `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : null;

  return (
    <ScreenScrollView contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>Events</ThemedText>
      <ThemedText style={styles.subtitle}>Manage the upcoming schedule across VITAL.</ThemedText>

      <View style={styles.filterInfoRow}>
        <Text style={styles.filterInfoText}>{selectedDateLabel ? `Showing events for ${selectedDateLabel}` : `${filtered.length} upcoming events`}</Text>
        {selectedDate && (
          <Pressable onPress={() => setSelectedDate(null)} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
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
        <Pressable 
          style={styles.filterButton} 
          onPress={() => {
            setFocusedDate(selectedDate || new Date());
            setIsFilterOpen(true);
          }}
        >
          <MaterialCommunityIcons name="filter-variant" size={22} color="#64748b" />
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterOpen}
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Select Date</ThemedText>
              
              <View style={styles.viewToggleGroup}>
                <Pressable onPress={() => setTempView('day')} style={[styles.viewToggleBtn, tempView === 'day' && styles.viewToggleBtnActive]}>
                  <Text style={[styles.viewToggleText, tempView === 'day' && styles.viewToggleTextActive]}>Day</Text>
                </Pressable>
                <Pressable onPress={() => setTempView('week')} style={[styles.viewToggleBtn, tempView === 'week' && styles.viewToggleBtnActive]}>
                  <Text style={[styles.viewToggleText, tempView === 'week' && styles.viewToggleTextActive]}>Week</Text>
                </Pressable>
                <Pressable onPress={() => setTempView('month')} style={[styles.viewToggleBtn, tempView === 'month' && styles.viewToggleBtnActive]}>
                  <Text style={[styles.viewToggleText, tempView === 'month' && styles.viewToggleTextActive]}>Month</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => setIsFilterOpen(false)} style={styles.modalCloseIcon}>
                <MaterialCommunityIcons name="close" size={24} color="#94a3b8" />
              </Pressable>
            </View>

            <View style={styles.modalCalendar}>
              <View style={styles.calNavHeader}>
                <Pressable onPress={() => navigateDate(-1)} style={styles.navBtn}>
                  <MaterialCommunityIcons name="chevron-left" size={24} color="#94a3b8" />
                </Pressable>
                <Text style={styles.calTitleText}>
                  {tempView === 'day' ? `${monthNames[focusedDate.getMonth()]} ${focusedDate.getDate()}, ${focusedDate.getFullYear()}` : `${monthNames[focusedDate.getMonth()]} ${focusedDate.getFullYear()}`}
                </Text>
                <Pressable onPress={() => navigateDate(1)} style={styles.navBtn}>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                </Pressable>
              </View>

              {tempView !== 'day' && (
                <View style={styles.dayNamesRow}>
                  {dayNamesShort.map(n => <Text key={n} style={styles.dayNameText}>{n}</Text>)}
                </View>
              )}

              {tempView === 'month' && getMonthMatrix(focusedDate).map((week, idx) => (
                <View key={`w-${idx}`} style={styles.weekRow}>
                  {week.map((day, dIdx) => renderDayCell(day, `m-${idx}-${dIdx}`))}
                </View>
              ))}

              {tempView === 'week' && (
                <View style={styles.weekRow}>
                  {getWeekArray(focusedDate).map((day, idx) => renderDayCell(day, `w-${idx}`))}
                </View>
              )}

              {tempView === 'day' && (
                <View style={[styles.dayCell, styles.singleDayCell]}>
                  <Text style={styles.dayTextBig}>{focusedDate.getDate()}</Text>
                  <Text style={styles.dayNameBig}>{dayNamesShort[focusedDate.getDay()]}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalButtonCancel} onPress={() => setIsFilterOpen(false)}>
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={styles.modalButtonOk} 
                onPress={() => {
                  setSelectedDate(focusedDate);
                  setIsFilterOpen(false);
                }}
              >
                <Text style={styles.modalButtonOkText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        {filtered.map((event) => {
          const status = statusStyles[event.status as keyof typeof statusStyles] || statusStyles.draft;
          return (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.cardHeaderRow}>
                <ThemedText type="defaultSemiBold" style={styles.eventCardName}>{event.name}</ThemedText>
                <View style={[styles.statusPill, { backgroundColor: status.background }]}> 
                  <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={18} color="#38bdf8" />
                <ThemedText style={styles.detailText}>{event.date}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="clock" size={18} color="#a78bfa" />
                <ThemedText style={styles.detailText}>{event.time}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#f472b6" />
                <ThemedText style={styles.detailText}>{event.venue}</ThemedText>
              </View>
              <View style={styles.metaRow}>
                <ThemedText style={styles.metaText}>{event.attendees.registered}/{event.attendees.capacity} registered</ThemedText>
                <ThemedText style={styles.metaText}>{event.attendees.capacity - event.attendees.registered} remaining</ThemedText>
              </View>

              <View style={styles.actionRow}>
                {event.status === 'confirmed' ? (
                  event.attendees.registered < event.attendees.capacity ? (
                    <Pressable style={styles.joinButton}>
                      <Text style={styles.joinButtonText}>Join</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.fullButton}>
                      <Text style={styles.fullButtonText}>Full</Text>
                    </View>
                  )
                ) : event.status === 'planning' ? (
                  <Pressable style={styles.requestButton}>
                    <Text style={styles.requestButtonText}>Request</Text>
                  </Pressable>
                ) : (
                  <View style={styles.notAvailableBox}>
                    <Text style={styles.notAvailableText}>Not available</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    backgroundColor: '#050508',
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 16,
  },
  filterInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterInfoText: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  clearText: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 12,
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
  filterButton: {
    padding: 4,
  },
  eventCard: {
    padding: 18,
    backgroundColor: '#0f1720',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventCardName: {
    fontSize: 17,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f1720',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  modalCloseIcon: {
    padding: 4,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 4,
  },
  viewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewToggleBtnActive: {
    backgroundColor: '#38bdf8',
  },
  viewToggleText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  viewToggleTextActive: {
    color: '#0f1720',
  },
  modalCalendar: {
    marginBottom: 24,
  },
  calNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calTitleText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  navBtn: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayNameText: {
    flex: 1,
    textAlign: 'center',
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCellEmpty: {
    flex: 1,
    marginHorizontal: 3,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 3,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  dayCellSelected: {
    backgroundColor: '#a855f7',
  },
  dayCellWithEvent: {
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  dayText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#fff',
  },
  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 6,
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  singleDayCell: {
    flex: 0,
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  dayTextBig: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '800',
  },
  dayNameBig: {
    fontSize: 14,
    color: '#a855f7',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButtonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#1e293b',
  },
  modalButtonCancelText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  modalButtonOk: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#a855f7',
  },
  modalButtonOkText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  joinButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fullButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.6,
  },
  fullButtonText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  requestButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notAvailableBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  notAvailableText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
