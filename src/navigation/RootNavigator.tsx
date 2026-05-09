/**
 * Root Navigator
 * Conditionally renders AuthStack or JournalStack based on auth state
 */

import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@context/AuthContext';
import { AuthStack } from './AuthStack';
import { JournalStack } from './JournalStack';

export const RootNavigator = (): JSX.Element => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return isAuthenticated ? <JournalStack /> : <AuthStack />;
};
