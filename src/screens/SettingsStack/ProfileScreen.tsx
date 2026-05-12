/**
 * Profile Screen
 * User profile management — edit name, timezone, logout, delete account.
 */

import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import { validateName, validateTimezone } from '@utils/validation';
import { handleAuthError } from '@utils/errorHandler';
import { useNotificationStore } from '@store/notificationStore';
import { notificationService } from '@services/notificationService';

export function ProfileScreen(): JSX.Element {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { reset: resetNotificationStore, scheduledNotificationId } = useNotificationStore();

  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isSaving, setIsSaving] = useState(false);

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

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    setIsSaving(true);
    try {
      await authService.updateUserProfile(user.id, {
        name: name.trim(),
        timezone,
      });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (error: unknown) {
      Alert.alert('Save Failed', handleAuthError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = (): void => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              // Cancel any scheduled notifications before logout
              if (scheduledNotificationId) {
                await notificationService.cancelAllScheduledNotifications();
              }
              resetNotificationStore();
              await logout();
            } catch (error: unknown) {
              Alert.alert('Logout Failed', handleAuthError(error));
            }
          })();
        },
      },
    ]);
  };

  const handleDeleteAccount = (): void => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. All your journals, entries, and profile data will be deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Note: Actual deletion with Firebase Admin SDK or Cloud Function
            Alert.alert(
              'Coming Soon',
              'Account deletion is not yet available directly from the app. Please contact support.'
            );
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 px-4 py-6">
      {/* Profile Info Section */}
      <View className="mb-6 rounded-3xl bg-white/95 p-5 shadow-sm">
        <Text className="mb-4 text-lg font-semibold text-slate-900">Profile Information</Text>

        {/* Email (read-only) */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-slate-600">Email</Text>
          <Text className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-500">
            {user?.email || 'No email'}
          </Text>
        </View>

        {/* Name (editable) */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-slate-600">Name</Text>
          <TextInput
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900"
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Your full name"
          />
        </View>

        {/* Timezone (editable) */}
        <View>
          <Text className="mb-1 text-sm font-medium text-slate-600">Timezone</Text>
          <TextInput
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900"
            placeholder="Timezone (e.g., UTC)"
            value={timezone}
            onChangeText={setTimezone}
            accessibilityLabel="Your timezone"
          />
        </View>
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity
        className="mb-6 rounded-3xl bg-emerald-700 px-4 py-3 shadow-sm"
        onPress={() => void handleSaveProfile()}
        disabled={isSaving || authLoading}
        accessibilityLabel="Save profile changes"
      >
        <Text className="text-center text-base font-semibold text-white">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>

      {/* Account Actions */}
      <View className="mb-6 rounded-3xl bg-white/95 p-5 shadow-sm">
        <Text className="mb-3 text-base font-semibold text-slate-900">Account</Text>

        {/* Log Out */}
        <TouchableOpacity
          className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          onPress={handleLogout}
          disabled={authLoading}
          accessibilityLabel="Log out of your account"
        >
          <Text className="text-center text-base font-semibold text-slate-900">
            {authLoading ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
          onPress={handleDeleteAccount}
          accessibilityLabel="Delete your account permanently"
        >
          <Text className="text-center text-base font-semibold text-rose-700">Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="items-center">
        <Text className="text-xs text-slate-400">DailyLog v1.0.0</Text>
      </View>
    </View>
  );
}
