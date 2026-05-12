/**
 * Notification Service
 * Handles push notifications and local notifications
 */

import {
  cancelAllScheduledNotificationsAsync,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getDevicePushTokenAsync,
  NotificationRequestInput,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler,
} from 'expo-notifications';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@config/firebaseConfig';

export const notificationService = {
  async requestNotificationPermission(): Promise<boolean> {
    try {
      const { status } = await requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[notificationService.requestNotificationPermission] Error:', error);
      return false;
    }
  },

  async getDeviceToken(): Promise<string> {
    try {
      const token = await getDevicePushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('[notificationService.getDeviceToken] Error:', error);
      throw error;
    }
  },

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: { type: 'time'; value: number } | { type: 'date'; value: Date }
  ): Promise<string> {
    try {
      const notificationContent = {
        title,
        body,
        sound: 'default',
        priority: 'default' as const,
      };

      let triggerConfig: NotificationRequestInput['trigger'];

      if (trigger.type === 'time') {
        // Daily at specific time (seconds since midnight)
        const now = new Date();
        const triggerTime = new Date(now);
        triggerTime.setHours(0, 0, trigger.value, 0);

        if (triggerTime <= now) {
          // If time has passed today, schedule for tomorrow
          triggerTime.setDate(triggerTime.getDate() + 1);
        }

        triggerConfig = {
          hour: triggerTime.getHours(),
          minute: triggerTime.getMinutes(),
          repeats: true,
        };
      } else {
        // One-time at specific date
        triggerConfig = trigger.value;
      }

      const notificationId = await scheduleNotificationAsync({
        content: notificationContent,
        trigger: triggerConfig,
      });

      return notificationId;
    } catch (error) {
      console.error('[notificationService.scheduleLocalNotification] Error:', error);
      throw error;
    }
  },

  /**
   * Schedule a daily recurring reminder notification.
   * @param hour - Hour in 24h format (0-23)
   * @param minute - Minute (0-59)
   * @returns The notification ID string
   */
  async scheduleDailyReminder(hour: number, minute: number): Promise<string> {
    try {
      const notificationId = await scheduleNotificationAsync({
        content: {
          title: 'DailyLog Reminder',
          body: 'Time to journal! 📝 Capture your thoughts for today.',
          sound: 'default',
          priority: 'default',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('[notificationService.scheduleDailyReminder] Error:', error);
      throw error;
    }
  },

  /**
   * Cancel all scheduled notifications.
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[notificationService.cancelAllScheduledNotifications] Error:', error);
      throw error;
    }
  },

  /**
   * Get all currently scheduled notifications.
   */
  async getAllScheduledNotifications(): Promise<unknown[]> {
    try {
      const notifications = await getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('[notificationService.getAllScheduledNotifications] Error:', error);
      throw error;
    }
  },

  async cancelLocalNotification(notificationId: string): Promise<void> {
    try {
      await cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('[notificationService.cancelLocalNotification] Error:', error);
      throw error;
    }
  },

  /**
   * Save the FCM device token to Firestore for the given user.
   */
  async saveFcmTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { fcmToken: token }, { merge: true });
    } catch (error) {
      console.error('[notificationService.saveFcmTokenToFirestore] Error:', error);
      throw error;
    }
  },

  /**
   * Retrieve the FCM device token from Firestore for the given user.
   */
  async getFcmTokenFromFirestore(userId: string): Promise<string | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return data.fcmToken || null;
      }

      return null;
    } catch (error) {
      console.error('[notificationService.getFcmTokenFromFirestore] Error:', error);
      throw error;
    }
  },

  setupForegroundNotificationHandler(): void {
    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  },
};
