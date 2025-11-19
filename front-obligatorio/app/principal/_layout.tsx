import { Stack } from "expo-router";

export default function PrincipalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edificio/[edi]" />
      <Stack.Screen name="edificio/sala/[sal]" />
    </Stack>
  );
}