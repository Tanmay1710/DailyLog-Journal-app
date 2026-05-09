/**
 * Notification Service
 * Handles push notifications and local notifications
 */

import {
  cancelScheduledNotificationAsync,
  getDevicePushTokenAsync,
  NotificationRequestInput,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler,
} from 'expo-notifications';

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

  async cancelLocalNotification(notificationId: string): Promise<void> {
    try {
      await cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('[notificationService.cancelLocalNotification] Error:', error);
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
