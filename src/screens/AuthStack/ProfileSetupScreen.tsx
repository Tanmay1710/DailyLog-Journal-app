import { useEffect, useState } from 'react';
import { Alert, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/AuthStack';
import { authService } from '@services/authService';
import { validateName, validateTime, validateTimezone } from '@utils/validation';
import { handleAuthError } from '@utils/errorHandler';
import { useAuthStore } from '@store/authStore';

type ProfileSetupScreenRouteProp = RouteProp<AuthStackParamList, 'ProfileSetup'>;

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ProfileSetup'>;

export function ProfileSetupScreen(): JSX.Element {
  const route = useRoute<ProfileSetupScreenRouteProp>();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (defaultTimezone) {
      setTimezone(defaultTimezone);
    }
  }, []);

  const handleSaveProfile = async (): Promise<void> => {
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      Alert.alert('Invalid Name', nameValidation.error);
      return;
    }

    const timezoneValidation = validateTimezone(timezone);
    if (!timezoneValidation.valid) {
      Alert.alert('Invalid Timezone', timezoneValidation.error);
      return;
    }

    const timeValidation = validateTime(reminderTime);
    if (!timeValidation.valid) {
      Alert.alert('Invalid Time', timeValidation.error);
      return;
    }

    const userId = route.params?.userId || authService.getCurrentFirebaseUser()?.uid;
    if (!userId) {
      Alert.alert('Setup Error', 'Unable to find authenticated user. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.createUserProfile(userId, name.trim(), timezone, reminderTime, reminderEnabled);
      const updatedUser = await authService.getUserProfile(userId);
      if (updatedUser) {
        setUser(updatedUser);
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: unknown) {
      Alert.alert('Profile Save Failed', handleAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-8 justify-center">
      <Text className="text-3xl font-bold text-black mb-6">Finish your profile</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-2">Timezone</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3"
          placeholder="Timezone"
          value={timezone}
          onChangeText={setTimezone}
        />
      </View>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Reminder Time (e.g., 09:00)"
        value={reminderTime}
        onChangeText={setReminderTime}
      />
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-base text-black">Enable reminders</Text>
        <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
      </View>
      <TouchableOpacity
        className="bg-black rounded-xl px-4 py-3 items-center"
        onPress={handleSaveProfile}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold">{isLoading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
}
