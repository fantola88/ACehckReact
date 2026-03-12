// components/InputField.tsx
import React, { useState } from 'react';
import {
    Animated,
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import { colors } from '../styles/colors';

interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  error?: string;
  success?: boolean;
  required?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  success,
  required,
  autoCapitalize = 'none',
  style,
  inputStyle,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [borderColor] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColor, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColor, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.();
  };

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (success) return colors.success;
    if (isFocused) return colors.primary;
    return colors.lightGray;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      <Animated.View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() },
        !editable && styles.inputDisabled
      ]}>
        <TextInput
          style={[
            styles.input,
            !editable && styles.inputReadOnly,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          keyboardType={keyboardType}
          editable={editable}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize={autoCapitalize}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  required: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 4,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  input: {
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputReadOnly: {
    backgroundColor: colors.lighterGray,
    fontWeight: 'bold',
    color: colors.primary,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default InputField;