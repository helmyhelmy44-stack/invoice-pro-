import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="create-invoice" 
          options={{ 
            title: 'فاتورة جديدة', 
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#f8fafc' },
          }} 
        />
        <Stack.Screen 
          name="invoice/[id]" 
          options={{ 
            title: 'تفاصيل الفاتورة', 
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#f8fafc' },
          }} 
        />
      </Stack>
    </>
  );
}
