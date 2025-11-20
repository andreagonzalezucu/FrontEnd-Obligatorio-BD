import { Stack, Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function PrincipalLayout() {
  return (
    <Stack screenOptions={{ title:"Inicio" }}>
      <Stack.Screen name="index" />       
      <Stack.Screen name="misReservas" /> 
      <Stack.Screen name="edificio" />  
    </Stack>
  );
}
