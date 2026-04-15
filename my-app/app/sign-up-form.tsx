import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignUpFormScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthday: new Date(),
    academicYear: '',
    degree: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSignUp = async () => {
    const { fullName, email, password, phoneNumber, birthday, academicYear, degree } = formData;
    
    if (!fullName || !email || !password || !phoneNumber || !academicYear || !degree) {
      Alert.alert('Incomplete Form', 'Please fill in all fields before continuing.');
      return;
    }

    try {
      const user = { 
        fullName, 
        email, 
        password, 
        phoneNumber, 
        birthday: birthday.toLocaleDateString(), 
        academicYear, 
        degree 
      };
      await AsyncStorage.setItem('vital_user_data', JSON.stringify(user));
      router.replace('/sign-in');
    } catch (e) {
      Alert.alert('Error', 'Could not save data. Please try again.');
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateField('birthday', selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. john@vital.ai"
              placeholderTextColor="#475569"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              placeholderTextColor="#475569"
              value={formData.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
            />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 234 567 890"
              placeholderTextColor="#475569"
              value={formData.phoneNumber}
              onChangeText={(v) => updateField('phoneNumber', v)}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Birthday</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="calendar-edit" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#475569"
                value={formData.birthday.toISOString().split('T')[0]}
                onChangeText={(v) => {
                  const d = new Date(v);
                  if (!isNaN(d.getTime())) updateField('birthday', d);
                }}
              />
            </View>
          ) : (
            <>
              <Pressable style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                <MaterialCommunityIcons name="calendar-edit" size={20} color="#a855f7" style={styles.inputIcon} />
                <Text style={[styles.input, { color: '#fff', paddingTop: 16 }]}>
                  {formData.birthday.toLocaleDateString()}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.birthday}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Year</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2nd"
                  placeholderTextColor="#475569"
                  value={formData.academicYear}
                  onChangeText={(v) => updateField('academicYear', v)}
                />
              </View>
            </View>
            <View style={{ flex: 2, marginLeft: 8 }}>
              <Text style={styles.label}>Degree</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CS"
                  placeholderTextColor="#475569"
                  value={formData.degree}
                  onChangeText={(v) => updateField('degree', v)}
                />
              </View>
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleSignUp}
          >
            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
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
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
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
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
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
    marginBottom: 20,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
