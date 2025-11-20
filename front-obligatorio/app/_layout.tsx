import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ title: 'Log In' }} />
        <Stack.Screen name="principal/index" options={{ title: 'Reserve su sala' }} />
        <Stack.Screen name="principal/edificio/[edi]" options={{ title: 'Edificio' }} />
      
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

