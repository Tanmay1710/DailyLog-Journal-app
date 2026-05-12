/**
 * Settings Stack Navigator
 * Navigation for Settings tab — profile and reminder settings
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@screens/SettingsStack/ProfileScreen';
import { ReminderSettingsScreen } from '@screens/SettingsStack/ReminderSettingsScreen';

export type SettingsStackParamList = {
  Profile: undefined;
  ReminderSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="ReminderSettings"
        component={ReminderSettingsScreen}
        options={{
          title: 'Reminder Settings',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};
