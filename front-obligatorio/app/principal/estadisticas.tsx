import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import Accordion from "@/components/Accordion";
import { Platform } from "react-native";

type Estadisticas = {
  salas: any[];
  turnos: any[];
  promedio: any[];
  carrera: any[];
  edificio: any[];
  actividad: any[];
  sanciones: any[];
  sancionesActivas: any[];
};

export default function Estadisticas() {
  const BASE_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:5000"
      : "http://127.0.0.1:5000";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Estadisticas>({
    salas: [],
    turnos: [],
    promedio: [],
    carrera: [],
    edificio: [],
    actividad: [],
    sanciones: [],
    sancionesActivas:[]
    });

  const fetchAllStats = async () => {
    try {
      const endpoints: Record<keyof Estadisticas, string>  = {
        salas: "/reservas/reportes/salas-mas-reservadas",
        turnos: "/reservas/reportes/turnos-mas-demandados",
        promedio: "/reservas/reportes/promedio-participantes-sala",
        carrera: "/reservas/reportes/reservas-por-carrera",
        edificio: "/reservas/reportes/ocupacion-edificio",
        actividad: "/reservas/reportes/actividad-personas",
        sanciones: "/reservas/reportes/sanciones",
        sancionesActivas: "/sanciones/activas"
      };

      const results: Estadisticas = {
        salas: [],
        turnos: [],
        promedio: [],
        carrera: [],
        edificio: [],
        actividad: [],
        sanciones: [],
        sancionesActivas:[],
        };

      for (const key of Object.keys(endpoints) as (keyof Estadisticas)[]) {
        const res = await fetch(`${BASE_URL}${endpoints[key]}`);
        results[key] = await res.json();  // ✔ sin errores
      }

    setStats(results);
    } catch (err) {
      console.log("Error cargando estadísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10 }}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>

      {/* Salas más reservadas */}
      <Accordion title="Salas más reservadas">
        {stats.salas.map((s, i) => (
          <Text key={i} style={styles.item}>
            {s.nombre_sala}: {s.total_reservas} reservas
          </Text>
        ))}
      </Accordion>

      {/* Turnos */}
      <Accordion title="Turnos más demandados">
        {stats.turnos.map((t, i) => (
          <Text key={i} style={styles.item}>
            {t.hora_inicio} - {t.hora_fin}: {t.total_reservas} reservas
          </Text>
        ))}
      </Accordion>

      {/* Promedio participantes */}
      <Accordion title="Promedio de participantes por sala">
        {stats.promedio.map((p, i) => (
          <Text key={i} style={styles.item}>
            {p.nombre_sala}: {parseFloat(p.promedio_participantes)?.toFixed(1) ?? "0.0"} participantes
          </Text>
        ))}
      </Accordion>

      {/* Reservas por carrera */}
      <Accordion title="Reservas por carrera">
        {stats.carrera.map((c, i) => (
          <Text key={i} style={styles.item}>
            {c.facultad} - {c.programa}: {c.cantidad_reservas}
          </Text>
        ))}
      </Accordion>

      {/* Ocupación */}
      <Accordion title="Ocupación por edificio">
        {stats.edificio.map((e, i) => (
          <Text key={i} style={styles.item}>
            {e.nombre_edificio}: {e.porcentaje_ocupacion}% ocupación
          </Text>
        ))}
      </Accordion>

      {/* Actividad personas */}
      <Accordion title="Actividad por tipo de participante">
        {stats.actividad.map((a, i) => (
          <Text key={i} style={styles.item}>
            {a.rol} ({a.programa_tipo}): {a.total_reservas} reservas, {a.asistencias} asistencias
          </Text>
        ))}
      </Accordion>

      {/* Sanciones */}
      <Accordion title="Sanciones por tipo">
        {stats.sanciones.map((s, i) => (
          <Text key={i} style={styles.item}>
            {s.rol} ({s.tipo}): {s.sanciones} sanciones
          </Text>
        ))}
      </Accordion>

      <Accordion title="Sanciones activas">
        {stats.sancionesActivas.length === 0 ? (
            <Text style={styles.item}>No hay sanciones activas.</Text>
        ) : (
            stats.sancionesActivas.map((s, i) => (
            <Text key={i} style={styles.item}>
                {s.nombre} {s.apellido} — CI: {s.ci_participante}{"\n"}
                Desde: {s.fecha_inicio}{"\n"}
                Hasta: {s.fecha_fin}
            </Text>
            ))
        )}
       </Accordion>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8fafc", // Fondo suave
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 25,
    textAlign: "center",
    color: "#1e3a8a",
    letterSpacing: 0.5,
  },

  item: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 6,

    backgroundColor: "white",
    borderRadius: 10,

    // Sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,

    // Sombra Android
    elevation: 3,

    color: "#334155",
    lineHeight: 22,
  },
});

