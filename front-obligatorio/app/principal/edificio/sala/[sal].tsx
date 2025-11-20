import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";


const API = "http://localhost:5000"; 
type Sala={
    nombre_sala: string,
    id_sala: number,
    id_edificio:number,
    capacidad:number,
    tipo_sala:string
}

export default function SalaDetalle() {
  const { sal } = useLocalSearchParams(); // id_sala
  const router = useRouter();

  const [salaInfo, setSalaInfo] = useState<Sala | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [dia, setDia] = useState<string>("");
  const [ocupados, setOcupados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [turnEle, setTurnEle] = useState(0);

  const [ciInput, setCiInput] = useState("");
  const [participantes, setParticipantes] = useState<string[]>([]);

  const [loadingReserva, setLoadingReserva] = useState(false);

  const idSalaNumber = Number(sal);
  const [participantesPermitidos, setParticipantesPermitidos] = useState<any[]>([]);


  // ========= 1. Obtener datos de la sala =========
  const fetchSala = async () => {
    try{
      const response = await fetch(`${API}/salas/${idSalaNumber}`)
      const data: Sala = await response.json()

      if (!response.ok) {
        setError("No se pudo cargar info de la sala");
        return;
      }

      setSalaInfo(data)
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  // ========= 2. Obtener turnos =========
  const fetchTurnos = async () => {
    const response = await fetch(`${API}/turnos`);
    const data = await response.json();
    setTurnos(data);
  };

  // ========= 3. Obtener reservas ocupadas para esa fecha =========
  const fetchOcupados = async () => {
    const response = await fetch(
      `${API}/reservas/detalladas?fecha_desde=${dia}&fecha_hasta=${dia}`
    );
    const data = await response.json();

    // Filtrar solo las de esta sala
    const ocupadas = data
      .filter((r: any) => r.sala?.nombre_sala === salaInfo?.nombre_sala)
      .map((r: any) => r.turno.hora_inicio); // luego comparo por hora

    setOcupados(ocupadas);
  };

  
  // ========= 4. Obtener los participantes compatibles con el usuario para invitar a la sala =========
  const fetchParticipantesPermitidos = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/participantes-permitidos?id_sala=${idSalaNumber}`
      );
      const data = await res.json();

      // Eliminar duplicados por CI
      const unicos = Array.from(
        new Map(data.map((p: { ci: any; }) => [p.ci, p])).values()
      );

      setParticipantesPermitidos(unicos);
    } catch (error) {
      console.error("Error cargando participantes permitidos", error);
    }
  };



  useEffect(() => {
    const load = async () => {
      await fetchSala();
      await fetchTurnos();
      if (participantesPermitidos.length === 0) {
        await fetchParticipantesPermitidos();
      }
      setLoading(false);
    };
    load();
  }, []);

  // Cargar turnos ocupados cuando cambia la fecha y ya tenemos salaInfo
  useEffect(() => {
    if (salaInfo) {
      fetchOcupados();
    }
  }, [salaInfo, dia]);

  // ========= AGREGAR PARTICIPANTES =========
  const agregarParticipante = () => {
    if (ciInput.trim() === "") return;
    setParticipantes((prev) => [...prev, ciInput.trim()]);
    setCiInput("");
  };

  const eliminarParticipante = (ci: string) => {
    setParticipantes((prev) => prev.filter((p) => p !== ci));
  };

  // ========= 4. Crear reserva =========
  const crearReserva = async () => {
    if (!turnEle) {
      Alert.alert("Error", "Debe seleccionar un horario");
      return;
    }

    setLoadingReserva(true);

    try {
      const response = await fetch(`${API}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sala: idSalaNumber,
          fecha: dia,
          id_turno: turnEle,
          estado: "activa",
          participantes
        })
      });

      const data = await response.json();
      setLoadingReserva(false);

      if (response.ok) {
        Alert.alert("Éxito", "Reserva creada correctamente");
        router.back();
      } else {
        Alert.alert("Error", data.mensaje || "No se pudo crear la reserva");
      }

    } catch (err) {
      setLoadingReserva(false);
      Alert.alert("Error", "Fallo de conexión con el servidor");
    }
};

// =========Loading==============
if (loading || !salaInfo) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1e3a8a" />
    </View>
  );
}


  const guardarTurno=(turn: number)=>{
    setTurnEle(turn);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{salaInfo?.nombre_sala}</Text>
      <Text style={styles.subtitle}>Edificio: {salaInfo?.nombre_sala}</Text>
      <Text style={styles.subtitle}>Capacidad: {salaInfo?.capacidad}</Text>
      <Text style={styles.subtitle}>Tipo: {salaInfo?.tipo_sala}</Text>

      {/* FECHA */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.section}>Seleccionar fecha</Text>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setDia(day.dateString); // YYYY-MM-DD
            }}
            markedDates={{
              [dia]: { selected: true, selectedColor: "#1e3a8a", selectedTextColor: "#fff", },
            }}
            theme={{
              todayTextColor: "#1e3a8a",
              arrowColor: "#1e3a8a",
            }}
          />
        </View>


        {dia !== "" && (
        <Text style={styles.selectedDate}>Fecha seleccionada: {dia}</Text>
      )}
      </View>


      {/* LISTA DE TURNOS */}
      <Text style={styles.section}>Horarios disponibles</Text>

      {turnos.map((t) => {
        const ocupado = ocupados.includes(t.hora_inicio);

        return (
          <TouchableOpacity
            key={t.id_turno}
            style={[
              styles.turno, 
              ocupado && styles.turnoOcupado,
              turnEle === t.id_turno && styles.turnoSeleccionado,
            ]}
            disabled={ocupado}
            onPress={() => 
              guardarTurno(t.id_turno)
            }
          >
            <Text style={styles.turnoText}>
              {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
            </Text>
            {ocupado && <Text style={styles.turnoLabel}>OCUPADO</Text>}
          </TouchableOpacity>
        );
      })}

      {/* PARTICIPANTES */}

      <Text style={styles.section}>Seleccionar participantes</Text>

      {participantesPermitidos.map((p) => (
        <TouchableOpacity
          key={p.ci}
          style={styles.participante}
          onPress={() =>
            setParticipantes((prev) =>
              prev.includes(p.ci) ? prev : [...prev, p.ci]
            )
          }
        >
          <Text>{p.nombre} {p.apellido} ({p.ci})</Text>
        </TouchableOpacity>
      ))}

      {participantes.map((ci) => (
      <View key={ci} style={styles.participante}>
        <Text>{ci}</Text>
        <TouchableOpacity onPress={() => eliminarParticipante(ci)}>
          <Text style={{ color: "red" }}>X</Text>
        </TouchableOpacity>
      </View>
    ))}

      {loadingReserva && <ActivityIndicator size="large" color="#1e3a8a" />}

      <TouchableOpacity onPress={crearReserva} style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
          Confirmar Reserva
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#1e3a8a" },
  subtitle: { fontSize: 16, marginBottom: 8 },
  section: { marginTop: 20, fontSize: 18, fontWeight: "bold" },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  turno: {
    backgroundColor: "#1e3a8a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  turnoOcupado: {
    backgroundColor: "#ccc",
  },
  turnoText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  turnoLabel: { color: "red", fontWeight: "bold" },
  row: { flexDirection: "row", alignItems: "center" },
  btnAdd: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  participante: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  turnoSeleccionado: {
    backgroundColor: "#5b848cff",
  },
    calendarContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  selectedDate: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },


});
