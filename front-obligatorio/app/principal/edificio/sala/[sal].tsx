import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Switch } from "react-native";
import ModalConfirmarReserva from "@/components/ModalConfirmarReserva";

const API = "http://localhost:5000"; 
type Sala={
    nombre_sala: string,
    id_sala: number,
    id_edificio:number,
    capacidad:number,
    tipo_sala:string
}

type ReservaExitosa = {
  sala: string;
  horario: string[];
  fecha: string;
  participantes: string[];
};


export default function SalaDetalle() {
  const { sal } = useLocalSearchParams(); // id_sala
  const router = useRouter();
  const idSalaNumber = Number(sal);

  const [salaInfo, setSalaInfo] = useState<Sala | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [dia, setDia] = useState<string>("");
  const [ocupados, setOcupados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [participantesPermitidos, setParticipantesPermitidos] = useState<any[]>([]);

  const [loadingReserva, setLoadingReserva] = useState(false);
  const [incluirme, setIncluirme] = useState(true);
  const [miCI, setMiCI] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [turnosSeleccionados, setTurnosSeleccionados] = useState<number[]>([]);

  const [ciInput, setCiInput] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [successData, setSuccessData] = useState<ReservaExitosa | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  
  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD


  // ----- Cargar CI del usuario y agregarlo por defecto -----
  useEffect(() => {
    const loadCI = async () => {
      const ci = await AsyncStorage.getItem("user_ci");
      setMiCI(ci);

      if (ci) {
        setParticipantes([ci]); // incluirme por defecto
      }
    };
    loadCI();
  }, []);

  // ========= 1. Obtener datos de la sala =========
  const fetchSala = async () => {
    try{
      const response = await fetch(`${API}/salas/${idSalaNumber}`)
      const dataSala: Sala = await response.json()

      if (!response.ok) {
        setError("No se pudo cargar info de la sala");
        return;
      }

      setSalaInfo(dataSala)
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  // ========= 2. Obtener turnos =========
  const fetchTurnos = async () => {
    const response = await fetch(`${API}/turnos`);
    const dataTurnos = await response.json();
    setTurnos(dataTurnos);
  };

  // ========= 3. Obtener reservas ocupadas para esa fecha =========
  const fetchOcupados = async (fecha: string) => {
    if (!fecha) return;

    try {
      const response = await fetch(
        `${API}/reservas/detalladas?fecha_desde=${fecha}&fecha_hasta=${fecha}`
      );
      const data = await response.json();

      // Filtrar solo las de esta sala y activas
      const ocupadasIds = data
        .filter((r: any) => r.sala?.id_sala === idSalaNumber && r.estado === "activa")
        .map((r: any) => r.id_turno);

      setOcupados(ocupadasIds);
    } catch (error) {
      console.error("Error al cargar reservas ocupadas:", error);
      setOcupados([]);
    }
  };

  // ======== actualizar ocupados cada vez que cambia fecha o sala ========
  useEffect(() => {
    if (salaInfo && dia) {
      fetchOcupados(dia);
    }
  }, [salaInfo, dia]);


  
  // ========= 4. Obtener los participantes compatibles con el usuario para invitar a la sala =========
  const fetchParticipantesPermitidos = async () => {
    try {
      const res = await fetch(
        `${API}/participantes-permitidos?id_sala=${idSalaNumber}`
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

  // ====== Turnos seleccionados (máximo 2) ======
  const toggleTurno = (id_turno: number) => {
    setTurnosSeleccionados((prev) => {
      if (prev.includes(id_turno)) {
        return prev.filter((t) => t !== id_turno);
      } else {
        if (prev.length >= 2) {
          Alert.alert("Máximo 2 turnos", "Solo puedes seleccionar hasta 2 bloques de horario.");
          return prev;
        }
        return [...prev, id_turno];
      }
    });
  };
  
  const eliminarParticipante = (ci: string) => {
    setParticipantes((prev) => prev.filter((p) => p !== ci));
  };

  // ========= 4. Crear reserva =========
  const crearReserva = async () => {
    if (turnosSeleccionados.length === 0) {
      Alert.alert("Error", "Debes seleccionar al menos un horario.");
      return;
    }

    setModalVisible(true);
    setLoadingReserva(true);
    setSuccessData(null);
    setErrorModal(null);

    const participantesFinales =
      incluirme && miCI
        ? Array.from(new Set([miCI, ...participantes]))
        : participantes.filter((p) => p !== miCI);


    try {
      const ci = await AsyncStorage.getItem("user_ci");
      const resultados: ReservaExitosa[] = [];

      for (const turno of turnosSeleccionados) {
        const response = await fetch(`${API}/reservas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_sala: idSalaNumber,
            fecha: dia,
            id_turno: turno,
            estado: "activa",
            participantes: participantesFinales,
            ci_creador: ci,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const horariosSeleccionados: string[] = [];

          for (const turno of turnosSeleccionados) {
            const turnoInfo = turnos.find((t) => t.id_turno === turno);
            const horario = turnoInfo
              ? `${turnoInfo.hora_inicio.slice(0, 5)} - ${turnoInfo.hora_fin.slice(0, 5)}`
              : "—";

            horariosSeleccionados.push(horario);
          resultados.push({
            sala: salaInfo?.nombre_sala || "—",
            fecha: dia,
            horario: horariosSeleccionados,
            participantes: participantesFinales,
          });
        }
        } else {
          setErrorModal((prev) => (prev ? prev + "\n" : "") + (data.mensaje || "Error en reserva"));
        }
      }

      setSuccessData(resultados.length > 0 ? resultados[0] : null);
    } catch (err) {
      setErrorModal("Error de conexión con el servidor");
    } finally {
      setLoadingReserva(false);
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
            onDayPress={(day) => setDia(day.dateString)}
            markedDates={{
              [dia]: { selected: true, selectedColor: "#1e3a8a", selectedTextColor: "#fff" },
            }}
            minDate={hoy}
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
      {turnos.map((t) => {
        const ocupado = ocupados.includes(t.id_turno);
        const seleccionado = turnosSeleccionados.includes(t.id_turno);

        return (
          <TouchableOpacity
            key={t.id_turno}
            style={[
              styles.turno,
              ocupado && styles.turnoOcupado,
              seleccionado && styles.turnoSeleccionado,
            ]}
            disabled={ocupado}
            onPress={() => toggleTurno(t.id_turno)}
          >
            <Text style={styles.turnoText}>
              {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
            </Text>
            {ocupado && <Text style={styles.turnoLabel}>OCUPADO</Text>}
          </TouchableOpacity>
        );
      })}



      {/* ===== SWITCH INCLUIRME ===== */}
      <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginRight: 10 }}>
          ¿Querés incluirte en esta reserva?
        </Text>

        <Switch
          value={incluirme}
          onValueChange={(v) => {
            setIncluirme(v);
            if (v && miCI && !participantes.includes(miCI)) {
              setParticipantes((prev) => [miCI, ...prev]);
            } else if (!v && miCI) {
              setParticipantes((prev) => prev.filter((p) => p !== miCI));
            }
          }}
        />
      </View>

      {/* PARTICIPANTES */}

      <Text style={styles.section}>Seleccionar participantes</Text>

      {participantesPermitidos.map((p) => (
        <TouchableOpacity
          key={p.ci}
          style={styles.participantePermitido}
          onPress={() =>
            setParticipantes((prev) =>
              prev.includes(p.ci) ? prev : [...prev, p.ci]
            )
          }
        >
          <Text>{p.nombre} {p.apellido} ({p.ci})</Text>
        </TouchableOpacity>
      ))}

      {/*Lista de seleccionados */}
      <Text style={styles.section}>Seleccionados</Text>
      {participantes.map((ci) => (
        <View key={ci} style={styles.participanteSeleccionado}>
          <Text>
            {ci} {miCI === ci ? "(vos)" : ""}
          </Text>

          {miCI !== ci && (
            <TouchableOpacity
              onPress={() =>
                eliminarParticipante(ci)
              }
            >
              <Text style={{ color: "red" }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}


      {/* ===== CONFIRMAR ===== */}
      {loadingReserva ? (
        <ActivityIndicator size="large" color="#1e3a8a" />
      ) : (
        <TouchableOpacity onPress={crearReserva} style={{ marginTop: 20 }}>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}
          >
            Confirmar Reserva
          </Text>
        </TouchableOpacity>
      )}


      <ModalConfirmarReserva
        visible={modalVisible}
        loading={loadingReserva}
        successData={successData}
        errorMessage={errorModal}
        onClose={() => {
          setModalVisible(false);
          if (successData) router.back();
        }}
      />



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
  participantePermitido: {
  backgroundColor: "#d9e6ff",
  padding: 10,
  borderRadius: 10,
  marginVertical: 4
  },
  participanteSeleccionado: {
    backgroundColor: "#caffca",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
});
