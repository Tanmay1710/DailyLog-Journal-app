import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { Entry, Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { entryService } from '@services/entryService';
import { journalService } from '@services/journalService';

type EntryHistoryRouteProp = RouteProp<JournalStackParamList, 'EntryHistory'>;

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

  const formatFieldValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return 'No response';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
      void loadJournal();
    }, [loadEntries, loadJournal])
  );

  const renderEntryItem = ({ item }: { item: Entry }): JSX.Element => {
    const filledFields = Object.entries(item.fieldValues).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    );

    return (
      <TouchableOpacity className="mb-3 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        <Text className="text-lg font-semibold text-slate-900">{item.entryDate}</Text>

        {filledFields.length === 0 ? (
          <Text className="mt-1 text-sm text-gray-600">No fields filled for this entry.</Text>
        ) : (
          <View className="mt-2 space-y-2">
            {filledFields.map(([fieldId, value]) => {
              const fieldLabel = journal?.fieldSchema.find((field) => field.id === fieldId)?.label ?? fieldId;
              return (
                <View key={fieldId} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Text className="text-sm font-medium text-slate-900">{fieldLabel}</Text>
                  <Text className="mt-1 text-sm text-slate-700">{formatFieldValue(value)}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Text className="mt-3 text-xs text-gray-500">Created: {new Date(item.createdAt).toLocaleString()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 px-4 py-4">
      {error ? (
        <View className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 p-3 shadow-sm">
          <Text className="text-sm text-rose-700">{error}</Text>
        </View>
      ) : null}

      {entries.length > 0 ? (
        <View className="mb-4 rounded-3xl bg-emerald-700 px-4 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">Current streak</Text>
            {currentStreak > 0 ? <Text className="text-3xl">🔥</Text> : null}
          </View>
          <Text className="mt-1 text-2xl font-bold text-white">{currentStreak} day{currentStreak === 1 ? '' : 's'}</Text>
          <Text className="mt-1 text-sm text-slate-100">Consecutive days logged in this journal</Text>
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
