import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, View, StyleSheet, Alert, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Checkbox, TextInput, Button, Text, RadioButton, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-datepicker';
import { API_URL } from '../api-endpoints/API_URL';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { makeAuthenticatedRequest, getAuthToken, makePutRequest } from '../token-data/apiutils';
import SearchableDepartmentPicker from './SearchDepartment';
import CircularPhotoUpload from './PhotoUpload';
import { API_URL111 } from './SignupScreen';
import { uploadFileToS3 } from '../token-data/uplodaer';

// Department Options
const DEPARTMENTS = [
  'FINANCE', 'HUMAN_RESOURCES', 'MARKETING', 'RESEARCH_AND_DEVELOPMENT', 'IT',
  'CUSTOMER_SERVICE', 'OPERATIONS_MANAGEMENT', 'ADMINISTRATION', 'PURCHASING',
  'PRODUCTION', 'SALES', 'ACCOUNTING', 'MAINTENANCE_DEPARTMENT', 'DESIGN',
  'QUALITY_MANAGEMENT', 'BUSINESS_DEVELOPMENT', 'LAW', 'PRODUCT_DEVELOPMENT',
  'HUMAN_RESOURCE_DEVELOPMENT', 'DISTRIBUTION', 'DISPATCH_DEPARTMENT',
  'STORE_DEPARTMENT', 'MANAGEMENT'
];
const CHECK_BOX_OPTIONS = ['Health Insurance', 'Newsletter', 'Work From Home'];

export default function UpdateProfileModal({ visible, onClose, employee, onUpdate }) {
  const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000));
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: '',
    department: 'IT',
    isMale: true,
    dateOfBirth: new Date(),
    photoUrl: null,
    resumeUrl: null,
    checkBoxOptions: []

  });

 
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAuthToken().then(token => setToken(token));
  }, []);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeName: employee.employeeName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        password: employee.password,
        address: employee.address,
        department: employee.department,
        isMale: employee.isMale,
        dateOfBirth: new Date(employee.dateOfBirth),
        photoUrl: employee.photoUrl,
        resumeUrl: employee.resumeUrl,
        checkBoxOptions: employee.checkBoxOptions
      });
    }
  }, [employee]);

  // const handlePickPhoto = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 1,
  //     });

  //     if (!result.canceled) {
  //       setFormData({ ...formData, photoUrl: result.assets[0].uri });
  //     }
  //   } catch (error) {
  //     console.error('Image Picker Error:', error);
  //     Alert.alert('Error', 'Failed to pick an image');
  //   }
  // };

  // const pickDocument = async () => {
  //   const result = await DocumentPicker.getDocumentAsync({
  //     type: 'application/pdf',
  //   });

  //   if (result.canceled) {
  //     console.log("Document picking was canceled.");
  //     return;
  //   }

  //   if (result.assets && result.assets.length > 0) {
  //     setFormData({ ...formData, resumeUrl: result.assets[0].uri });
  //     console.log("Resume URI:", result.assets[0].uri);
  //   }
  // };


  const handlePickPhoto = async () => {
     try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
      
          if (!result.canceled && result.assets.length > 0) {
            // Show loading state
            setIsLoading(true);
            
            try {
              const fileUrl = await uploadFileToS3(result.assets[0].uri, 'jpeg');
              setFormData({
                ...formData,
                photoUrl: fileUrl
              });
            } finally {
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error('Error picking/uploading image:', error);
          setErrors(prev => ({
            ...prev,
            photoUpload: 'Failed to upload image. Please try again.'
          }));
        }
   };
   
   const pickDocument = async () => {
    try {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
          });
      
          if (!result.canceled && result.assets && result.assets.length > 0) {
            // Show loading state
            setIsLoading(true);
            
            try {
              const fileUrl = await uploadFileToS3(result.assets[0].uri, 'pdf');
              setFormData({
                ...formData,
                resumeUrl: fileUrl
              });
            } finally {
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error('Error picking/uploading document:', error);
          setErrors(prev => ({
            ...prev,
            resumeUpload: 'Failed to upload resume. Please try again.'
          }));
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

  const handleCheckboxToggle = (option) => {
    setFormData(prevData => {
      const updatedOptions = prevData.checkBoxOptions.includes(option)
        ? prevData.checkBoxOptions.filter(item => item !== option)
        : [...prevData.checkBoxOptions, option];
      return {
        ...prevData,
        checkBoxOptions: updatedOptions
      };
    });
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeName) newErrors.employeeName = 'Name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Valid phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {

      const response = await makePutRequest(
        `${API_URL}/api/employees/${employee.id}`,
        formData
      );




      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        onUpdate();
        onClose();
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Error', 'Network error occurred');
    }
  };

  return (

    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ScrollView showsVerticalScrollIndicator={false}>
        
          <View style={styles.modalContainer}>
            <View style={{flex : 1, flexDirection: 'row',justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.title}>Update Profile</Text>
            <Button  onPress={onClose} style={{borderRadius: 60,}} textColor='#850101' > <Text style={{fontSize: 20, color: "#000", borderColor: "#000", borderWidth: 2,}} >X</Text></Button>
            </View>
            

            <TextInput label="Name" value={formData.employeeName} textColor='#000'
              onChangeText={(text) => setFormData({ ...formData, employeeName: text })}
              error={!!errors.employeeName} style={styles.input}  
              theme={{
                colors: {
                  primary: '#510ac9', // Color when focused
                  text: '#000', // Text color
                  placeholder: '#510ac9', // Placeholder color
                },
              }}/>
            <HelperText type="error" visible={!!errors.employeeName}>{errors.employeeName}</HelperText>

            <TextInput label="Email" value={formData.email} keyboardType="email-address" textColor='#000'
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={!!errors.email} style={styles.input} 
              theme={{
                colors: {
                  primary: '#510ac9', // Color when focused
                  text: '#000', // Text color
                  placeholder: '#510ac9', // Placeholder color
                },
              }}/>
            <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

            <TextInput label="Phone Number" value={formData.phoneNumber} keyboardType="phone-pad" textColor='#000'
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              error={!!errors.phoneNumber} style={styles.input}
              theme={{
                colors: {
                  primary: '#510ac9', // Color when focused
                  text: '#000', // Text color
                  placeholder: '#510ac9', // Placeholder color
                },
              }}
               />
            <HelperText type="error" visible={!!errors.phoneNumber}>{errors.phoneNumber}</HelperText>

          

            <TextInput label="Address" value={formData.address} textColor='#000'
              theme={{
                colors: {
                  primary: '#510ac9', // Color when focused
                  text: '#000', // Text color
                  placeholder: '#510ac9', // Placeholder color
                },
              }}
            
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              error={!!errors.address} style={styles.input} />
            <HelperText type="error" visible={!!errors.address}>{errors.address}</HelperText>

          

            <SearchableDepartmentPicker
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              departments={DEPARTMENTS}
            />

            <Text style={styles.label} >Gender</Text>
            <RadioButton.Group 
              onValueChange={(value) => setFormData({ ...formData, isMale: value === 'male' })}
              value={formData.isMale ? 'male' : 'female'} >
              <View style={styles.radioGroup} >
                <View style={styles.radioButton} ><RadioButton value="male" color="#510ac9" /><Text style={{color:"#000"}}>Male</Text></View>
                <View style={styles.radioButton}><RadioButton value="female" color="#510ac9"/><Text style={{color:"#000"}}>Female</Text></View>
              </View>
            </RadioButton.Group>

            <Text style={styles.label}>Date of Birth</Text>
            <Button onPress={() => setShowDatePicker(true)} textColor='#510ac9' style={{borderWidth:1,borderColor:'#999090'}}>Select Date {employee.dateOfBirth}</Button>
            {showDatePicker && (
              <DatePicker
                value={formData.dateOfBirth}
                maximumDate={yesterday}
                textColor='#510ac9'
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                 
                  setShowDatePicker(false);
                  if (selectedDate) setFormData({ ...formData, dateOfBirth: selectedDate });
                }}
              />
            )}
            <Text style={styles.label}>Additional Options</Text>
            <View style={styles.checkboxContainer}>
              {CHECK_BOX_OPTIONS.map((option) => (
                <View key={option} style={styles.checkboxRow}>
                  <Checkbox color='#510ac9'
                    status={formData.checkBoxOptions.includes(option) ? 'checked' : 'unchecked'}
                    onPress={() => handleCheckboxToggle(option)}
                  />
                  <Text style={styles.checkboxLabel}>{option}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.label}>Photo</Text>
            {/* <Button onPress={handlePickPhoto}>
              {formData.photoUrl ? 'Change Photo' : 'Pick Photo'}
            </Button>
            {formData.photoUrl && (
              <Image
                style={{ width: 100, height: 100, alignSelf: 'center', margin: 5, borderRadius: 10, }}
                source={{ uri: formData.photoUrl }}
              />
            )} */}

            <CircularPhotoUpload
              photoUrl={formData.photoUrl}
              onPress={handlePickPhoto}
            />
            {isLoading && <ActivityIndicator size="large" color="#510ac9" />}

            <Text style={styles.label}>Resume</Text>
            <Button onPress={pickDocument} textColor='#510ac9'>
              {formData.resumeUrl ? 'Change Resume' : 'Pick Resume'}
            </Button>
            {formData.resumeUrl && (
              <Text numberOfLines={1} style={{color: '#000'}}>
                {formData.resumeUrl.split('/').pop()}
              </Text>
            )}




            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={handleSave} style={{ width: 356, backgroundColor: '#510ac9' }} textColor='#fff'>Save</Button>
              <Button mode='outlined' onPress={onClose} style={{ width: 356 }} textColor='#850101' >Cancel</Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>

  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',

  },
  modalContainer: { width: '100%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#000', },
  input: { backgroundColor: '#fff', marginBottom: 10 , },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 , color:"#000",},
  radioGroup: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 },
  radioButton: { flexDirection: 'row', alignItems: 'center', },
  buttonContainer: { marginTop: 20, alignItems: 'center', gap: 10, marginBottom: 40, },
  cancelText: { color: 'red', fontSize: 16, marginTop: 10, borderBlockColor: 'red', borderColor: 'red', borderWidth: 1, borderRadius: 20, padding: 10 },
  checkboxContainer: {
    marginVertical: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#000',
  },
});
