import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { Entry, Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { entryService } from '@services/entryService';
import { journalService } from '@services/journalService';

type EntryHistoryRouteProp = RouteProp<JournalStackParamList, 'EntryHistory'>;

/** Returns a concise summary string of the entry's field values. */
const getEntrySummary = (entry: Entry, journal: Journal | null): string => {
  const parts: string[] = [];
  if (!journal) {
    const values = Object.values(entry.fieldValues).filter(
      (v) => v !== null && v !== undefined && v !== ''
    );
    return values.slice(0, 3).map(String).join(', ');
  }
  for (const field of journal.fieldSchema) {
    const value = entry.fieldValues[field.id];
    if (value === null || value === undefined || value === '') continue;
    const display = field.type === 'rating' ? `${value}★` : field.type === 'date' ? String(value) : String(value);
    parts.push(`${field.label}: ${display}`);
    if (parts.length >= 3) break;
  }
  return parts.join(' | ') || 'No data';
};

export function EntryHistoryScreen(): JSX.Element {
  const route = useRoute<EntryHistoryRouteProp>();
  const { journalId } = route.params;

  const [entries, setEntries] = useState<Entry[]>([]);
  const [journal, setJournal] = useState<Journal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // journal labels are optional; failure here should not block entries
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
    if (entries.length === 0) {
      return 0;
    }

    const entryDates = new Set(entries.map((entry) => entry.entryDate));
    let streak = 0;
    let current = parseDateString(entries[0].entryDate);

    while (entryDates.has(formatDateString(current))) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }

    return streak;
  }, [entries]);

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
      void loadJournal();
    }, [loadEntries, loadJournal])
  );

  const renderEntryItem = ({ item }: { item: Entry }): JSX.Element => (
    <TouchableOpacity className="mb-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">{item.entryDate}</Text>
        <Text className="text-xs text-slate-400">
          {new Date(item.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text className="mt-1 text-sm text-slate-600" numberOfLines={2}>
        {getEntrySummary(item, journal)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 px-4 py-4">
      {error ? (
        <View className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 shadow-sm">
          <Text className="text-sm text-rose-700">{error}</Text>
        </View>
      ) : null}

      {entries.length > 0 ? (
        <View className="mb-4 rounded-2xl bg-emerald-700 px-4 py-3 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">Current streak</Text>
            {currentStreak > 0 ? <Text className="text-2xl">🔥</Text> : null}
          </View>
          <Text className="mt-1 text-xl font-bold text-white">
            {currentStreak} day{currentStreak === 1 ? '' : 's'}
          </Text>
        </View>
      ) : null}

      {!isLoading && entries.length === 0 ? (
        <View className="mt-10 items-center">
          <Text className="text-base text-gray-500">No entries yet. Create your first entry.</Text>
        </View>
      ) : null}

      <FlatList
        data={entries}
        renderItem={renderEntryItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void loadEntries()} />}
      />
    </View>
  );
}
