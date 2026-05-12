/**
 * NewJournalScreen
 *
 * Create a new journal with custom field schema — wireframe-aligned (Wireframe 2).
 * Features: bottom sheet for field type selection, multi-line description placeholder,
 * Save Draft + Create dual buttons, overflow menu in header, progressive disclosure.
 */

import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FieldType, JournalFieldDefinition } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { useAuth } from '@context/AuthContext';
import { journalService } from '@services/journalService';
import { useJournalStore } from '@store/journalStore';
import { validateHexColor, validateJournalTitle } from '@utils/validation';
import { Button } from '@components/Common/Button';
import { IconButton } from '@components/Common/IconButton';
import { FieldTextInput } from '@components/FieldInputs/TextInput';
import { BottomSheet } from '@components/Common/BottomSheet';
import { InlineBanner } from '@components/Common/InlineBanner';
import { lightColors } from '@constants/colors';
import { radii, shadows } from '@constants/layout';

type NewJournalNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'NewJournal'>;

interface FieldDraft {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  optionsText: string;
}

const FIELD_TYPE_OPTIONS: { type: FieldType; description: string; example: string }[] = [
  { type: 'text', description: 'Open-ended written response', example: 'What happened today?' },
  { type: 'date', description: 'Date picker for scheduling or tracking', example: 'Entry date' },
  { type: 'rating', description: '1-5 scale for scoring', example: 'Mood score' },
  { type: 'multiChoice', description: 'Single-select from predefined options', example: 'Tags: work, rest, social' },
];

export function NewJournalScreen(): JSX.Element {
  const navigation = useNavigation<NewJournalNavigationProp>();
  const { user } = useAuth();
  const { getDraft, setDraft, clearDraft } = useJournalStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📓');
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [showFieldSheet, setShowFieldSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);

  const EMOJI_OPTIONS = ['📓', '🌿', '💪', '💼', '✈️', '😊', '📖', '🎯', '🎨', '🏃', '🧘', '☀️'];

  // Check for draft on mount
  useFocusEffect(
    useCallback(() => {
      const draft = getDraft('new_journal');
      if (draft) {
        const parsed = JSON.parse(draft.fieldValues.new_journal || '{}');
        if (parsed.title) {
          setTitle(parsed.title);
          setDescription(parsed.description || '');
          setEmoji(parsed.emoji || '📓');
          setFields(parsed.fields || []);
          setSavedDraft(true);
        }
      }
    }, [getDraft])
  );

  const handleAddField = (type: FieldType): void => {
    const now = Date.now();
    const fieldId = `field_${now}_${Math.floor(Math.random() * 1000)}`;
    setFields((prev) => [
      ...prev,
      {
        id: fieldId,
        label: '',
        type,
        required: false,
        optionsText: '',
      },
    ]);
    setShowFieldSheet(false);
  };

  const handleRemoveField = (fieldId: string): void => {
    setFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<FieldDraft>): void => {
    setFields((prev) => prev.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)));
  };

  const buildFieldSchema = (): JournalFieldDefinition[] => {
    return fields
      .map((field) => {
        const baseField: JournalFieldDefinition = {
          id: field.id,
          label: field.label.trim(),
          type: field.type,
          required: field.required,
        };

        if (field.type === 'multiChoice') {
          const options = field.optionsText
            .split(',')
            .map((option) => option.trim())
            .filter((option) => option.length > 0);

          return { ...baseField, options };
        }

        return baseField;
      })
      .filter((field) => field.label.length > 0);
  };

  const validateFields = (): { valid: boolean; error?: string } => {
    for (const field of fields) {
      if (!field.label.trim()) {
        return { valid: false, error: 'Each custom field must have a label.' };
      }

      if (field.type === 'multiChoice') {
        const options = field.optionsText
          .split(',')
          .map((option) => option.trim())
          .filter((option) => option.length > 0);

        if (options.length < 2) {
          return { valid: false, error: 'Multi-choice fields need at least 2 options.' };
        }
      }
    }

    return { valid: true };
  };

  /** Save as draft */
  const handleSaveDraft = (): void => {
    const draftData = JSON.stringify({
      title,
      description,
      emoji,
      fields,
    });
    setDraft('new_journal', { entryDate: '', fieldValues: { new_journal: draftData } });
    setSavedDraft(true);
    Alert.alert('Draft Saved', 'Your journal draft has been saved.');
  };

  /** Create journal */
  const handleSaveJournal = async (): Promise<void> => {
    const titleValidation = validateJournalTitle(title);
    if (!titleValidation.valid) {
      Alert.alert('Invalid Title', titleValidation.error);
      return;
    }

    const colorValidation = validateHexColor('#0d6b68');
    if (!colorValidation.valid) {
      Alert.alert('Invalid Color', colorValidation.error);
      return;
    }

    const fieldValidation = validateFields();
    if (!fieldValidation.valid) {
      Alert.alert('Invalid Field', fieldValidation.error);
      return;
    }

    if (!user?.id) {
      Alert.alert('Authentication Error', 'Please log in again to create a journal.');
      return;
    }

    try {
      setIsLoading(true);
      await journalService.createJournal({
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        color: '#0d6b68',
        emoji,
        fieldSchema: buildFieldSchema(),
        isArchived: false,
      });

      clearDraft('new_journal');
      Alert.alert('Success', 'Journal created successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Create Failed', 'Could not create journal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Set header overflow button */
  useFocusEffect(
    useCallback(() => {
      const handleOverflow = (): void => {
        Alert.alert('Options', 'Choose an action', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Draft',
            style: 'destructive',
            onPress: () => {
              clearDraft('new_journal');
              setTitle('');
              setDescription('');
              setEmoji('📓');
              setFields([]);
              setSavedDraft(false);
            },
          },
        ]);
      };
      
      navigation.setOptions({
        headerRight: () => (
          <IconButton icon="⋯" label="More options" onPress={handleOverflow} />
        ),
      });
    }, [navigation, clearDraft])
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: lightColors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Draft banner */}
      {savedDraft ? (
        <View style={{ marginBottom: 12 }}>
          <InlineBanner
            message="Journal draft saved"
            variant="success"
            icon="💾"
            action={
              <TouchableOpacity
                onPress={() => {
                  setSavedDraft(false);
                  clearDraft('new_journal');
                }}
                accessibilityLabel="Discard draft"
              >
                <Text style={{ fontSize: 12, color: lightColors.accent, fontWeight: '600' }}>Discard</Text>
              </TouchableOpacity>
            }
          />
        </View>
      ) : null}

      {/* Emoji selector */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: lightColors.muted,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Journal icon
        </Text>
        <TouchableOpacity
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            width: 48,
            height: 48,
            borderRadius: radii.sm,
            backgroundColor: lightColors.accentSoft,
            borderWidth: 1,
            borderColor: lightColors.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Select journal icon"
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </TouchableOpacity>
        {showEmojiPicker ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 8,
              borderRadius: radii.sm,
              backgroundColor: lightColors.surface,
              borderWidth: 1,
              borderColor: lightColors.line,
              padding: 12,
            }}
          >
            {EMOJI_OPTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => {
                  setEmoji(e);
                  setShowEmojiPicker(false);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radii.sm,
                  backgroundColor: emoji === e ? lightColors.accentSoft : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      {/* Journal name */}
      <FieldTextInput
        label="Journal name"
        placeholder="e.g., Gratitude, Workout Log, Travel Diary"
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <FieldTextInput
        label="Description"
        placeholder="Quick nightly reflection"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Field builder section */}
      <View
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: lightColors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Field builder
          </Text>
          <TouchableOpacity
            onPress={() => setShowFieldSheet(true)}
            accessibilityLabel="Add field"
            accessibilityRole="button"
            style={{
              borderRadius: radii.full,
              backgroundColor: lightColors.accent,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: lightColors.white }}>+ Add Field</Text>
          </TouchableOpacity>
        </View>

        {fields.length === 0 ? (
          <Text style={{ fontSize: 14, color: lightColors.muted, textAlign: 'center', paddingVertical: 16 }}>
            No fields yet. Tap "+ Add Field" to start building your journal schema.
          </Text>
        ) : (
          fields.map((field) => (
            <View
              key={field.id}
              style={{
                marginBottom: 12,
                borderRadius: radii.sm,
                backgroundColor: lightColors.surface2,
                borderWidth: 1,
                borderColor: lightColors.line,
                padding: 12,
              }}
            >
              {/* Field label */}
              <TextInput
                placeholder="Field label"
                value={field.label}
                onChangeText={(label) => updateField(field.id, { label })}
                style={{
                  borderRadius: radii.sm,
                  borderWidth: 1,
                  borderColor: lightColors.line,
                  backgroundColor: lightColors.surface,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: lightColors.text,
                  marginBottom: 8,
                }}
              />

              {/* Type display */}
              <View
                style={{
                  borderRadius: radii.full,
                  backgroundColor: lightColors.accentSoft,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 11, color: lightColors.accent, fontWeight: '600' }}>
                  {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                </Text>
          </View>

              {/* Multi-choice options */}
              {field.type === 'multiChoice' ? (
                <TextInput
                  placeholder="Options, comma-separated (e.g., Calm, Family, Work)"
                  value={field.optionsText}
                  onChangeText={(optionsText) => updateField(field.id, { optionsText })}
                  style={{
                    borderRadius: radii.sm,
                    borderWidth: 1,
                    borderColor: lightColors.line,
                    backgroundColor: lightColors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 13,
                    color: lightColors.text,
                    marginBottom: 8,
                  }}
                />
              ) : null}

              {/* Required toggle + remove */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Switch
                    value={field.required}
                    onValueChange={(required) => updateField(field.id, { required })}
                    trackColor={{ false: lightColors.line, true: lightColors.accent }}
                    thumbColor={field.required ? lightColors.white : lightColors.surface3}
                  />
                  <Text style={{ fontSize: 12, color: lightColors.muted }}>Required</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveField(field.id)} accessibilityLabel="Remove field">
                  <Text style={{ fontSize: 12, color: lightColors.danger, fontWeight: '600' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Bottom sheet for field type selection */}
      <BottomSheet
        visible={showFieldSheet}
        onClose={() => setShowFieldSheet(false)}
        title="Select field type"
      >
        {FIELD_TYPE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.type}
            onPress={() => handleAddField(option.type)}
            accessibilityLabel={`Add ${option.type} field`}
            accessibilityRole="button"
            style={{
              borderRadius: radii.sm,
              backgroundColor: lightColors.surface,
              borderWidth: 1,
              borderColor: lightColors.line,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: lightColors.text, marginBottom: 2 }}>
              {option.type.charAt(0).toUpperCase() + option.type.slice(1)}
            </Text>
            <Text style={{ fontSize: 12, color: lightColors.muted, marginBottom: 4 }}>{option.description}</Text>
            <Text style={{ fontSize: 11, color: lightColors.accent, fontStyle: 'italic' }}>e.g., {option.example}</Text>
          </TouchableOpacity>
      ))}
      </BottomSheet>

      {/* Dual action buttons */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <Button title="Save Draft" variant="secondary" onPress={handleSaveDraft} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={isLoading ? 'Creating...' : 'Create'}
            onPress={() => void handleSaveJournal()}
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
}
