// components/AppHeader.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          <Text style={styles.logoA}>A</Text>
          <Text style={styles.logoCheck}>Check</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
  },
  content: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoA: {
    color: '#1E3A8A',
  },
  logoCheck: {
    color: '#DC2626',
  },
});