import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  textStyle,
  icon,
  ...props
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.surfaceContainerHigh;
    switch (variant) {
      case 'primary':
        return COLORS.primaryContainer;
      case 'secondary':
        return COLORS.secondary;
      case 'danger':
        return COLORS.error;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primaryContainer;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.outline;
    switch (variant) {
      case 'primary':
        return COLORS.onPrimary;
      case 'secondary':
        return COLORS.onSecondary;
      case 'danger':
        return COLORS.onError;
      case 'outline':
        return COLORS.primary;
      default:
        return COLORS.onPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
          {icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  text: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
