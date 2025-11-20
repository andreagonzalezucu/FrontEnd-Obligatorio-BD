import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      
      <Tabs.Screen
        name="login"
        options={{
          href: null, 
        }}
      />

      <Tabs.Screen
        name="principal/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="principal/misReservas"
        options={{
          title: "Mis reservas e Invitaciones",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="star" size={26} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
