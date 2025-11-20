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


    </Tabs>
  );
}
