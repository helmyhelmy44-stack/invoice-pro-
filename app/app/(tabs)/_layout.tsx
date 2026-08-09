import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'invoices') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'clients') iconName = focused ? 'people' : 'people-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { paddingBottom: 8, height: 60 },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: 'الرئيسية' }} />
      <Tabs.Screen name="invoices" options={{ tabBarLabel: 'الفواتير' }} />
      <Tabs.Screen name="clients" options={{ tabBarLabel: 'العملاء' }} />
    </Tabs>
  );
}
