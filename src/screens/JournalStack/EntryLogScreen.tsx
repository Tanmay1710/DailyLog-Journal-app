import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { journalService } from '@services/journalService';
import { entryService } from '@services/entryService';
import { useAuth } from '@context/AuthContext';
import { useJournalStore } from '@store/journalStore';

type EntryLogRouteProp = RouteProp<JournalStackParamList, 'EntryLog'>;
type EntryLogNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'EntryLog'>;

export function EntryLogScreen(): JSX.Element {
  const route = useRoute<EntryLogRouteProp>();
  const navigation = useNavigation<EntryLogNavigationProp>();
  const { user } = useAuth();
  const { journalId } = route.params;
  const { setDraft, getDraft, clearDraft } = useJournalStore();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const draftSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadJournal = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalService.getJournal(journalId);
      setJournal(data);

      const draft = getDraft(journalId);
      if (draft) {
        setEntryDate(draft.entryDate);
        setFieldValues(draft.fieldValues);
        setHasDraft(true);
      } else {
        setFieldValues(
          data.fieldSchema.reduce((acc, field) => ({
            ...acc,
            [field.id]: '',
          }), {} as Record<string, string>)
        );
      }
    } catch {
      setError('Failed to load journal template.');
    } finally {
      setIsLoading(false);
    }
  }, [journalId, getDraft]);

  useEffect(() => {
    void loadJournal();
  }, [loadJournal]);

  const debouncedAutoSaveDraft = useCallback(() => {
    if (draftSaveTimeout.current) {
      clearTimeout(draftSaveTimeout.current);
    }
    draftSaveTimeout.current = setTimeout(() => {
      setDraft(journalId, { entryDate, fieldValues });
      setHasDraft(true);
    }, 1000);
  }, [entryDate, fieldValues, journalId, setDraft]);

  useEffect(() => {
    debouncedAutoSaveDraft();
    return () => {
      if (draftSaveTimeout.current) {
        clearTimeout(draftSaveTimeout.current);
      }
    };
  }, [debouncedAutoSaveDraft]);

  const handleChangeValue = (fieldId: string, value: string): void => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleDiscardDraft = (): void => {
    Alert.alert('Discard Draft', 'Are you sure you want to discard this draft?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          clearDraft(journalId);
          setHasDraft(false);
          setFieldValues(
            journal?.fieldSchema.reduce((acc, field) => ({
              ...acc,
              [field.id]: '',
            }), {} as Record<string, string>) || {}
          );
        },
      },
    ]);
  };

  const validateEntry = (): { valid: boolean; message?: string } => {
    if (!journal) {
      return { valid: false, message: 'Journal not loaded.' };
    }

    for (const field of journal.fieldSchema) {
      if (field.required && !fieldValues[field.id]?.trim()) {
        return {
          valid: false,
          message: `Please answer the required field: ${field.label}`,
        };
      }
    }

    return { valid: true };
  };

  const handleSaveEntry = async (): Promise<void> => {
    if (!user?.id) {
      Alert.alert('Authentication Error', 'Please sign in again to save this entry.');
      return;
    }

    const validation = validateEntry();
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    try {
      setIsLoading(true);
      const preparedValues: Record<string, unknown> = {};

      journal?.fieldSchema.forEach((field) => {
        const rawValue = fieldValues[field.id] || '';
        if (field.type === 'rating') {
          preparedValues[field.id] = rawValue ? Number(rawValue) : null;
        } else {
          preparedValues[field.id] = rawValue;
        }
      });

      const dateStr = entryDate;

      await entryService.createEntry({
        journalId,
        userId: user.id,
        entryDate: dateStr,
        fieldValues: preparedValues,
      });

      clearDraft(journalId);
      Alert.alert('Entry Saved', 'Your journal entry was saved successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Save Failed', 'Unable to save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Text className="text-base text-gray-600">Loading entry form...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 py-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-black">Log entry for {journal.title}</Text>
        {hasDraft ? <View className="h-2 w-2 rounded-full bg-green-600" /> : null}
      </View>

      {hasDraft ? (
        <View className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <Text className="text-sm text-green-700">Draft saved</Text>
          <TouchableOpacity onPress={handleDiscardDraft}>
            <Text className="mt-1 text-xs font-medium text-green-600">Discard draft</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text className="mb-2 text-sm font-medium text-gray-700">Entry Date</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        placeholder="YYYY-MM-DD"
        value={entryDate}
        onChangeText={setEntryDate}
      />

      {journal.fieldSchema.map((field) => (
        <View key={field.id} className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <Text className="mb-2 text-base font-medium text-black">
            {field.label}
            {field.required ? ' *' : ''}
          </Text>

          {field.type === 'multiChoice' ? (
            field.options?.map((option) => (
              <TouchableOpacity
                key={option}
                className={`mb-2 rounded-lg border px-3 py-2 ${fieldValues[field.id] === option ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}
                onPress={() => handleChangeValue(field.id, option)}
              >
                <Text className={`text-sm ${fieldValues[field.id] === option ? 'text-white' : 'text-gray-700'}`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <TextInput
              className="rounded-xl border border-gray-300 bg-white px-4 py-3"
              placeholder={field.type === 'rating' ? 'Enter a rating (1-5)' : field.type === 'date' ? 'YYYY-MM-DD' : 'Enter your response'}
              value={fieldValues[field.id]}
              keyboardType={field.type === 'rating' ? 'numeric' : 'default'}
              onChangeText={(value) => handleChangeValue(field.id, value)}
            />
          )}
        </View>
      ))}

      <TouchableOpacity
        className="mb-10 rounded-xl bg-black px-4 py-3"
        onPress={() => void handleSaveEntry()}
        disabled={isLoading}
      >
        <Text className="text-center text-base font-semibold text-white">
          {isLoading ? 'Saving...' : 'Save Entry'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
