import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../utils/constants';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surfaceContainerLowest,
        },
        headerTintColor: COLORS.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="conversations"
        options={{
          title: 'Support Conversations',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="conversation/[id]"
        options={{
          title: 'Chat',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'My Profile',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
});
