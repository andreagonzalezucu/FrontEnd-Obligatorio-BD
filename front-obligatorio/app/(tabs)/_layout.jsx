import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>

      <Tabs.Screen
        name="login"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="misReservas"
        options={{
          title: "Mis reservas",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar" size={26} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
