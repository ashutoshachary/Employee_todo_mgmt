import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
// import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdateProfileModal from './UpdateProfileModal';
import { WebView } from "react-native-webview";
import PDFViewerModal from './PDFViewer';
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from '../api-endpoints/API_URL';
import UpdatePasswordModal from './UpdatePasswordModal';
import { makeAuthenticatedRequest, getAuthData, clearAuthData } from '../token-data/apiutils';
export default function ProfileScreen({ isAuthenticated, setIsAuthenticated, navigation }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState(null)


  const handleUpdateProfile = () => {
    setModalVisible(true);
  };


  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        // Get both token and userId
        const { token, userId } = await getAuthData();

        if (!userId || !token) {
          Alert.alert('Error', 'Authentication expired. Please log in again.');
          setIsAuthenticated(false);
          return;
        }

        const response = await makeAuthenticatedRequest(`${API_URL}/api/employees/${userId}`);

        if (response.ok) {
          const data = await response.json();
          setEmployee(data);
        } else if (response.status === 401) {
          // Handle unauthorized access (invalid or expired token)
          Alert.alert('Session Expired', 'Please log in again');
          setIsAuthenticated(false);
        } else {
          Alert.alert('Error', 'Failed to fetch employee details');
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
        Alert.alert('Error', 'Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setIsAuthenticated(false);
      clearAuthData();
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const refreshProfile = async () => {
    try {
      setLoading(true);
      // const userId = await AsyncStorage.getItem('userId');
      const { token, userId } = await getAuthData();
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/employees/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        Alert.alert('Error', 'Failed to fetch updated profile details');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }

  };



  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (

    <ScrollView style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false} >
      <View style={styles.container}>
        {employee ? (
          <>
            <Image
              style={styles.image}
              source={{ uri: employee.photoUrl }}
            />
            <View style={styles.infoContainer}>
              <InfoRow label="Name" value={employee.employeeName} />
              <InfoRow label="Email" value={employee.email} />
              <InfoRow label="Phone" value={employee.phoneNumber} />
              <InfoRow label="Address" value={employee.address} />
              <InfoRow label="Department" value={employee.department.replace(/_/g, ' ')} />
              <InfoRow label="Gender" value={employee.isMale ? 'Male' : 'Female'} />
              <InfoRow label="Date of Birth" value={employee.dateOfBirth} />
              <View style={styles.infoRow1}>
                <Text style={styles.label1}>Selected Options:</Text>
                <View style={styles.optionsContainer1}>
                  {employee.checkBoxOptions.map((option, index) => (
                    <Text key={index} style={styles.optionText1}>
                      {option}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <Button
              title="Open PDF"
              onPress={() => {
                setPdfUri(employee.resumeUrl)
                setModalVisible1(true)
              }}
              color="#779EB2"
            />

            <View style={styles.buttonContainer}>
              <Button title="Update Profile" onPress={handleUpdateProfile} color="#86A17D" />
              <Button title="Update Password" onPress={() => setPasswordModalVisible(true)} color="#455A64" />
              <Button title="Logout" onPress={handleLogout} color="#850101"  />
            </View>

            <UpdateProfileModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              employee={employee}
              onUpdate={refreshProfile}
            />
            <UpdatePasswordModal
              visible={passwordModalVisible}
              onClose={() => setPasswordModalVisible(false)}
            />
            <PDFViewerModal
              pdfUri={pdfUri}
              visible={modalVisible1}
              onClose={() => setModalVisible1(false)}
            />
          </>
        ) : (
          <Text style={styles.errorText}>Failed to load profile details.</Text>
        )}
      </View>
    </ScrollView>

  );
}
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);


const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  image: {
    width: 100, height: 100, alignSelf: 'center', margin: 5, borderRadius:60,marginBottom:20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#455A64',
    width: 120,
  },
  value: {
    fontSize: 16,
    color: '#546E7A',
    flex: 1,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#546E7A',
    marginLeft: 120,

  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  errorText: {
    color: '#B71C1C',
    fontSize: 16,
    textAlign: 'center',
  },
  infoRow1: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  label1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#455A64',
    width: 120,
  },
  value1: {
    fontSize: 16,
    color: '#546E7A',
    flex: 1,
  },
  optionsContainer1: {
    flex: 1,
  },
  optionText1: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 4,
  },
});


