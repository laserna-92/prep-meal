import React from 'react';
import { Tabs } from 'expo-router';
import { CalendarDays, ChefHat, Home, User, UtensilsCrossed } from 'lucide-react-native';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.elevated,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'Hoje', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="plan"
        options={{ title: 'Plano', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="prep"
        options={{ title: 'Prep', tabBarIcon: ({ color, size }) => <ChefHat color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="recipes"
        options={{ title: 'Receitas', tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Eu', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
