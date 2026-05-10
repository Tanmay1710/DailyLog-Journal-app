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
      className="mb-3 rounded-xl border border-gray-200 bg-white p-4"
      onPress={() => navigation.navigate('JournalDetail', { journalId: item.id })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-semibold text-black">{item.title}</Text>
          {item.description ? (
            <Text className="mt-1 text-sm text-gray-600">{item.description}</Text>
          ) : null}
          <Text className="mt-2 text-xs text-gray-500">
            {item.fieldSchema.length} custom field{item.fieldSchema.length === 1 ? '' : 's'}
          </Text>
          <Text className="mt-1 text-xs font-medium text-green-600">Status: Active</Text>
        </View>
        <View className="items-end">
          <View className="mb-3 h-5 w-5 rounded-full border border-gray-300" style={{ backgroundColor: item.color }} />
          <TouchableOpacity
            className="rounded-lg border border-red-300 px-3 py-1"
            onPress={() => handleArchive(item.id)}
          >
            <Text className="text-xs font-medium text-red-600">Archive</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white px-4 py-4">
      <TouchableOpacity
        className="mb-4 rounded-xl bg-black px-4 py-3"
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
