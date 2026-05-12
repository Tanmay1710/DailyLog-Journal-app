/**
 * Profile Screen — wireframe-aligned (Wireframe 6)
 *
 * Features: emoji avatar (🙂) in hero card, editable name/timezone,
 * Reminder Settings nav link with "›", Edit "✎" button in header,
 * "Safe" tag on Logout, "Cloud fn" tag on Delete, Save Changes CTA.
 */

import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import { validateName, validateTimezone } from '@utils/validation';
import { handleAuthError } from '@utils/errorHandler';
import { useNotificationStore } from '@store/notificationStore';
import { notificationService } from '@services/notificationService';
import type { SettingsStackParamList } from '@navigation/SettingsStack';
import { HeroCard } from '@components/Common/HeroCard';
import { Button } from '@components/Common/Button';
import { IconButton } from '@components/Common/IconButton';
import { FieldTextInput } from '@components/FieldInputs/TextInput';
import { lightColors } from '@constants/colors';
import { radii, shadows } from '@constants/layout';

type ProfileNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'Profile'>;

export function ProfileScreen(): JSX.Element {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { reset: resetNotificationStore, scheduledNotificationId } = useNotificationStore();

  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isSaving, setIsSaving] = useState(false);

  /** Set header edit button */
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            icon="✎"
            label="Edit profile"
            onPress={() => {
              Alert.alert('Edit Mode', 'Profile fields are always editable. Make your changes directly.');
            }}
          />
        ),
      });
    }, [navigation])
  );

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
            Alert.alert(
              'Coming Soon',
              'Account deletion requires a server-side Cloud Function and is not yet available from the app.'
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: lightColors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero card with emoji avatar */}
      <HeroCard
        sectionLabel="Account"
        title={name || 'Your Name'}
        subtitle={user?.email || 'No email'}
        metric={
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: radii.sm,
              backgroundColor: lightColors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: lightColors.line,
            }}
          >
            <Text style={{ fontSize: 26 }}>🙂</Text>
          </View>
        }
      />

      {/* Editable fields */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 16,
          marginTop: 16,
          marginBottom: 16,
          ...shadows.card,
        }}
      >
        {/* Email (read-only) */}
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
            Email
          </Text>
          <View
            style={{
              borderRadius: radii.sm,
              backgroundColor: lightColors.surface2,
              borderWidth: 1,
              borderColor: lightColors.line,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 16, color: lightColors.muted }}>
              {user?.email || 'No email'}
            </Text>
          </View>
        </View>

        {/* Name */}
        <FieldTextInput
          label="Display name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />

        {/* Timezone */}
        <View style={{ marginBottom: 0 }}>
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
            Timezone
          </Text>
          <TextInput
            placeholder="e.g., Asia/Kolkata"
            value={timezone}
            onChangeText={setTimezone}
            style={{
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: lightColors.line,
              backgroundColor: lightColors.surface,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
              color: lightColors.text,
            }}
            accessibilityLabel="Timezone"
          />
        </View>
      </View>

      {/* Save Changes button */}
      <Button
        title={isSaving ? 'Saving...' : 'Save Changes'}
        onPress={() => void handleSaveProfile()}
        disabled={isSaving || authLoading}
      />

      {/* Account actions */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          marginTop: 16,
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
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 8,
          }}
        >
          Account actions
        </Text>

        {/* Reminder settings nav */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ReminderSettings')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: lightColors.line,
          }}
          accessibilityLabel="Go to reminder settings"
        >
          <Text style={{ fontSize: 15, color: lightColors.text }}>Reminder settings</Text>
          <Text style={{ fontSize: 18, color: lightColors.muted }}>›</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={authLoading}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: lightColors.line,
          }}
          accessibilityLabel="Log out"
        >
          <Text style={{ fontSize: 15, color: lightColors.danger }}>
            {authLoading ? 'Logging out...' : 'Log out'}
          </Text>
          <View
            style={{
              borderRadius: radii.full,
              backgroundColor: lightColors.dangerSoft,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, color: lightColors.danger, fontWeight: '600' }}>Safe</Text>
          </View>
        </TouchableOpacity>

        {/* Delete account */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: lightColors.line,
          }}
          accessibilityLabel="Delete account"
        >
          <Text style={{ fontSize: 15, color: lightColors.danger }}>Delete account</Text>
          <View
            style={{
              borderRadius: radii.full,
              backgroundColor: lightColors.dangerSoft,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 11, color: lightColors.danger, fontWeight: '600' }}>Cloud fn</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App version */}
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: lightColors.muted }}>DailyLog v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
