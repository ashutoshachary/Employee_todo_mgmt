import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '../api-endpoints/API_URL';

export default function SigninScreen({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Google OAuth Configuration
  const googleAuth = {
    client_id: '608175201687-466vui4m94sd72tt2dhph1disi16i21j.apps.googleusercontent.com',
    redirect_uri: 'http://localhost:8083/api/auth/google',
    response_type: 'token',
    scope: 'email profile',
  };

  useEffect(() => {
    // Add event listener for deep linking
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (event) => {
    if (event.url) {
      const url = new URL(event.url);
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        await handleGoogleSuccess(accessToken);
      }
    }
  };

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

  const handleGoogleLogin = async () => {
    try {
      const queryString = Object.entries(googleAuth)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
        // console.log(queryString);
      
      const result = await WebBrowser.openAuthSessionAsync(
        `https://accounts.google.com/o/oauth2/v2/auth?${queryString}`,
        googleAuth.redirect_uri
      );
      console.log(result);

      if (result.type === 'success') {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        if (accessToken) {
          await handleGoogleSuccess(accessToken);
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Google sign-in failed');
    }
  };

  const handleSignin = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/employees/signin?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const data = await response.json();
        await storeAuthData(data.token, data.id);
        setIsAuthenticated(true);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleGoogleSuccess = async (accessToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: accessToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await storeAuthData(data.token, data.id);
        setIsAuthenticated(true);
      } else {
        setError('Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed');
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
            primary: '#510ac9',
            text: '#000',
            placeholder: '#510ac9',
            background: '#fff',
            outlineColor: '#510ac9',
            onSurface: '#510ac9',
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
            primary: '#510ac9',
            text: '#000',
            placeholder: '#510ac9',
            background: '#fff',
            outlineColor: '#510ac9',
            onSurface: '#510ac9',
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

      <Button
        mode="contained"
        onPress={handleSignin}
        style={styles.button}
        textColor='#fff'
      >
        Sign In
      </Button>

      <Button
        mode="outlined"
        onPress={handleGoogleLogin}
        style={[styles.button, styles.googleButton]}
        textColor='#510ac9'
      >
        Sign in with Google
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#510ac9',
  },
  googleButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
    borderColor: '#510ac9',
    borderWidth: 1,
  },
});