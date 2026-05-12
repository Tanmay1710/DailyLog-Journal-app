/**
 * EntryHistoryScreen
 *
 * Entry history with filters and streak metrics — wireframe-aligned (Wireframe 5).
 * Features: Filter pill tabs (All, This Week, Streak), current + best streak metrics,
 * entry rows with date, key labels, rating/theme preview, "View" tag,
 * date grouping with section headers, tap to view entry detail modal.
 */

import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { Entry, Journal, JournalFieldDefinition } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { entryService } from '@services/entryService';
import { journalService } from '@services/journalService';
import { PillBar } from '@components/Common/PillBar';
import { MetricBadge } from '@components/Common/MetricBadge';
import { HeroCard } from '@components/Common/HeroCard';
import { Button } from '@components/Common/Button';
import { InlineBanner } from '@components/Common/InlineBanner';
import { LoadingSkeleton } from '@components/Common/LoadingSkeleton';
import { lightColors } from '@constants/colors';
import { radii, shadows } from '@constants/layout';

type EntryHistoryRouteProp = RouteProp<JournalStackParamList, 'EntryHistory'>;

type FilterKey = 'all' | 'week' | 'streak';

const FILTER_PILLS = [
  { label: 'All', key: 'all' },
  { label: 'This Week', key: 'week' },
  { label: 'Streak', key: 'streak' },
];

/** Format YYYY-MM-DD to "May 12, 2026" */
const formatFullDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};

/** Check if a date string is within the current ISO week */
const isCurrentWeek = (dateStr: string): boolean => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
};

interface EntryDetailModalProps {
  visible: boolean;
  entry: Entry | null;
  journal: Journal | null;
  onClose: () => void;
}

/** Modal showing full entry details with field labels */
function EntryDetailModal({ visible, entry, journal, onClose }: EntryDetailModalProps): JSX.Element | null {
  if (!entry) return null;

  const getFieldLabel = (fieldId: string): string => {
    if (!journal) return fieldId;
    const field = journal.fieldSchema.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const getFieldType = (fieldId: string): JournalFieldDefinition | undefined => {
    return journal?.fieldSchema.find((f) => f.id === fieldId);
  };

  const renderFieldValue = (fieldId: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    const field = getFieldType(fieldId);
    if (field?.type === 'rating') return `${value} ★`;
    return String(value);
  };

  // Filter out internal fields
  const displayFields = Object.entries(entry.fieldValues).filter(
    ([key]) => !key.startsWith('_')
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(31, 28, 24, 0.35)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: lightColors.surface,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            borderWidth: 1,
            borderColor: lightColors.line,
            borderBottomWidth: 0,
            maxHeight: '80%',
            ...shadows.elevated,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: radii.full, backgroundColor: lightColors.line }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Date header */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: lightColors.text, marginBottom: 4 }}>
              {formatFullDate(entry.entryDate)}
            </Text>
            <Text style={{ fontSize: 12, color: lightColors.muted, marginBottom: 16 }}>
              Logged at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            {/* Field values */}
            {displayFields.map(([fieldId, value]) => (
              <View
                key={fieldId}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 10,
                  borderTopWidth: 1,
                  borderTopColor: lightColors.line,
                }}
              >
                <Text style={{ fontSize: 13, color: lightColors.muted, width: 100, fontWeight: '500' }}>
                  {getFieldLabel(fieldId)}
                </Text>
                <Text style={{ fontSize: 14, color: lightColors.text, flex: 1 }}>
                  {renderFieldValue(fieldId, value)}
                </Text>
              </View>
            ))}

            {displayFields.length === 0 ? (
              <Text style={{ fontSize: 14, color: lightColors.muted, textAlign: 'center', paddingVertical: 20 }}>
                No field data recorded.
              </Text>
            ) : null}

            <View style={{ marginTop: 16 }}>
              <Button title="Close" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** Returns a concise preview summary of the entry's field values. */
const getEntryPreview = (entry: Entry, journal: Journal | null): string => {
  if (!journal) {
    const values = Object.values(entry.fieldValues).filter(
      (v) => v !== null && v !== undefined && v !== ''
    );
    return values.slice(0, 3).map(String).join(', ');
  }
  const parts: string[] = [];
  for (const field of journal.fieldSchema) {
    const value = entry.fieldValues[field.id];
    if (value === null || value === undefined || value === '') continue;
    const display = field.type === 'rating' ? `${value}` : field.type === 'date' ? String(value) : String(value);
    parts.push(`${field.label}: ${display}`);
    if (parts.length >= 2) break;
  }
  return parts.join(' · ') || 'No data';
};

export function EntryHistoryScreen(): JSX.Element {
  const route = useRoute<EntryHistoryRouteProp>();
  const { journalId } = route.params;

  const [entries, setEntries] = useState<Entry[]>([]);
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadEntries = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await entryService.getEntries(journalId);
      setEntries(data);
    } catch {
      setError('Failed to load entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [journalId]);

  const loadJournal = useCallback(async (): Promise<void> => {
    try {
      const data = await journalService.getJournal(journalId);
      setJournal(data);
    } catch {
      // journal labels are optional
    }
  }, [journalId]);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const currentStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const entryDates = new Set(entries.map((entry) => entry.entryDate));
    let streak = 0;
    let current = parseDateString(entries[0].entryDate);
    while (entryDates.has(formatDateString(current))) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }, [entries]);

  const bestStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const dates = [...new Set(entries.map((e) => e.entryDate))].sort();
    let best = 0;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = parseDateString(dates[i - 1]);
      const curr = parseDateString(dates[i]);
      const diffMs = prev.getTime() - curr.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays === 1) {
        current++;
      } else {
        best = Math.max(best, current);
        current = 1;
      }
    }
    return Math.max(best, current);
  }, [entries]);

  /** Filter entries based on active pill */
  const filteredEntries = useMemo(() => {
    switch (filterKey) {
      case 'week':
        return entries.filter((e) => isCurrentWeek(e.entryDate));
      case 'streak':
        // Show entries that are part of the current streak
        if (currentStreak === 0) return [];
        const streakDates = new Set<string>();
        let current = parseDateString(entries[0]?.entryDate || '');
        for (let i = 0; i < currentStreak; i++) {
          streakDates.add(formatDateString(current));
          current.setDate(current.getDate() - 1);
        }
        return entries.filter((e) => streakDates.has(e.entryDate));
      default:
        return entries;
    }
  }, [entries, filterKey, currentStreak]);

  const handleEntryPress = (entry: Entry): void => {
    setSelectedEntry(entry);
    setShowDetail(true);
  };

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
      void loadJournal();
    }, [loadEntries, loadJournal])
  );

  // Loading state
  if (isLoading && entries.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, padding: 16 }}>
        <LoadingSkeleton card />
        <View style={{ height: 12 }} />
        <LoadingSkeleton card />
        <View style={{ height: 12 }} />
        <LoadingSkeleton card />
      </View>
  );
  }

  return (
    <View style={{ flex: 1, backgroundColor: lightColors.bg }}>
      {/* Entry detail modal */}
      <EntryDetailModal
        visible={showDetail}
        entry={selectedEntry}
        journal={journal}
        onClose={() => setShowDetail(false)}
      />

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void loadEntries()}
            tintColor={lightColors.accent}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        ListHeaderComponent={
          <>
            {/* Error banner */}
            {error ? (
              <View style={{ marginBottom: 12 }}>
                <InlineBanner message={error} variant="danger" />
              </View>
            ) : null}

            {/* Filter pill tabs */}
            <PillBar
              pills={FILTER_PILLS}
              activeKey={filterKey}
              onChange={(key) => setFilterKey(key as FilterKey)}
            />

            {/* Streak metrics card */}
            {entries.length > 0 ? (
              <HeroCard
                sectionLabel="Streak"
                title={`🔥 ${currentStreak} day${currentStreak !== 1 ? 's' : ''}`}
                metric={<MetricBadge label="Best" value={bestStreak.toString()} />}
              />
            ) : null}

            {/* Empty state for filtered results */}
            {entries.length > 0 && filteredEntries.length === 0 ? (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: lightColors.muted }}>
                  No entries match the current filter.
                </Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: lightColors.muted }}>
                No entries yet. Start logging to see your history.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }: { item: Entry }) => {
          // Show a date section header if this is the first entry for this date
          const isFirstOfDate =
            filteredEntries.filter((e) => e.entryDate === item.entryDate)[0]?.id === item.id;

          return (
            <View>
              {isFirstOfDate ? (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: lightColors.muted,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginTop: 12,
                    marginBottom: 6,
                  }}
                >
                  {formatFullDate(item.entryDate)}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={() => handleEntryPress(item)}
                accessibilityLabel={`Entry from ${item.entryDate}`}
                accessibilityRole="button"
                activeOpacity={0.7}
                style={{
                  borderRadius: radii.sm,
                  backgroundColor: lightColors.surface,
                  borderWidth: 1,
                  borderColor: lightColors.line,
                  padding: 14,
                  marginBottom: 8,
                  ...shadows.card,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    {/* Key label summary */}
                    {journal ? (
                      <Text style={{ fontSize: 13, color: lightColors.muted, marginBottom: 4 }} numberOfLines={1}>
                        {getEntryPreview(item, journal)}
                      </Text>
                    ) : null}

                    {/* Preview snippet from text fields */}
                    {(() => {
                      const textVal = journal?.fieldSchema
                        .filter((f) => f.type === 'text')
                        .map((f) => item.fieldValues[f.id])
                        .find((v) => v && String(v).trim().length > 0);
                      return textVal ? (
                        <Text style={{ fontSize: 13, color: lightColors.text }} numberOfLines={1}>
                          {String(textVal)}
                        </Text>
                      ) : null;
                    })()}
                  </View>
                  <View
                    style={{
                      borderRadius: radii.full,
                      backgroundColor: lightColors.accentSoft,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: lightColors.accent, fontWeight: '600' }}>View</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}
