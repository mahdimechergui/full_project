import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignUpFormScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    birthday: '',
    academicYear: '',
    degree: '',
  });

  const handleSignUp = async () => {
    const { fullName, birthday, academicYear, degree } = formData;
    
    if (!fullName || !birthday || !academicYear || !degree) {
      Alert.alert('Incomplete Form', 'Please fill in all fields before continuing.');
      return;
    }

    try {
      const user = { fullName, birthday, academicYear, degree };
      await AsyncStorage.setItem('vital_user_data', JSON.stringify(user));
      router.replace('/sign-in');
    } catch (e) {
      Alert.alert('Error', 'Could not save data. Please try again.');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#94a3b8" />
          </Pressable>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to join VITAL</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor="#475569"
              value={formData.fullName}
              onChangeText={(v) => updateField('fullName', v)}
            />
          </View>

          <Text style={styles.label}>Birthday</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="cake-variant-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Jan 01, 2000"
              placeholderTextColor="#475569"
              value={formData.birthday}
              onChangeText={(v) => updateField('birthday', v)}
            />
          </View>

          <Text style={styles.label}>Academic Year</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="school-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 2nd Year"
              placeholderTextColor="#475569"
              value={formData.academicYear}
              onChangeText={(v) => updateField('academicYear', v)}
            />
          </View>

          <Text style={styles.label}>Degree / Program</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Science"
              placeholderTextColor="#475569"
              value={formData.degree}
              onChangeText={(v) => updateField('degree', v)}
            />
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleSignUp}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#a855f7',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
