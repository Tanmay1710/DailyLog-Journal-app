/**
 * Authentication Stack Navigator
 * Navigation for unauthenticated users
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignUpScreen } from '@screens/AuthStack/SignUpScreen';
import { LoginScreen } from '@screens/AuthStack/LoginScreen';
import { ProfileSetupScreen } from '@screens/AuthStack/ProfileSetupScreen';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ProfileSetup: { userId: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{
          // Prevent back navigation from ProfileSetup
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
