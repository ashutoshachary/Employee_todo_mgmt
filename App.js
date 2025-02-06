import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import WelcomeScreen from './screens/WelcomeScreen';
import SignupScreen from './screens/SignupScreen';
import SigninScreen from './screens/SigninScreen';
import { AppTabs } from './navigation/AppNavigator';
import { AuthContext, AuthProvider } from './context/AuthContext';
import AuthNavigator from './navigation/AuthNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <PaperProvider>
      <NavigationContainer>
        <AuthNavigator/>
        {/* <Stack.Navigator >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
              <Stack.Screen 
                name="Signup" 
                component={(props) => <SignupScreen {...props} setIsAuthenticated={setIsAuthenticated} />} 
              />
              <Stack.Screen 
                name="Signin" 
                component={(props) => <SigninScreen {...props} setIsAuthenticated={setIsAuthenticated} />} 
              />
            </>
          ) : (
            <Stack.Screen 
              name="MainApp" 
              component={AppTabs} 
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator> */}
      </NavigationContainer>
    </PaperProvider>
  );}