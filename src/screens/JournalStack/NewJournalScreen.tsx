import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FieldType, JournalFieldDefinition } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { useAuth } from '@context/AuthContext';
import { journalService } from '@services/journalService';
import { validateHexColor, validateJournalTitle } from '@utils/validation';

type NewJournalNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'NewJournal'>;

interface FieldDraft {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  optionsText: string;
}

const FIELD_TYPES: FieldType[] = ['text', 'date', 'rating', 'multiChoice'];

export function NewJournalScreen(): JSX.Element {
  const navigation = useNavigation<NewJournalNavigationProp>();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FF5733');
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<FieldDraft[]>([]);

  const handleAddField = (): void => {
    const now = Date.now();
    const fieldId = `field_${now}_${Math.floor(Math.random() * 1000)}`;
    setFields((prev) => [
      ...prev,
      {
        id: fieldId,
        label: '',
        type: 'text',
        required: false,
        optionsText: '',
      },
    ]);
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

          return {
            ...baseField,
            options,
          };
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

  const handleSaveJournal = async (): Promise<void> => {
    const titleValidation = validateJournalTitle(title);
    if (!titleValidation.valid) {
      Alert.alert('Invalid Title', titleValidation.error);
      return;
    }

    const colorValidation = validateHexColor(color);
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
        description: description.trim() || undefined,
        color: color.trim(),
        fieldSchema: buildFieldSchema(),
        isArchived: false,
      });

      Alert.alert('Success', 'Journal created successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Create Failed', 'Could not create journal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-4 py-4">
      <Text className="mb-2 text-sm font-medium text-gray-700">Journal Title</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        placeholder="Journal Title"
        value={title}
        onChangeText={setTitle}
      />

      <Text className="mb-2 text-sm font-medium text-gray-700">Description (Optional)</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <Text className="mb-2 text-sm font-medium text-gray-700">Color (Hex)</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-300 px-4 py-3"
        placeholder="#FF5733"
        value={color}
        onChangeText={setColor}
        autoCapitalize="characters"
      />

      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-black">Custom Fields</Text>
        <TouchableOpacity className="rounded-lg bg-gray-900 px-3 py-2" onPress={handleAddField}>
          <Text className="text-sm font-semibold text-white">+ Add Field</Text>
        </TouchableOpacity>
      </View>

      {fields.map((field) => (
        <View key={field.id} className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <TextInput
            className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2"
            placeholder="Field label"
            value={field.label}
            onChangeText={(label) => updateField(field.id, { label })}
          />

          <View className="mb-3 flex-row flex-wrap gap-2">
            {FIELD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                className={`rounded-lg border px-3 py-2 ${field.type === type ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}
                onPress={() => updateField(field.id, { type })}
              >
                <Text className={`text-xs font-medium ${field.type === type ? 'text-white' : 'text-gray-700'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {field.type === 'multiChoice' ? (
            <TextInput
              className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2"
              placeholder="Options, comma-separated"
              value={field.optionsText}
              onChangeText={(optionsText) => updateField(field.id, { optionsText })}
            />
          ) : null}

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm text-gray-700">Required</Text>
            <Switch value={field.required} onValueChange={(required) => updateField(field.id, { required })} />
          </View>

          <TouchableOpacity onPress={() => handleRemoveField(field.id)}>
            <Text className="text-sm font-medium text-red-600">Remove Field</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        className="mb-10 rounded-xl bg-black px-4 py-3"
        onPress={() => void handleSaveJournal()}
        disabled={isLoading}
      >
        <Text className="text-center text-base font-semibold text-white">
          {isLoading ? 'Creating...' : 'Create Journal'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
