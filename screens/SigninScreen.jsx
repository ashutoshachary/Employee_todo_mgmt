// screens/SigninScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api-endpoints/API_URL';
import { hashPassword } from '../pass-protect/hashPassword';

export default function SigninScreen({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
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

  // Add this function to get the stored token
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = await getAuthToken();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  const handleSignin = async () => {
    const token = await getAuthToken();
    console.log(token)
    try {
      const response = await fetch(
        `${API_URL}/api/employees/signin?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Store both token and userId
        await storeAuthData(data.token, data.id);
        setIsAuthenticated(true);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        theme={{
          colors: {
            primary: '#510ac9', // Color when focused
            text: '#000', // Text color
            placeholder: '#510ac9', // Placeholder color
            background: '#fff', // Background color
            outlineColor: '#510ac9', // Border color when NOT focused (for outlined variant)
            onSurface: '#510ac9', // Placeholder color
          },
        }}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!passwordVisible}
        style={styles.input}
        theme={{
          colors: {
            primary: '#510ac9', // Color when focused
            text: '#000', // Text color
            placeholder: '#510ac9', // Placeholder color
            background: '#fff', // Background color
            outlineColor: '#510ac9', // Border color when NOT focused (for outlined variant)
            onSurface: '#510ac9', // Placeholder color
          },
        }}
        right={
          <TextInput.Icon
            icon={!passwordVisible ? "eye-off" : "eye"}
            onPress={handleTogglePasswordVisibility}
            forceTextInputFocus={false}
          />
        }
      />

      {error ? (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      ) : null}

      <Button mode="contained" onPress={handleSignin} style={styles.button} textColor='#fff'>
        Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#510ac9',
    
    
  },
});

