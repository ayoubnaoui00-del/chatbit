import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

interface OnlineIndicatorProps {
  isOnline?: boolean;
  size?: number;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline = false,
  size = 10,
}: OnlineIndicatorProps) => {
  return (
    <View
      style={[
        styles.indicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isOnline ? COLORS.online : 'transparent',
          borderColor: isOnline ? '#ffffff' : COLORS.outline,
          borderWidth: isOnline ? 1.5 : 1,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
