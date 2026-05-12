/**
 * Reminder Settings Screen — wireframe-aligned (Wireframe 7)
 *
 * Features: enable/disable toggle, large bold time display with "Edit" tag,
 * notification preview card ("DailyLog: Time to check in with Gratitude."),
 * scheduling notes (permission state, next trigger, local vs cloud),
 * Send Test Notification button, Save button.
 */

import { useCallback, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { useNotificationStore } from '@store/notificationStore';
import { notificationService } from '@services/notificationService';
import { authService } from '@services/authService';
import { validateTime } from '@utils/validation';
import { Button } from '@components/Common/Button';
import { IconButton } from '@components/Common/IconButton';
import { lightColors } from '@constants/colors';
import { radii, shadows } from '@constants/layout';

/** Format HH:MM to 12-hour display like "7:30 PM" */
function formatDisplayTime(time: string): string {
  if (!time || !time.includes(':')) return time;
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export function ReminderSettingsScreen(): JSX.Element {
  const navigation = useNavigation();
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
  const [showTimeEditor, setShowTimeEditor] = useState(false);

  const handleTimeChange = (time: string): void => {
    setLocalReminderTime(time);
    setHasChanges(true);
  };

  const handleToggle = (value: boolean): void => {
    setLocalEnabled(value);
    setHasChanges(true);
  };

  const handleSave = useCallback(async (): Promise<void> => {
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
      await authService.updateUserProfile(user.id, {
        reminderTime: localReminderTime,
        reminderEnabled: localEnabled,
      });

      if (scheduledNotificationId) {
        await notificationService.cancelLocalNotification(scheduledNotificationId);
      }

      if (localEnabled) {
        const [hour, minute] = localReminderTime.split(':').map(Number);
        const newId = await notificationService.scheduleDailyReminder(hour, minute);
        setScheduledNotificationId(newId);
      } else {
        await notificationService.cancelAllScheduledNotifications();
        setScheduledNotificationId(null);
      }

      setReminderTime(localReminderTime);
      setEnabled(localEnabled);
      setHasChanges(false);

      Alert.alert('Saved', `Daily reminder set for ${formatDisplayTime(localReminderTime)}.`);
    } catch (error) {
      console.warn('[ReminderSettings] Save error:', error);
      Alert.alert('Save Failed', 'Could not save reminder settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [localReminderTime, user?.id, localEnabled, scheduledNotificationId, setLoading, setScheduledNotificationId, setReminderTime, setEnabled]);

  /** Set header save button */
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            icon="✓"
            label="Save settings"
            onPress={() => void handleSave()}
          />
        ),
      });
    }, [navigation, handleSave])
  );

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
        { type: 'time', value: 60 }
      );

      Alert.alert('Test Sent', 'A test notification has been scheduled for 1 minute from now.');
    } catch (error) {
      console.warn('[ReminderSettings] Test notification error:', error);
      Alert.alert('Test Failed', 'Could not send test notification. Please try again.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: lightColors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Enable/Disable toggle */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 16,
          marginBottom: 16,
          ...shadows.card,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: lightColors.text }}>
              Daily reminders
            </Text>
            <Text style={{ fontSize: 13, color: lightColors.muted, marginTop: 2 }}>
              {localEnabled
                ? 'Enable one recurring journal nudge'
                : 'Daily reminders are turned off'}
            </Text>
          </View>
          <Switch
            value={localEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: lightColors.line, true: lightColors.accent }}
            thumbColor={localEnabled ? lightColors.white : lightColors.surface3}
            accessibilityLabel="Toggle daily reminders"
          />
        </View>
      </View>

      {/* Large bold time display */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 16,
          marginBottom: 16,
          ...shadows.card,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: lightColors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 6,
          }}
        >
          Reminder time
        </Text>

        {showTimeEditor ? (
          <TextInput
            placeholder="HH:MM (24h format)"
            value={localReminderTime}
            onChangeText={handleTimeChange}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={{
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: lightColors.accent,
              backgroundColor: lightColors.surface,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 18,
              fontWeight: '700',
              color: lightColors.text,
              marginBottom: 8,
            }}
            accessibilityLabel="Reminder time in 24-hour format"
            autoFocus
          />
        ) : (
          <TouchableOpacity
            onPress={() => setShowTimeEditor(true)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            accessibilityLabel="Edit reminder time"
          >
            <Text style={{ fontSize: 26, fontWeight: '800', color: lightColors.text }}>
              {formatDisplayTime(localReminderTime)}
            </Text>
            <View
              style={{
                borderRadius: radii.full,
                backgroundColor: lightColors.accentSoft,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 13, color: lightColors.accent, fontWeight: '600' }}>Edit</Text>
            </View>
          </TouchableOpacity>
        )}

        {showTimeEditor ? (
          <TouchableOpacity
            onPress={() => setShowTimeEditor(false)}
            style={{ alignSelf: 'flex-end' }}
          >
            <Text style={{ fontSize: 13, color: lightColors.accent, fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Notification preview card */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 16,
          marginBottom: 16,
          ...shadows.card,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: lightColors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
          }}
        >
          Preview notification
        </Text>

        {/* Notification card preview */}
        <View
          style={{
            borderRadius: radii.sm,
            backgroundColor: lightColors.surface2,
            borderWidth: 1,
            borderColor: lightColors.line,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: lightColors.text, marginBottom: 2 }}>
            DailyLog
          </Text>
          <Text style={{ fontSize: 12, color: lightColors.muted }}>
            Time to check in with Gratitude.
          </Text>
        </View>

        <Button
          title="Send Test Notification"
          variant="secondary"
          onPress={() => void handleTestNotification()}
        />
      </View>

      {/* Scheduling notes */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 16,
          marginBottom: 24,
          ...shadows.card,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: lightColors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          Scheduling notes
        </Text>
        <Text style={{ fontSize: 12, color: lightColors.muted, lineHeight: 18 }}>
          • Permission state: {localEnabled ? 'Granted (if enabled in system settings)' : 'Not required (reminders off)'}
        </Text>
        <Text style={{ fontSize: 12, color: lightColors.muted, lineHeight: 18 }}>
          • Next trigger: {localEnabled ? `Daily at ${formatDisplayTime(localReminderTime)}` : 'No scheduled reminders'}
        </Text>
        <Text style={{ fontSize: 12, color: lightColors.muted, lineHeight: 18 }}>
          • Type: Local notification (cloud-backed reminders coming in a future update)
        </Text>
      </View>

      {/* Save button */}
      <Button
        title={isLoading ? 'Saving...' : 'Save'}
        onPress={() => void handleSave()}
        disabled={!hasChanges || isLoading}
      />
    </ScrollView>
  );
}
