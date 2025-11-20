import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Sala={
    nombre_sala: string,
    id_sala: number,
    id_edificio:number,
    capacidad:number,
    tipo_sala:string
}

type Edificio = {
  id_edificio: number;
  nombre_edificio: string;
};

const API = "http://localhost:5000";

export default function EdificioDetail() {
  const { edi } = useLocalSearchParams<{ edi: string }>();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [edificio, setEdificio] = useState<Edificio | null>(null);

  const [loadingEdificio, setLoadingEdificio] = useState(true);
  const [loadingSalas, setLoadingSalas] = useState(true);
  const [error, setError] = useState("");

  const router= useRouter();
  const idEdificioNum = Number(edi);

  const fetchEdificio = async () => {
    try{
      const response = await fetch(`${API}/edificios/${idEdificioNum}`)
      const data: Edificio = await response.json()

      if (!response.ok) {
        setError("No se pudo cargar info del edificio");
        return;
      }

      setEdificio(data)
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoadingEdificio(false);
    }
  }

  const fetchSalas = async () => {
    try {
      const ci = await AsyncStorage.getItem("user_ci");

      const response = await fetch(`${API}/salas-permitidas?ci=${ci}&id_edificio=${idEdificioNum}`);

      const data: Sala[] = await response.json();

      if (!response.ok) {
        setError("No se pudieron cargar las salas");
        return;
      }

      // Filtrar las salas por edificio elegido
      const filtradas = data.filter(
        (s:Sala) => s.id_edificio === idEdificioNum
      );

      setSalas(filtradas);
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoadingSalas(false);
    }
  };

  useEffect(() => {
    fetchEdificio();
    fetchSalas();
  }, [edi]);

  if (loadingEdificio || loadingSalas) {
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
      {edificio &&
      <Text style={styles.title}>Salas en {edificio?.nombre_edificio}</Text>
      }

      {salas.length === 0 && (
        <Text style={styles.noData}>Este edificio no tiene salas registradas.</Text>
      )}

      {salas.map((sala) => (
        <TouchableOpacity
           key={sala.id_sala}
           style={styles.button} 
           onPress={() => 
            router.push({
                pathname: "/principal/edificio/sala/[sal]",
                params: { sal: sala.id_sala }
            })
           }
        >
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
