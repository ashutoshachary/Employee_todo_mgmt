import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignupScreen from '../screens/SignupScreen';
import SigninScreen from '../screens/SigninScreen';
import { AppTabs } from './AppNavigator';
import { AuthContext,useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';


const Stack = createNativeStackNavigator();

export default function AuthNavigator(){
    const navigation = useNavigation();
      const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const {isAuthenticated, setIsAuthenticated} = useAuth();
      return(
        <>
        <Stack.Navigator >
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
                      children={() => <AppTabs isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} navigation={navigation}/>} 
                      options={{ headerShown: false }}
                    //   isAuthenticated={isAuthenticated }
                    //   setIsAuthenticated={setIsAuthenticated}

                    />
                  )}
                </Stack.Navigator>
        </>
      )
    

}