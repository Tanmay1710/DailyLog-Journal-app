import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { validateConfirmPassword, validateEmail, validatePassword } from '@utils/validation';
import { authService } from '@services/authService';
import { handleAuthError } from '@utils/errorHandler';
import { AuthStackParamList } from '@navigation/AuthStack';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen(): JSX.Element {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (): Promise<void> => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert('Invalid Email', emailValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Invalid Password', passwordValidation.error);
      return;
    }

    const confirmValidation = validateConfirmPassword(password, confirmPassword);
    if (!confirmValidation.valid) {
      Alert.alert('Password Mismatch', confirmValidation.error);
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp(email.trim(), password);
      const firebaseUser = authService.getCurrentFirebaseUser();
      navigation.navigate('ProfileSetup', {
        userId: firebaseUser?.uid ?? '',
      });
    } catch (error: unknown) {
      Alert.alert('Sign Up Failed', handleAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-8 justify-center">
      <Text className="text-3xl font-bold text-black mb-6">Create your account</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity
        className="bg-black rounded-xl px-4 py-3 mb-4 items-center"
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold">{isLoading ? 'Creating account...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="text-center text-sm text-gray-500">Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}
