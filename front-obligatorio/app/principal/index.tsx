import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Keyboard } from "react-native";
import { useRouter } from "expo-router";

type edificio={
    nombre_edificio: string,
    id_edificio:number,
    direccion: string,
    departamento:string
}

export default function Principal() {
  const [edificios, setEdificios] = useState<edificio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchEdificios = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/edificios"); 
      const data = await response.json();

      if (!response.ok) {
        setError("No se pudieron cargar los edificios");
        return;
      }

      setEdificios(data);
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdificios();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edificios</Text>

      {edificios.map((e, index) => (
        <TouchableOpacity key={index} style={styles.button} onPress={() => {
          Keyboard.dismiss();
          router.push({
            pathname: "/principal/edificio/[edi]",
            params: { edi: String(e.id_edificio) }
      })}}>
          <Text style={styles.buttonText}>{e.nombre_edificio}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    backgroundColor: "#1e3a8a",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "#e11d48",
    fontSize: 16,
  },
});
