/**
 * EntryLogScreen
 *
 * Dynamic entry form — wireframe-aligned (Wireframe 4).
 * Features: rating bubble UI, multi-choice as segmented button group,
 * date picker, draft save banner with live timestamp, nav bar "←" back + "✓" save,
 * Cancel + Save Entry dual buttons.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { journalService } from '@services/journalService';
import { entryService } from '@services/entryService';
import { useAuth } from '@context/AuthContext';
import { useJournalStore } from '@store/journalStore';
import { FieldTextInput } from '@components/FieldInputs/TextInput';
import { DateInput } from '@components/FieldInputs/DateInput';
import { RatingInput } from '@components/FieldInputs/RatingInput';
import { MultiChoiceInput } from '@components/FieldInputs/MultiChoiceInput';
import { Button } from '@components/Common/Button';
import { IconButton } from '@components/Common/IconButton';
import { InlineBanner } from '@components/Common/InlineBanner';
import { LoadingSkeleton } from '@components/Common/LoadingSkeleton';
import { lightColors } from '@constants/colors';
import { radii, shadows } from '@constants/layout';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const draftSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadJournal = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const data = await journalService.getJournal(journalId);
      setJournal(data);

      const draft = getDraft(journalId);
      if (draft) {
        setEntryDate(draft.entryDate);
        setFieldValues(draft.fieldValues);
        setHasDraft(true);
        setLastSavedTime('recovered');
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
    }
  }, [journalId, getDraft]);

  useEffect(() => {
    void loadJournal();
  }, [loadJournal]);

  /** Auto-save draft with 1s debounce */
  const debouncedAutoSaveDraft = useCallback(() => {
    if (draftSaveTimeout.current) {
      clearTimeout(draftSaveTimeout.current);
    }
    draftSaveTimeout.current = setTimeout(() => {
      setDraft(journalId, { entryDate, fieldValues });
      setHasDraft(true);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
          setLastSavedTime(null);
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

  const handleSaveEntry = useCallback(async (): Promise<void> => {
    const validateEntryFn = (): { valid: boolean; message?: string } => {
      if (!journal) {
        return { valid: false, message: 'Journal not loaded.' };
      }

      for (const field of journal.fieldSchema) {
        if (field.required && !fieldValues[field.id]?.trim()) {
          return { valid: false, message: `Please answer the required field: ${field.label}` };
        }
      }

      return { valid: true };
    };

    if (!user?.id) {
      Alert.alert('Authentication Error', 'Please sign in again to save this entry.');
      return;
    }

    const validation = validateEntryFn();
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      const preparedValues: Record<string, unknown> = {};

      journal?.fieldSchema.forEach((field) => {
        const rawValue = fieldValues[field.id] || '';
        if (field.type === 'rating') {
          preparedValues[field.id] = rawValue ? Number(rawValue) : null;
        } else {
          preparedValues[field.id] = rawValue;
        }
      });

      await entryService.createEntry({
        journalId,
        userId: user.id,
        entryDate,
        fieldValues: preparedValues,
      });

      clearDraft(journalId);
      Alert.alert('Entry Saved', 'Your journal entry was saved successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Save Failed', 'Unable to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, journal, fieldValues, entryDate, journalId, clearDraft, navigation]);

  /** Set nav bar: "←" back + "✓" save */
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="←"
            label="Go back"
            onPress={() => navigation.goBack()}
          />
        ),
        headerRight: () => (
          <IconButton
            icon="✓"
            label="Save entry"
            onPress={() => void handleSaveEntry()}
          />
        ),
      });
    }, [navigation, handleSaveEntry])
  );

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <InlineBanner message={error} variant="danger" />
        <View style={{ marginTop: 16 }}>
          <Button title="Retry" onPress={() => void loadJournal()} />
        </View>
      </View>
    );
  }

  // Loading state
  if (!journal) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, padding: 16 }}>
        <LoadingSkeleton card />
        <View style={{ height: 16 }} />
        <LoadingSkeleton card />
        <View style={{ height: 16 }} />
        <LoadingSkeleton card />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: lightColors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Journal title */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: lightColors.text,
          marginBottom: 12,
        }}
      >
        {journal.title}
      </Text>

      {/* Draft autosave banner */}
      {hasDraft ? (
        <View style={{ marginBottom: 12 }}>
          <InlineBanner
            message="Draft autosaved"
            variant="success"
            icon="💾"
            secondary={lastSavedTime ? `Saved ${lastSavedTime}` : undefined}
            action={
              <TouchableOpacity
                onPress={handleDiscardDraft}
                accessibilityLabel="Discard draft"
              >
                <Text style={{ fontSize: 12, color: lightColors.danger, fontWeight: '600' }}>Discard</Text>
              </TouchableOpacity>
            }
          />
        </View>
      ) : null}

      {/* Entry Date */}
      <DateInput
        label="Entry date"
        value={entryDate}
        onChange={(dateStr) => {
          setEntryDate(dateStr);
          handleChangeValue('_date', dateStr);
        }}
      />

      {/* Dynamic fields from schema */}
      {journal.fieldSchema.map((field) => (
        <View
          key={field.id}
          style={{
            borderRadius: radii.lg,
            backgroundColor: lightColors.surface,
            borderWidth: 1,
            borderColor: lightColors.line,
            padding: 14,
            marginBottom: 16,
            ...shadows.card,
          }}
        >
          {field.type === 'text' ? (
            <FieldTextInput
              label={`${field.label}${field.required ? ' *' : ''}`}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              value={fieldValues[field.id] || ''}
              onChangeText={(val) => handleChangeValue(field.id, val)}
              multiline
            />
          ) : null}

          {field.type === 'date' ? (
            <DateInput
              label={`${field.label}${field.required ? ' *' : ''}`}
              value={fieldValues[field.id] || ''}
              onChange={(val) => handleChangeValue(field.id, val)}
            />
          ) : null}

          {field.type === 'rating' ? (
            <RatingInput
              label={`${field.label}${field.required ? ' *' : ''}`}
              value={fieldValues[field.id] ? Number(fieldValues[field.id]) : null}
              onChange={(val) => handleChangeValue(field.id, val.toString())}
            />
          ) : null}

          {field.type === 'multiChoice' && field.options ? (
            <MultiChoiceInput
              label={`${field.label}${field.required ? ' *' : ''}`}
              options={field.options}
              value={fieldValues[field.id] || null}
              onChange={(val) => handleChangeValue(field.id, val)}
            />
          ) : null}
        </View>
      ))}

      {/* Cancel + Save Entry buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={isSubmitting ? 'Saving...' : 'Save Entry'}
            onPress={() => void handleSaveEntry()}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}
