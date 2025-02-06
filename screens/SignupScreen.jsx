import React, { useState } from 'react';
import { Image, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Button, Text, RadioButton, HelperText, Checkbox } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../api-endpoints/API_URL';
import { hashPassword } from '../pass-protect/hashPassword';
import SearchableDepartmentPicker from './SearchDepartment';
import { getAuthData, getAuthToken, makeAuthenticatedRequest, clearAuthData } from '../token-data/apiutils';
import CircularPhotoUpload from './PhotoUpload';

// import Pdf from 'react-native-pdf';


const DEPARTMENTS = [
  'FINANCE', 'HUMAN_RESOURCES', 'MARKETING', 'RESEARCH_AND_DEVELOPMENT',
  'IT', 'CUSTOMER_SERVICE', 'OPERATIONS_MANAGEMENT', 'ADMINISTRATION',
  'PURCHASING', 'PRODUCTION', 'SALES', 'ACCOUNTING', 'MAINTENANCE_DEPARTMENT',
  'DESIGN', 'QUALITY_MANAGEMENT', 'BUSINESS_DEVELOPMENT', 'LAW',
  'PRODUCT_DEVELOPMENT', 'HUMAN_RESOURCE_DEVELOPMENT', 'DISTRIBUTION',
  'DISPATCH_DEPARTMENT', 'STORE_DEPARTMENT', 'MANAGEMENT'
];

export default function SignupScreen({ navigation, setIsAuthenticated }) {
  const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000));
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    department: 'IT',
    isMale: true,
    dateOfBirth: yesterday,
    photoUrl: '',
    resumeUrl: '',
    checkBoxOptions: []
  });
  const checkBox = ['Health Insurance', 'Newsletter', 'Work From Home'];
  const [selectedOptions, setSelectedOptions] = useState([]);



  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };
  const handleToggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(prev => !prev);
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  const storeAuthData = async (token, userId) => {
    try {
      await AsyncStorage.multiSet([
        ['token', token],
        ['userId', userId],
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const validatePassword = (password) => {
    let errorMessage = '';

    if (password.length < 8) {
      errorMessage = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(password)) {
      errorMessage = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(password)) {
      errorMessage = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(password)) {
      errorMessage = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errorMessage = 'Password must contain at least one special character.';
    } else if (/\s/.test(password)) {
      errorMessage = 'Password cannot contain spaces.';
    }

    setErrors({ ...errors, password: errorMessage });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeName) newErrors.employeeName = 'Name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Valid phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFormData({ ...formData, photoUrl: result.assets[0].uri });
      console.log("Image URI:", result.assets[0].uri);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (result.canceled) {
      console.log("Document picking was canceled.");
      return;
    }

    if (result.assets && result.assets.length > 0) {
      setFormData({ ...formData, resumeUrl: result.assets[0].uri });
      console.log("Resume URI:", result.assets[0].uri);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate.toISOString().split('T')[0] });
      console.log("Selected Date:", selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    const updatedFormData = {
      ...formData,
      checkBoxOptions: selectedOptions,
    };

    try {
      // First, register the user
      const registerResponse = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();

        // After successful registration, immediately sign in to get the token
        const signinResponse = await fetch(
          `${API_URL}/api/employees/signin?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (signinResponse.ok) {
          const signinData = await signinResponse.json();
          // Store both token and userId
          await storeAuthData(signinData.token, signinData.id);
          setIsAuthenticated(true);
        } else {
          throw new Error('Auto signin after registration failed');
        }
      } else {
        const errorData = await registerResponse.json();
        if (errorData.message) {
          setErrors(prevErrors => ({
            ...prevErrors,
            submit: errorData.message
          }));
        } else {
          setErrors(prevErrors => ({
            ...prevErrors,
            submit: 'Registration failed. Email already registered or invalid date.'
          }));
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors(prevErrors => ({
        ...prevErrors,
        submit: 'Network error occurred. Please try again.'
      }));
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <CircularPhotoUpload
        photoUrl={formData.photoUrl}
        onPress={pickImage}
      />

      <TextInput
        label="Name"
        value={formData.employeeName}
        onChangeText={(text) => setFormData({ ...formData, employeeName: text })}
        error={!!errors.employeeName}
        style={styles.input}
        theme={{
          colors: {
            primary: '#510ac9', // Color when focused
            text: '#000', // Text color
            placeholder: '#510ac9', // Placeholder color
          },
        }}
        textColor='#000'
      />
      <HelperText type="error" visible={!!errors.employeeName}>{errors.employeeName}</HelperText>

      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        error={!!errors.email}
        keyboardType="email-address"
        style={styles.input}
        theme={{
          colors: {
            primary: '#510ac9', // Color when focused
            text: '#000', // Text color
            placeholder: '#510ac9', // Placeholder color
          },
        }}
        textColor='#000'
      />
      <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

      <TextInput
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
        error={!!errors.phoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
        theme={{
          colors: {
            primary: '#510ac9', // Color when focused
            text: '#000', // Text color
            placeholder: '#510ac9', // Placeholder color
          },
        }}
        textColor='#000'
      />

      <TextInput
        label="Address"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
        error={!!errors.address}
        style={styles.input}
        theme={{
          colors: {
            primary: '#510ac9', // Color when focused
            text: '#000', // Text color
            placeholder: '#510ac9', // Placeholder color
          },
        }}
        textColor='#000'
      />

      <View>
        <TextInput
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => {
            setFormData({ ...formData, password: text });
            validatePassword(text);
          }}
          secureTextEntry={!passwordVisible}
          theme={{
            colors: {
              primary: '#510ac9', // Color when focused
              text: '#000', // Text color
              placeholder: '#510ac9', // Placeholder color
            },
          }}
          textColor='#000'
          right={
            <TextInput.Icon
              icon={!passwordVisible ? "eye-off" : "eye"}
              onPress={handleTogglePasswordVisibility}
              forceTextInputFocus={false}
            />
          }
          style={[styles.input, errors.password && styles.errorBorder]}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TextInput
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            validateConfirmPassword(text);
          }}
          textColor='#000'
          theme={{
            colors: {
              primary: '#510ac9', // Color when focused
              text: '#000', // Text color
              placeholder: '#510ac9', // Placeholder color
            },
          }}
          secureTextEntry={!confirmPasswordVisible}
          right={
            <TextInput.Icon
              icon={!confirmPasswordVisible ? "eye-off" : "eye"}
              onPress={handleToggleConfirmPasswordVisibility}
              forceTextInputFocus={false}
            />
          }
          style={[styles.input, errors.confirmPassword && styles.errorBorder]}
        />
        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
      </View>


      <Button onPress={() => setShowDatePicker(true)} mode="outlined" style={styles.button} textColor='#510ac9'>
        Select Date of Birth {new Date(formData.dateOfBirth).toLocaleDateString()}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData.dateOfBirth)}
          mode="date"
          onChange={handleDateChange}
          maximumDate={yesterday}
        />
      )}

      {/* <View style={styles.picker}>
        <Text>Department</Text>
        <Picker
          selectedValue={formData.department}
          onValueChange={(value) => setFormData({ ...formData, department: value })}
        >
          {DEPARTMENTS.map((dept) => (
            <Picker.Item key={dept} label={dept.replace(/_/g, ' ')} value={dept} />
          ))}
        </Picker>
      </View> */}

      <SearchableDepartmentPicker
        value={formData.department}
        onValueChange={(value) => setFormData({ ...formData, department: value })}
        departments={DEPARTMENTS}
      />

      <View style={styles.radioGroup}>
        <Text style={{color:'#000'}}>Gender</Text>
        <RadioButton.Group
          onValueChange={(value) => setFormData({ ...formData, isMale: value === 'male' })}
          value={formData.isMale ? 'male' : 'female'}
        >
          <View style={styles.group1}>
            <View style={styles.radioButton}>
              <RadioButton value="male" color='#510ac9' />
              <Text style={{color:'#000'}}>Male</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton value="female" color='#510ac9'/>
              <Text style={{color:'#000'}}>Female</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      <View style={{ marginVertical: 10 }}>
        <Text style={{color:'#000'}}>Preferences</Text>
        {checkBox.map((option) => (
          <View key={option} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              status={selectedOptions.includes(option) ? 'checked' : 'unchecked'}
              color='#510ac9'
              onPress={() => {
                setSelectedOptions((prev) =>
                  prev.includes(option)
                    ? prev.filter((item) => item !== option)
                    : [...prev, option]
                );
              }}
            />
            <Text style={{color:'#000'}}>{option}</Text>
          </View>
        ))}
      </View>


      <Button mode="outlined" onPress={pickDocument} style={styles.button} textColor='#510ac9'>
        {formData.resumeUrl ? 'Change Resume' : 'Upload Resume'}
      </Button>

      {errors.submit && <HelperText type="error" visible={true}>{errors.submit}</HelperText>}
      <Button mode="contained" onPress={handleSignup} style={styles.button1} textColor='#fff'>
        Sign Up
      </Button>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  button: { marginVertical: 10, borderRadius: 8, paddingVertical: 10, alignItems: 'center' ,},
  button1: { marginVertical: 10, borderRadius: 8, paddingVertical: 10, alignItems: 'center' , backgroundColor:'#510ac9' ,},
  input: { backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
  },
  errorBorder: {
    borderColor: 'red',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  textLabel: {
    fontSize: 16,
    color: '#333',
  },
  imageStyle: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    margin: 5,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  radioGroup: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',

  },
  group1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

