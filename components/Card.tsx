// components/Card.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../styles/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'cadastro' | 'relatorio' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  style,
  elevated = true,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'cadastro':
        return { borderTopColor: colors.accent };
      case 'relatorio':
        return { borderTopColor: colors.success };
      case 'success':
        return { borderTopColor: colors.success, backgroundColor: colors.bgSuccess };
      case 'warning':
        return { borderTopColor: colors.warning, backgroundColor: colors.bgWarning };
      case 'danger':
        return { borderTopColor: colors.danger, backgroundColor: colors.bgLight };
      default:
        return { borderTopColor: colors.primary };
    }
  };

  return (
    <View 
      style={[
        styles.card,
        getVariantStyle(),
        elevated && styles.elevated,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    borderTopWidth: 6,
  },
  elevated: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default Card;