/**
 * Notification Store
 * Zustand store for notification preferences and state
 */

import { create } from 'zustand';

interface NotificationState {
  /** Reminder time in 24h HH:MM format */
  reminderTime: string;
  /** Whether daily reminders are enabled */
  isEnabled: boolean;
  /** FCM device token for push notifications */
  fcmToken: string | null;
  /** ID of the currently scheduled local notification */
  scheduledNotificationId: string | null;
  /** Loading state for async operations */
  isLoading: boolean;

  // Actions
  setReminderTime: (time: string) => void;
  setEnabled: (enabled: boolean) => void;
  setFcmToken: (token: string | null) => void;
  setScheduledNotificationId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  /** Reset all state to defaults (used on logout) */
  reset: () => void;
}

const initialState = {
  reminderTime: '09:00',
  isEnabled: true,
  fcmToken: null,
  scheduledNotificationId: null,
  isLoading: false,
};

export const useNotificationStore = create<NotificationState>()((set) => ({
  ...initialState,

  setReminderTime: (reminderTime) => set({ reminderTime }),
  setEnabled: (isEnabled) => set({ isEnabled }),
  setFcmToken: (fcmToken) => set({ fcmToken }),
  setScheduledNotificationId: (scheduledNotificationId) => set({ scheduledNotificationId }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
