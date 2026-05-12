import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@context/AuthContext';
import type { Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { journalService } from '@services/journalService';
import { useJournalStore } from '@store/journalStore';

type JournalListNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'JournalList'>;

export function JournalListScreen(): JSX.Element {
  const navigation = useNavigation<JournalListNavigationProp>();
  const { user } = useAuth();
  const { journals, setJournals, isLoading, setLoading } = useJournalStore();
  const [error, setError] = useState<string | null>(null);

  const loadJournals = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setJournals([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await journalService.getJournals(user.id);
      setJournals(data);
    } catch {
      setError('Failed to load journals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setJournals, setLoading, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadJournals();
    }, [loadJournals])
  );

  const handleArchive = (journalId: string): void => {
    Alert.alert('Archive Journal', 'Are you sure you want to archive this journal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          void (async (): Promise<void> => {
            try {
              await journalService.archiveJournal(journalId);
              await loadJournals();
            } catch {
              Alert.alert('Archive Failed', 'Could not archive journal. Please try again.');
            }
          })();
        },
      },
    ]);
  };

  const renderJournalItem = ({ item }: { item: Journal }): JSX.Element => (
    <TouchableOpacity
      className="mb-3 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm"
      onPress={() => navigation.navigate('JournalDetail', { journalId: item.id })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <View
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-lg font-semibold text-slate-900">{item.title}</Text>
          </View>
          {item.description ? (
            <Text className="mt-1 text-sm text-slate-600">{item.description}</Text>
          ) : null}
          <Text className="mt-2 text-xs text-slate-500">
            {item.fieldSchema.length} custom field{item.fieldSchema.length === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1"
          onPress={() => handleArchive(item.id)}
          accessibilityLabel={`Archive ${item.title}`}
        >
          <Text className="text-xs font-semibold text-rose-700">Archive</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 px-4 py-4">
      <TouchableOpacity
        className="mb-4 rounded-3xl bg-emerald-700 px-4 py-3 shadow-sm"
        onPress={() => navigation.navigate('NewJournal')}
      >
        <Text className="text-center text-base font-semibold text-white">Create Journal</Text>
      </TouchableOpacity>

      {error ? (
        <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      ) : null}

      {!isLoading && journals.length === 0 ? (
        <View className="mt-10 items-center">
          <Text className="text-base text-gray-500">No journals yet. Create your first journal.</Text>
        </View>
      ) : null}

      <FlatList
        data={journals}
        renderItem={renderJournalItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void loadJournals()} />}
      />
    </View>
  );
}
