import { Stack } from "expo-router";

export default function PrincipalLayout() {
  return (
    <Stack screenOptions={{ title:"Inicio" }}>
      <Stack.Screen name="index" options={{ headerLeft: () => null }}/>       
      <Stack.Screen name="misReservas" /> 
      <Stack.Screen name="estadisticas" />
      <Stack.Screen name="edificio" /> 
      <Stack.Screen name="sala" />       
    </Stack>
  );
}
