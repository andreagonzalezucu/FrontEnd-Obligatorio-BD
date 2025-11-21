import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function PrincipalHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/principal/edificio")}
      >
        <Text style={styles.buttonText}>Reservar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/principal/misReservas")}
      >
        <Text style={styles.buttonText}>Mis Reservas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/principal/estadisticas")}
      >
        <Text style={styles.buttonText}>Estadísticas</Text>
      </TouchableOpacity>

      <View style={styles.logOutContainer}>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.logOutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 40,
  },
  button: {
    width: "70%",
    backgroundColor: "#1e3a8a",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center'
  },
  logOutContainer: {
    position: "absolute",
    bottom: 40,
  },
  logOutText: {
    color: "#1e3a8a",
    fontSize: 16,
    fontWeight: "600",
  },
});
