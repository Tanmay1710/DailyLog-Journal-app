import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { validateEmail } from '@utils/validation';
import { authService } from '@services/authService';
import { handleAuthError } from '@utils/errorHandler';
import { AuthStackParamList } from '@navigation/AuthStack';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen(): JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert('Invalid Email', emailValidation.error);
      return;
    }

    if (!password.trim()) {
      Alert.alert('Invalid Password', 'Password is required');
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(email.trim(), password);
      // Auth state listener will automatically navigate to the main app
    } catch (error: unknown) {
      Alert.alert('Login Failed', handleAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-8 justify-center">
      <Text className="text-3xl font-bold text-black mb-6">Welcome back</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="bg-black rounded-xl px-4 py-3 mb-4 items-center"
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold">{isLoading ? 'Logging in...' : 'Log In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text className="text-center text-sm text-gray-500">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
