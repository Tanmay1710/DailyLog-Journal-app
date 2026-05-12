/**
 * Root Navigator
 * Conditionally renders AuthStack or MainTabs based on auth state
 */

import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@context/AuthContext';
import { AuthStack } from './AuthStack';
import { JournalStack } from './JournalStack';
import { SettingsStack } from './SettingsStack';

export type MainTabParamList = {
  JournalsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#047857',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="JournalsTab"
        component={JournalStack}
        options={{
          tabBarLabel: 'Journals',
          tabBarIcon: ({ color }) => (
            <View className="h-6 w-6 items-center justify-center">
              <View className="h-5 w-5 rounded-sm border-2" style={{ borderColor: color }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <View className="h-6 w-6 items-center justify-center">
              <View className="h-6 w-6 rounded-full border-2" style={{ borderColor: color }} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator = (): JSX.Element => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};
