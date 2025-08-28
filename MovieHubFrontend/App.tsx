/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import HomePage from './Src/Screens/HomePage';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const ORANGE_DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#ff7a1a',
    background: '#0b0f17',
    card: '#131a24',
    text: '#ffffff',
    border: '#1f2a3b',
    notification: '#ff7a1a',
  },
};

function HomeScreen() {
  return <HomePage />;
}

function ExploreScreen() {
  return <View style={styles.placeholder} />;
}

function MyListScreen() {
  return <View style={styles.placeholder} />;
}

function ProfileScreen() {
  return <View style={styles.placeholder} />;
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
            tabBarActiveTintColor: '#ff7a1a',
            tabBarInactiveTintColor: '#9aa4b2',
            tabBarStyle: {
              backgroundColor: '#131a24',
              borderTopColor: '#1f2a3b',
            },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Explore" component={ExploreScreen} />
          <Tab.Screen name="My List" component={MyListScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
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
    backgroundColor: '#0b0f17',
  },
});

export default App;
