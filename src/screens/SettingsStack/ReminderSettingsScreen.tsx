/**
 * Reminder Settings Screen
 * Allows users to configure daily reminder time, enable/disable reminders,
 * and send a test notification.
 */

import { useState } from 'react';
import { Alert, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { useNotificationStore } from '@store/notificationStore';
import { notificationService } from '@services/notificationService';
import { authService } from '@services/authService';
import { validateTime } from '@utils/validation';

export function ReminderSettingsScreen(): JSX.Element {
  const { user } = useAuth();
  const {
    reminderTime,
    isEnabled,
    scheduledNotificationId,
    isLoading,
    setReminderTime,
    setEnabled,
    setScheduledNotificationId,
    setLoading,
  } = useNotificationStore();

  const [localReminderTime, setLocalReminderTime] = useState(reminderTime);
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTimeChange = (time: string): void => {
    setLocalReminderTime(time);
    setHasChanges(true);
  };

  const handleToggle = (value: boolean): void => {
    setLocalEnabled(value);
    setHasChanges(true);
  };

  const handleSave = async (): Promise<void> => {
    // Validate time
    const timeValidation = validateTime(localReminderTime);
    if (!timeValidation.valid) {
      Alert.alert('Invalid Time', timeValidation.error);
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to save settings.');
      return;
    }

    setLoading(true);
    try {
      // Update reminder preferences in Firestore
      await authService.updateUserProfile(user.id, {
        reminderTime: localReminderTime,
        reminderEnabled: localEnabled,
      });

      // Cancel existing notification if any
      if (scheduledNotificationId) {
        await notificationService.cancelLocalNotification(scheduledNotificationId);
      }

      // Schedule or cancel based on enabled state
      if (localEnabled) {
        const [hour, minute] = localReminderTime.split(':').map(Number);
        const newId = await notificationService.scheduleDailyReminder(hour, minute);
        setScheduledNotificationId(newId);
      } else {
        await notificationService.cancelAllScheduledNotifications();
        setScheduledNotificationId(null);
      }

      // Update store
      setReminderTime(localReminderTime);
      setEnabled(localEnabled);
      setHasChanges(false);

      Alert.alert('Saved', 'Your reminder preferences have been updated.');
    } catch (error) {
      console.warn('[ReminderSettings] Save error:', error);
      Alert.alert('Save Failed', 'Could not save reminder settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (): Promise<void> => {
    try {
      const granted = await notificationService.requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive test notifications.'
        );
        return;
      }

      await notificationService.scheduleLocalNotification(
        'DailyLog Test',
        'This is a test notification from DailyLog! 📝',
        { type: 'time', value: 60 } // 60 seconds from now
      );

      Alert.alert('Test Sent', 'A test notification has been scheduled for 1 minute from now.');
    } catch (error) {
      console.warn('[ReminderSettings] Test notification error:', error);
      Alert.alert('Test Failed', 'Could not send test notification. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50 px-4 py-6">
      {/* Reminder Time Input */}
      <View className="mb-6 rounded-3xl bg-white/95 p-5 shadow-sm">
        <Text className="mb-2 text-base font-semibold text-slate-900">Reminder Time</Text>
        <Text className="mb-3 text-sm text-slate-600">
          Choose the time you'd like to be reminded to journal each day.
        </Text>
        <TextInput
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900"
          placeholder="HH:MM (e.g., 09:00)"
          value={localReminderTime}
          onChangeText={handleTimeChange}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          accessibilityLabel="Reminder time in 24-hour format"
        />
      </View>

      {/* Enable/Disable Toggle */}
      <View className="mb-6 rounded-3xl bg-white/95 p-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-slate-900">Daily Reminders</Text>
            <Text className="mt-1 text-sm text-slate-600">
              {localEnabled
                ? 'You will receive a daily reminder to journal.'
                : 'Daily reminders are turned off.'}
            </Text>
          </View>
          <Switch
            value={localEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#cbd5e1', true: '#047857' }}
            thumbColor={localEnabled ? '#ffffff' : '#f1f5f9'}
            accessibilityLabel="Toggle daily reminders"
          />
        </View>
      </View>

      {/* Test Notification Button */}
      <View className="mb-8 rounded-3xl bg-white/95 p-5 shadow-sm">
        <Text className="mb-2 text-base font-semibold text-slate-900">Test Notification</Text>
        <Text className="mb-3 text-sm text-slate-600">
          Send a test notification to verify your device is receiving reminders.
        </Text>
        <TouchableOpacity
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
          onPress={() => void handleTestNotification()}
          accessibilityLabel="Send a test notification"
        >
          <Text className="text-center text-base font-semibold text-emerald-700">
            Send Test Notification
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        className={`rounded-3xl px-4 py-3 shadow-sm ${
          hasChanges ? 'bg-emerald-700' : 'bg-slate-300'
        }`}
        onPress={() => void handleSave()}
        disabled={!hasChanges || isLoading}
        accessibilityLabel="Save reminder settings"
      >
        <Text className="text-center text-base font-semibold text-white">
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
