import { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Accordion({ title, children }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <FontAwesome
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#4f46e5"
        />
      </TouchableOpacity>

      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    elevation: 2
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a"
  },
  content: {
    marginTop: 10
  }
});
