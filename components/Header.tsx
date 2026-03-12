// components/Header.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

interface HeaderProps {
  subtitle?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  subtitle = 'Gestão de Inventário Coasal',
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      {showLogo && (
        <Text style={styles.title}>
          A<Text style={styles.span}>Check</Text>
        </Text>
      )}
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 2,
  },
  span: {
    color: colors.accent,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
    marginTop: -5,
    textAlign: 'center',
  },
});

export default Header;