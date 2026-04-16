import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    birthday: new Date(),
    academicYear: "",
    degree: "",
    password: ""
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('vital_user_data');
      const imageUri = await AsyncStorage.getItem('vital_profile_image');
      
      if (userJson) {
        const user = JSON.parse(userJson);
        setForm({
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || user.phone || '',
          birthday: user.birthday ? new Date(user.birthday) : new Date(),
          academicYear: user.academicYear || user.year || '',
          degree: user.degree || '',
          password: user.password || '',
        });
      }
      if (imageUri) {
        setProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save data as strings for storage
      const dataToSave = {
        ...form,
        birthday: form.birthday.toISOString(),
      };
      
      await AsyncStorage.setItem("vital_user_data", JSON.stringify(dataToSave));
      if (profileImage) {
        await AsyncStorage.setItem("vital_profile_image", profileImage);
      }
      
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save changes.");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, birthday: selectedDate });
    }
  };

  if (loading) return null;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#94a3b8" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.photoSection}>
        <Pressable onPress={pickImage} style={styles.photoWrapper}>
          <Image 
            source={profileImage ? { uri: profileImage } : require('../../assets/images/favicon.png')} 
            style={styles.photo} 
          />
          <View style={styles.cameraOverlay}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </View>
        </Pressable>
        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#a855f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={form.fullName}
            onChangeText={(text) => setForm({ ...form, fullName: text })}
            placeholder="Your full name"
            placeholderTextColor="#475569"
          />
        </View>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#a855f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholder="Your email"
            placeholderTextColor="#475569"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="phone-outline" size={20} color="#a855f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={form.phoneNumber}
            onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
            placeholder="Phone number"
            placeholderTextColor="#475569"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Password (Mock)</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#a855f7" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            placeholder="Change password"
            placeholderTextColor="#475569"
            secureTextEntry
          />
        </View>

        <Text style={styles.label}>Birthday</Text>
        <Pressable style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar" size={20} color="#a855f7" style={styles.icon} />
          <Text style={styles.input}>{form.birthday.toLocaleDateString()}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={form.birthday}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Academic Year</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={form.academicYear}
                onChangeText={(text) => setForm({ ...form, academicYear: text })}
                placeholder="Year"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Degree</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={form.degree}
                onChangeText={(text) => setForm({ ...form, degree: text })}
                placeholder="Degree"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </Pressable>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  saveBtnTop: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  saveBtnTextTop: {
    color: '#a855f7',
    fontWeight: '700',
    fontSize: 15,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#a855f7',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#050508',
  },
  changePhotoText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    backgroundColor: '#a855f7',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#a855f7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
