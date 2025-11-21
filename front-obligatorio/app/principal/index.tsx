import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState,useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:5000"
      : "http://127.0.0.1:5000";

export default function PrincipalHome() {
  const router = useRouter();
  const [tieneSancion, setTieneSancion] = useState(false)
  const [cargandoSancion, setCargandoSancion] = useState(true);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const cargarRol = async () => {
      const r = await AsyncStorage.getItem("user_rol");
      setRol(r);
    };
    cargarRol();
  }, []);
  
  useEffect(() => {
  async function verificarSanciones() {
    const ci = await AsyncStorage.getItem("user_ci");
    if (!ci) return;

    const response = await fetch(`${BASE_URL}/sanciones/${ci}/activas`);
    const data = await response.json();

    setTieneSancion(data.tiene_sancion);
    setCargandoSancion(false);
  }

    verificarSanciones();
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>

      <TouchableOpacity
        style={[
          styles.button,
          tieneSancion && { backgroundColor: "#9ca3af" } 
        ]}
        onPress={() => {
          if (!tieneSancion) {
            router.push("/principal/edificio");
          }
        }}
        disabled={tieneSancion}
      >
        <Text style={styles.buttonText}>
          Reservar
        </Text>
      </TouchableOpacity>

      {tieneSancion && (
        <Text style={{ 
            marginTop: 10,
            color: "red",
            fontWeight: "bold",
            textAlign: "center"
        }}>
          Tenés una sanción vigente y no podés realizar reservas
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/principal/misReservas")}
      >
        <Text style={styles.buttonText}>Mis Reservas</Text>
      </TouchableOpacity>

      {rol === "admin" ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/principal/estadisticas")}
        >
          <Text style={styles.buttonText}>Estadísticas</Text>
        </TouchableOpacity>
      ):(<View />)}

      {rol === "admin" ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/principal/panelDeControl")}
        >
          <Text style={styles.buttonText}>Panel de control</Text>
        </TouchableOpacity>
      ): <View />}

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
