import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { RootNavigator } from '@navigation/RootNavigator';
import { notificationService } from '@services/notificationService';

/**
 * Inner component that handles notification setup after auth is ready.
 * Must be inside AuthProvider to access useAuth().
 */
function AppContent(): JSX.Element {
  const { user } = useAuth();

  useEffect(() => {
    // Set up foreground notification handler once on mount
    notificationService.setupForegroundNotificationHandler();
  }, []);

  useEffect(() => {
    if (user) {
    // Request notification permissions when user is authenticated
      (async () => {
        try {
          await notificationService.requestNotificationPermission();
        } catch (error) {
          console.warn('[App] Notification permission error:', error);
        }
      })();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <StatusBar style="dark" backgroundColor="#eef2ff" />
      <RootNavigator />
    </>
  );
}

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
