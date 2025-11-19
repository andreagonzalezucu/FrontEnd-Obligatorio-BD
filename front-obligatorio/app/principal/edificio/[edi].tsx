import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

type sala={
    nombre_sala: string,
    id_sala: number,
    id_edificio:number,
    capacidad:number,
    tipo_sala:string
}

export default function EdificioDetail() {
  const { edi } = useLocalSearchParams();  // nombre del edificio
  const [salas, setSalas] = useState<sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router= useRouter();

  const fetchSalas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/salas");
      const data: sala[] = await response.json();

      if (!response.ok) {
        setError("No se pudieron cargar las salas");
        return;
      }

      // Filtrar las salas por edificio elegido
      const filtradas = data.filter(
        (s:sala) => s.id_edificio === Number(edi)
      );

      setSalas(filtradas);
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalas();
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
      <Text style={styles.title}>Salas en {edi}</Text>

      {salas.length === 0 && (
        <Text style={styles.noData}>Este edificio no tiene salas registradas.</Text>
      )}

      {salas.map((sala, index) => (
        <TouchableOpacity key={index} style={styles.button} onPress={() => router.push({
        pathname: "/principal/edificio/sala/[sal]",
        params: { sal: sala.id_sala }
      })}>
          <Text style={styles.buttonText}>{sala.nombre_sala}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1e3a8a",
  },
  button: {
    width: "80%",
    backgroundColor: "#1e3a8a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 17,
    color: "white",
    fontWeight: "bold",
  },
  noData: {
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  error: {
    color: "#e11d48",
    fontSize: 16,
  },
});
