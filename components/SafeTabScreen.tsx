// components/SafeTabScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';

interface SafeTabScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export const SafeTabScreen: React.FC<SafeTabScreenProps> = ({ 
  children, 
  scroll = true 
}) => {
  const insets = useSafeAreaInsets();

  // Calcula o espaço necessário para a barra de navegação do sistema
  // No Android, insets.bottom é a altura da barra de navegação
  const bottomSpace = insets.bottom > 0 ? insets.bottom : 0;

  if (scroll) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: bottomSpace + 60 } // 60 é altura da tab bar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace + 60 }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 12,
  },
});

export default SafeTabScreen;