import { Stack } from "expo-router";

export default function PrincipalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Principal' }}/>
      <Stack.Screen name="edificio/[edi]" options={{ title: 'Edificio' }}/>
      <Stack.Screen name="edificio/sala/[sal]" options={{ title: 'Sala' }}/>
    </Stack>
  );
}