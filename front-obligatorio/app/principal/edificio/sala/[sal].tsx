import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const API = "http://127.0.0.1:5000"; 
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
  const [día, setDía] = useState<string>(new Date().toISOString().split("T")[0]); // yyyy-mm-dd
  const [ocupados, setOcupados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [turnEle, setTurnEle] = useState(0);

  const [ciInput, setCiInput] = useState("");
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [loadingReserva, setLoadingReserva] = useState(false);

  const idSalaNumber = Number(sal);

  // ========= 1. Obtener datos de la sala =========
  const fetchSala = async () => {
    try{
      const response = await fetch(`${API}//edificios/${idSalaNumber}`)
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
      `${API}/reservas/detalladas?fecha_desde=${día}&fecha_hasta=${día}`
    );
    const data = await response.json();

    // Filtrar solo las de esta sala
    const ocupadas = data
      .filter((r: any) => r.sala?.nombre_sala === salaInfo?.nombre_sala)
      .map((r: any) => r.turno.hora_inicio); // luego comparo por hora

    setOcupados(ocupadas);
  };

  useEffect(() => {
    const load = async () => {
      await fetchSala();
      await fetchTurnos();
      setLoading(false);
    };
    load();
  }, []);

  // Cargar turnos ocupados cuando cambia la fecha y ya tenemos salaInfo
  useEffect(() => {
    if (salaInfo) {
      fetchOcupados();
    }
  }, [salaInfo, día]);

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
    setLoadingReserva(true);
    if(turnEle!==0){
      try {
        const response = await fetch(`${API}/reservas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_sala: idSalaNumber,
            fecha: día,
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

    if (loading || !salaInfo) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      );
    }
    
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
      <Text style={styles.section}>Fecha</Text>
      <TextInput
        style={styles.input}
        value={día}
        onChangeText={setDía}
        placeholder="YYYY-MM-DD"
      />

      {/* LISTA DE TURNOS */}
      <Text style={styles.section}>Horarios disponibles</Text>

      {turnos.map((t) => {
        const ocupado = ocupados.includes(t.hora_inicio);

        return (
          <TouchableOpacity
            key={t.id_turno}
            style={[styles.turno, ocupado && styles.turnoOcupado]}
            disabled={ocupado}
            onPress={() => guardarTurno(t.id_turno)}
          >
            <Text style={styles.turnoText}>
              {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
            </Text>
            {ocupado && <Text style={styles.turnoLabel}>OCUPADO</Text>}
          </TouchableOpacity>
        );
      })}

      {/* PARTICIPANTES */}
      <Text style={styles.section}>Participantes (CIs)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="CI participante"
          value={ciInput}
          onChangeText={setCiInput}
        />
        <TouchableOpacity style={styles.btnAdd} onPress={agregarParticipante}>
          <Text style={{ color: "#fff" }}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {participantes.map((p) => (
        <View key={p} style={styles.participante}>
          <Text>{p}</Text>
          <TouchableOpacity onPress={() => eliminarParticipante(p)}>
            <Text style={{ color: "red" }}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      {loadingReserva && <ActivityIndicator size="large" color="#1e3a8a" />}

      <TouchableOpacity onPress={()=>crearReserva()}>
        <Text>Confirmar Reserva</Text>
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
});
