/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import HomePage from './src/Screens/HomePage';
import MovieDetails from './src/Screens/MovieDetails';
import LoginPage from './src/Screens/LoginPage';
import RegisterPage from './src/Screens/RegisterPage';
import ProfilePage from './src/Screens/ProfilePage';
import MyListPage from './src/Screens/MyListPage';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ORANGE_DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF6B6B',
    background: '#0a0a0a',
    card: '#1a1a1a',
    text: '#ffffff',
    border: '#333333',
    notification: '#FF6B6B',
  },
};

function HomeScreen({ navigation }) {
  return <HomePage navigation={navigation} />;
}


function MyListScreen({ navigation }) {
  return <MyListPage navigation={navigation} />;
}

function ProfileScreen({ navigation }) {
  return <ProfilePage navigation={navigation} />;
}


function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MovieDetails" component={MovieDetails} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Register" component={RegisterPage} />
    </Stack.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={ORANGE_DARK_THEME}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#FF6B6B',
            tabBarInactiveTintColor: '#888888',
            tabBarStyle: {
              backgroundColor: '#1a1a1a',
              borderTopColor: '#333333',
            },
          }}
        >
          <Tab.Screen 
            name="Ana Sayfa" 
            component={HomeStack}
            options={{
              tabBarIcon: () => <Text style={styles.tabIcon}>🏠</Text>,
            }}
          />
          <Tab.Screen 
            name="Listem" 
            component={MyListScreen}
            options={{
              tabBarIcon: () => <Text style={styles.tabIcon}>📋</Text>,
            }}
          />
          <Tab.Screen 
            name="Profil" 
            component={ProfileScreen}
            options={{
              tabBarIcon: () => <Text style={styles.tabIcon}>👤</Text>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <View style={styles.container}>
      <HomePage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 20,
  },
});

export default App;
