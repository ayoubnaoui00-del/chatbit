import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../utils/constants';

interface BottomNavBarProps {
  activeTab?: 'chat' | 'history' | 'profile';
  onSelectTab?: (tab: 'chat' | 'history' | 'profile') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'chat',
  onSelectTab,
}) => {
  const router = useRouter();

  const handlePress = (tab: 'chat' | 'history' | 'profile') => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    if (tab === 'chat') {
      router.push('/(app)/conversations');
    } else if (tab === 'history') {
      router.push('/(app)/conversations');
    } else if (tab === 'profile') {
      router.push('/(app)/profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('chat')}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, activeTab === 'chat' && styles.iconActive]}>
          💬
        </Text>
        <Text style={[styles.label, activeTab === 'chat' && styles.labelActive]}>
          Chat
        </Text>
      </TouchableOpacity>

      {/* History Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('history')}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, activeTab === 'history' && styles.iconActive]}>
          🕒
        </Text>
        <Text style={[styles.label, activeTab === 'history' && styles.labelActive]}>
          History
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handlePress('profile')}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, activeTab === 'profile' && styles.iconActive]}>
          👤
        </Text>
        <Text style={[styles.label, activeTab === 'profile' && styles.labelActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  icon: {
    fontSize: 20,
    color: '#6E7687',
    marginBottom: 2,
  },
  iconActive: {
    color: COLORS.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E7687',
  },
  labelActive: {
    color: COLORS.primary,
  },
});
