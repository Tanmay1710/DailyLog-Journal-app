import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import type { Entry, Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { journalService } from '@services/journalService';
import { entryService } from '@services/entryService';

type JournalDetailRouteProp = RouteProp<JournalStackParamList, 'JournalDetail'>;
type JournalDetailNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'JournalDetail'>;

export function JournalDetailScreen(): JSX.Element {
  const route = useRoute<JournalDetailRouteProp>();
  const navigation = useNavigation<JournalDetailNavigationProp>();
  const { user } = useAuth();
  const { journalId } = route.params;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const loadJournal = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalService.getJournal(journalId);

      if (user?.id && data.userId !== user.id) {
        setError('You do not have permission to view this journal.');
        setJournal(null);
        return;
      }

      setJournal(data);
    } catch {
      setError('Failed to load journal details.');
      setJournal(null);
    } finally {
      setIsLoading(false);
    }
  }, [journalId, user?.id]);

  const loadEntries = useCallback(async (): Promise<void> => {
    try {
      setEntriesError(null);
      const data = await entryService.getEntries(journalId);
      setEntries(data);
    } catch {
      setEntriesError('Failed to load entry streak.');
      setEntries([]);
    }
  }, [journalId]);

  const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      void loadJournal();
      void loadEntries();
    }, [loadJournal, loadEntries])
  );

  const handleArchive = (): void => {
    Alert.alert('Archive Journal', 'Are you sure you want to archive this journal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          void (async (): Promise<void> => {
            try {
              await journalService.archiveJournal(journalId);
              Alert.alert('Archived', 'Journal archived successfully.');
              navigation.goBack();
            } catch {
              Alert.alert('Archive Failed', 'Could not archive journal. Please try again.');
            }
          })();
        },
      },
    ]);
  };

  const handleLogEntry = (): void => {
    navigation.navigate('EntryLog', { journalId });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-base text-gray-600">Loading journal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="mb-4 text-center text-base text-red-600">{error}</Text>
        <TouchableOpacity className="rounded-lg bg-black px-4 py-2" onPress={() => void loadJournal()}>
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!journal) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-base text-gray-600">Journal not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 py-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-black">{journal.title}</Text>
        <View className="h-6 w-6 rounded-full border border-gray-300" style={{ backgroundColor: journal.color }} />
      </View>

      {journal.description ? (
        <Text className="mb-4 text-base text-gray-700">{journal.description}</Text>
      ) : (
        <Text className="mb-4 text-base italic text-gray-500">No description</Text>
      )}

      <View className="mb-4 rounded-xl border border-black bg-black px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-white">Current streak</Text>
          {currentStreak > 0 ? <Text className="text-3xl">🔥</Text> : null}
        </View>
        <Text className="mt-1 text-2xl font-bold text-white">{currentStreak} day{currentStreak === 1 ? '' : 's'}</Text>
        <Text className="mt-1 text-sm text-gray-200">Consecutive days logged in this journal</Text>
        {entriesError ? <Text className="mt-2 text-xs text-red-200">{entriesError}</Text> : null}
      </View>

      <Text className="mb-2 text-lg font-semibold text-black">Custom Fields</Text>
      {journal.fieldSchema.length === 0 ? (
        <Text className="mb-6 text-sm text-gray-500">No custom fields configured.</Text>
      ) : (
        journal.fieldSchema.map((field) => (
          <View key={field.id} className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <Text className="text-base font-medium text-black">{field.label}</Text>
            <Text className="mt-1 text-sm text-gray-600">Type: {field.type}</Text>
            <Text className="mt-1 text-sm text-gray-600">Required: {field.required ? 'Yes' : 'No'}</Text>
            {field.type === 'multiChoice' && field.options?.length ? (
              <Text className="mt-1 text-sm text-gray-600">Options: {field.options.join(', ')}</Text>
            ) : null}
          </View>
        ))
      )}

      <TouchableOpacity className="mb-3 rounded-xl bg-black px-4 py-3" onPress={handleLogEntry}>
        <Text className="text-center text-base font-semibold text-white">Log Daily Entry</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
        onPress={() => navigation.navigate('EntryHistory', { journalId })}
      >
        <Text className="text-center text-base font-semibold text-gray-800">View Entries</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mb-10 rounded-xl border border-red-300 px-4 py-3" onPress={handleArchive}>
        <Text className="text-center text-base font-semibold text-red-600">Archive Journal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
