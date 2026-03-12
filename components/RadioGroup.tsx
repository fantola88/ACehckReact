// components/RadioGroup.tsx
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  showObs?: boolean;
  onShowObsChange?: (show: boolean) => void;
  obsValue?: string;
  onObsChange?: (text: string) => void;
  obsPlaceholder?: string;
  inline?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  showObs = false,
  onShowObsChange,
  obsValue = '',
  onObsChange,
  obsPlaceholder = 'Observações...',
  inline = true,
}) => {
  const handleOptionPress = (optionValue: string) => {
    onChange(optionValue);
    if (onShowObsChange) {
      onShowObsChange(optionValue !== 'OK');
    }
  };

  return (
    <View style={[styles.container, !inline && styles.verticalContainer]}>
      <View style={[styles.header, !inline && styles.verticalHeader]}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.options, !inline && styles.verticalOptions]}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, !inline && styles.verticalOption]}
              onPress={() => handleOptionPress(option.value)}
            >
              <View style={[
                styles.radio,
                value === option.value && styles.radioSelected
              ]}>
                {value === option.value && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {showObs && onObsChange && (
        <View style={styles.obsContainer}>
          <TextInput
            style={styles.obsInput}
            value={obsValue}
            onChangeText={onObsChange}
            placeholder={obsPlaceholder}
            placeholderTextColor={colors.lightGray}
            multiline
            numberOfLines={2}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  verticalContainer: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  options: {
    flexDirection: 'row',
    gap: 16,
  },
  verticalOptions: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verticalOption: {
    width: '100%',
    paddingVertical: 4,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  obsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  obsInput: {
    borderWidth: 2,
    borderColor: colors.borderDanger,
    backgroundColor: colors.bgLight,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});

export default RadioGroup;