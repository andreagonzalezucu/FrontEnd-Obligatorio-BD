import { Stack } from "expo-router";

export default function SalaStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[sal]" />
    </Stack>
  );
}
