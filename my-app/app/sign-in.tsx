import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await AsyncStorage.getItem('vital_user_data');
      if (data) {
        setUserData(JSON.parse(data));
      }
    };
    fetchUserData();
  }, []);

  const handleSignIn = async () => {
    // Check if user has "joined" (filled the form)
    const data = await AsyncStorage.getItem('vital_user_data');
    if (!data) {
      Alert.alert('Access Denied', 'Please click "Join now" and fill in your details first.');
      return;
    }

    const user = JSON.parse(data);

    setIsLoading(true);
    // Simulate a brief network request
    setTimeout(async () => {
      await AsyncStorage.setItem('vital_logged_in', 'true');
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={styles.title}>{userData ? `Welcome, ${userData.fullName.split(' ')[0]}` : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>{userData ? 'Please sign in to access your dashboard' : 'Sign in to continue to VITAL'}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled
            ]} 
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/sign-up-form')}>
              <Text style={styles.signUpText}>Join now</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPassText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#a855f7',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  signUpText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
});
