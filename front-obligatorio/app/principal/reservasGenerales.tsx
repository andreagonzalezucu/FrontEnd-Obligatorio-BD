import { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, StyleSheet, 
  ActivityIndicator, TouchableOpacity, Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type Reserva={
  id_reserva: number,
  id_sala: number,
  fecha: string
  id_turno:number,
  estado:string, 
  nombre_sala:string,
  hora_inicio:string,
  hora_fin:string,
  nombre_edificio:string,
  asistencia:string,
}

export default function MisReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : Platform.OS === "web"
    ? "http://127.0.0.1:5000"
    : "http://localhost:5000";


  const cargarReservas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reservas/detalladas`);
      const data = await response.json();

      if (!response.ok) {
        setError("No se pudieron cargar las reservas.");
        setLoading(false);
        return;
      }

      setReservas(data);
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);


  const cancelarReserva = async (id_reserva: number) => {

  // Web usa window.confirm
  if (Platform.OS === "web") {
    const confirmar = window.confirm("¿Estás seguro de que querés cancelar esta reserva?");

    if (!confirmar) return;

    try {
      console.log("Cancelando...");
      const response = await fetch(`${BASE_URL}/reservas/${id_reserva}/cancelar`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.mensaje || "No se pudo cancelar.");
        return;
      }

      alert("Reserva cancelada.");
      cargarReservas();
    } catch (err) {
      alert("Error de conexión con el servidor.");
    }

    return;
  }

  //  Android/iOS mantiene Alert.alert
  Alert.alert(
    "Cancelar reserva",
    "¿Estás seguro de que querés cancelar esta reserva?",
    [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Cancelando...");
            const response = await fetch(
              `${BASE_URL}/reservas/${id_reserva}/cancelar`,
              { method: "PUT" }
            );

            const data = await response.json();

            if (!response.ok) {
              Alert.alert("Error", data.mensaje || "No se pudo cancelar.");
              return;
            }

            Alert.alert("Reserva cancelada", data.mensaje);
            cargarReservas();
          } catch (err) {
            Alert.alert("Error", "No se pudo conectar al servidor.");
          }
        },
      },
    ]
  );
};

  async function marcarAsistencia(id_reserva: number) {
    const ci = await AsyncStorage.getItem("user_ci");

    const response = await fetch(
      `${BASE_URL}/reservas/${id_reserva}/participantes/${ci}/asistencia`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asistencia: true }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Error", data.mensaje || "No se pudo registrar la asistencia.");
      return;
    }

    Alert.alert("Asistencia registrada");
    cargarReservas();
  }

  function estadoAsistencia(r: Reserva) {
    const ahora = new Date();
    const inicio = new Date(`${r.fecha}T${r.hora_inicio}`);
    const fin = new Date(`${r.fecha}T${r.hora_fin}`);

    if (r.asistencia === "1") return "asistio";
    if (r.asistencia === "0") return "no_asistio";

    if (ahora < inicio) return "antes";
    if (ahora >= inicio && ahora <= fin) return "en_curso";

    return "cerrado";
  }


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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reservas</Text>

      {reservas.length === 0 && (
        <Text style={styles.noReservas}>No hay reservas existentes</Text>
      )}

      {reservas.map((r) => (
        <View key={r.id_reserva} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardSala}>{r.nombre_sala}</Text>
            <Text style={[styles.estado, estilosEstado(r.estado)]}>
              {r.estado.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.info}>📅 {r.fecha}</Text>
          <Text style={styles.info}>⏰ {r.hora_inicio} - {r.hora_fin}</Text>
          <Text style={styles.info}>🏢 {r.nombre_edificio}</Text>

          <Text style={styles.participante}>
            {r.asistencia === null
              ? "Asistencia: sin registrar"
              : r.asistencia
              ? "Asistencia: PRESENTE"
              : "Asistencia: AUSENTE"}
          </Text>

          <>
          {(() => {
            const estado = estadoAsistencia(r);

            if (estado === "antes") {
              return (
                <Text style={{ marginTop: 10, color: "gray" }}>
                  La asistencia se habilita al inicio del turno
                </Text>
              );
            }

            if (estado === "en_curso") {
              return (
                <TouchableOpacity
                  style={{
                    backgroundColor: "green",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 10
                  }}
                  onPress={() => marcarAsistencia(r.id_reserva)}
                >
                  <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                    Marcar asistencia
                  </Text>
                </TouchableOpacity>
              );
            }

            if (estado === "cerrado") {
              return (
                <Text style={{ marginTop: 10, color: "gray" }}>
                  Ya pasó la hora de completar tu asistencia
                </Text>
              );
            }
          })()}
        </>


          {r.estado === "activa" && (
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => cancelarReserva(r.id_reserva)}
            >
              <Text style={styles.btnText}>Cancelar reserva</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function estilosEstado(estado:string) {
  switch (estado) {
    case "activa":
      return { backgroundColor: "#2563eb" };
    case "cancelada":
      return { backgroundColor: "#dc2626" };
    case "finalizada":
      return { backgroundColor: "#16a34a" };
    case "sin asistencia":
      return { backgroundColor: "#ca8a04" };
    default:
      return { backgroundColor: "#6b7280" };
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1e3a8a"
  },
  noReservas: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16
  },
  card: {
    backgroundColor: "#f8fafc",
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3
  },
  cardSala: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  estado: {
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "bold"
  },
  info: {
    marginTop: 6,
    fontSize: 16
  },
  participante: {
    marginTop: 10,
    fontSize: 16,
    color: "#475569",
    fontStyle: "italic"
  },
  btnCancelar: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    marginTop: 15
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  error: {
    color: "red"
  }
});
