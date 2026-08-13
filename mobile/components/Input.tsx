import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  containerStyle,
  leftIcon,
  secureTextEntry,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        {leftIcon && <View style={styles.iconSlot}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.outline}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.default,
    height: 48,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  iconSlot: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.onSurface,
  },
  toggleButton: {
    paddingLeft: SPACING.sm,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
});
