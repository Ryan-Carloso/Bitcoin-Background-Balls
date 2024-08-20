import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView, StyleSheet, Dimensions, StatusBar } from 'react-native';
import SkiaComponent from './SkiaComponent';

export default function App() {
  const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaProvider>
        <StatusBar barStyle="light-content" />

      <SafeAreaView style={[styles.container, { width, height }]}>
        <SkiaComponent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
});