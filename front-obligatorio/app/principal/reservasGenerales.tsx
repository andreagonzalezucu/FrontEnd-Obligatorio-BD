import { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, StyleSheet, 
  ActivityIndicator, TouchableOpacity, Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type Participante = {
  nombre: string;
  apellido: string;
  asistencia: number;
  ci: string;
  fecha_solicitud_reserva: string;
};

type Sala = {
  direccion: string;
  edificio: string;
  nombre_sala: string;
  tipo_sala: string;
};

type Turno = {
  hora_inicio: string;
  hora_fin: string;
};

type ReservaGeneral = {
  id_reserva: number;
  estado: string;
  fecha: string;
  sala: Sala;                 
  turno: Turno;               
  participantes: Participante[]; 
};


export default function MisReservas() {
  const [reservas, setReservas] = useState<ReservaGeneral[]>([]);
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


  async function confirmarYEnviar({
    mensaje,
    url,
    metodo,
    onSuccess
  }: {
    mensaje: string;
    url: string;
    metodo: string;
    onSuccess: () => void;
  }) {

    // CONFIRMACIÓN EN WEB
    if (Platform.OS === "web") {
      const ok = window.confirm(mensaje);
      if (!ok) return;

      try {
        const response = await fetch(url, { method: metodo });
        const data = await response.json();

        if (!response.ok) {
          alert(data.mensaje || "Error en la operación.");
          return;
        }

        alert(data.mensaje || "Operación exitosa.");
        onSuccess();

      } catch (error) {
        alert("Error de conexión al servidor.");
      }

      return;
    }

    // CONFIRMACIÓN EN MOBILE
    return Alert.alert(
      "Confirmar acción",
      mensaje,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(url, { method: metodo });
              const data = await response.json();

              if (!response.ok) {
                Alert.alert("Error", data.mensaje || "Error en la operación.");
                return;
              }

              Alert.alert("Éxito", data.mensaje || "Operación exitosa.");
              onSuccess();

            } catch (error) {
              Alert.alert("Error", "No se pudo conectar al servidor.");
            }
          }
        }
      ]
    );
  }

  const cancelarReserva = async (id_reserva: number) => {
    confirmarYEnviar({
      mensaje: "¿Estás seguro de que querés cancelar esta reserva?",
      url: `${BASE_URL}/reservas/${id_reserva}/cancelar`,
      metodo: "PUT",
      onSuccess: cargarReservas
    });
  };

  const borrarReserva = async (id_reserva: number) => {
    confirmarYEnviar({
      mensaje: "¿Estás seguro de que querés borrar esta reserva?",
      url: `${BASE_URL}/reservas/${id_reserva}`,
      metodo: "DELETE",
      onSuccess: cargarReservas
    });
  };


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
      <Text style={styles.title}>Reservas del sistema</Text>

      {reservas.length === 0 && (
        <Text style={styles.noReservas}>No hay reservas existentes</Text>
      )}

      {reservas.map((r) => (
  <View key={r.id_reserva} style={styles.card}>

    {/* CABECERA */}
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.salaTitulo}>{r.sala.nombre_sala}</Text>
        <Text style={styles.salaEdificio}>{r.sala.edificio}</Text>
      </View>

      <Text style={[styles.estadoBadge, estilosEstado(r.estado)]}>
        {r.estado.toUpperCase()}
      </Text>
    </View>

    {/* INFORMACIÓN PRINCIPAL */}
    <View style={styles.infoBox}>
      <Text style={styles.infoLinea}>📅 {r.fecha}</Text>
      <Text style={styles.infoLinea}>⏰ {r.turno.hora_inicio} - {r.turno.hora_fin}</Text>
      <Text style={styles.infoLinea}>🏷 Tipo: {r.sala.tipo_sala}</Text>
    </View>

    {/* PARTICIPANTES */}
    <View style={styles.participantesBox}>
      <Text style={styles.participantesTitulo}>👥 Participantes</Text>

      {r.participantes.map((p) => (
        <View key={p.ci} style={styles.participanteItem}>
          <Text style={styles.participanteNombre}>{p.nombre} {p.apellido}</Text>
          <Text style={styles.participanteDato}>CI: {p.ci}</Text>
          <Text style={styles.participanteDato}>Solicitud: {p.fecha_solicitud_reserva}</Text>
          <Text style={styles.participanteAsistencia}>
            Asistencia:{" "}
            <Text style={{ color: p.asistencia ? "#16a34a" : "#dc2626" }}>
              {p.asistencia ? "PRESENTE" : "AUSENTE"}
            </Text>
          </Text>
        </View>
      ))}
    </View>

    {/* BOTONES: Eliminar / CANCELAR */}
      <TouchableOpacity
          style={styles.btnEliminar}
          onPress={() => borrarReserva(r.id_reserva)}
        >
          <Text style={styles.btnCancelarText}>Eliminar reserva</Text>
        </TouchableOpacity>
        
      {r.estado === "activa" && (
        <TouchableOpacity
          style={styles.btnCancelar}
          onPress={() => cancelarReserva(r.id_reserva)}
        >
          <Text style={styles.btnCancelarText}>Cancelar reserva</Text>
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
  btnText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  error: {
    color: "red"
  },
  card: {
    backgroundColor: "white",
    marginBottom: 20,
    padding: 18,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  salaTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  salaEdificio: {
    color: "#475569",
    fontSize: 16,
  },

  estadoBadge: {
    color: "white",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontWeight: "bold",
    fontSize: 13,
  },

  infoBox: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 15,
  },

  infoLinea: {
    fontSize: 16,
    marginBottom: 4,
    color: "#334155",
  },

  participantesBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 15,
  },

  participantesTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },

  participanteItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  participanteNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },

  participanteDato: {
    fontSize: 14,
    color: "#475569",
  },

  participanteAsistencia: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
  },

  actionsContainer: {
    marginTop: 10,
  },

  asistenciaAviso: {
    color: "gray",
    marginBottom: 12,
    textAlign: "center",
  },

  btnAsistencia: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  btnAsistenciaText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },

  btnCancelar: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 10,
  },

  btnCancelarText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  btnEliminar: {
    backgroundColor: "#3b0d0dff",
    padding: 12,
    borderRadius: 10,
  },

});
