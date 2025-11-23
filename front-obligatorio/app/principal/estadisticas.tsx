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
  sancionesGenerales: any[];
  sancionesActivas: any[];
  participantesCanceladores: any[];
  salasSinReservas: any[];
  programasEdificios: any[];
  porcentajeTiposReserva: any[];
};

export default function Estadisticas() {
  const BASE_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:5000"
      : "http://127.0.0.1:5000";

  
  const hoyDate = new Date();
  const yyyy = hoyDate.getFullYear();
  const mm = String(hoyDate.getMonth() + 1).padStart(2, "0");
  const dd = String(hoyDate.getDate()).padStart(2, "0");
  const hoy = `${yyyy}-${mm}-${dd}`;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Estadisticas>({
    salas: [],
    turnos: [],
    promedio: [],
    carrera: [],
    edificio: [],
    actividad: [],
    sanciones: [],
    sancionesGenerales: [],
    sancionesActivas:[],
    participantesCanceladores: [],
    salasSinReservas: [],
    programasEdificios: [],
    porcentajeTiposReserva: [],
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
        sancionesGenerales: "/sanciones",
        sancionesActivas: "/sanciones/activas",
        participantesCanceladores: "/reservas/reportes/participantes-canceladores",
        salasSinReservas: "/reservas/reportes/salas-sin-reservas",
        programasEdificios: "/reservas/reportes/programas-edificios",
        porcentajeTiposReserva: "/reservas/reportes/porcentaje-reservas",
      };

      const results: Estadisticas = {
        salas: [],
        turnos: [],
        promedio: [],
        carrera: [],
        edificio: [],
        actividad: [],
        sanciones: [],
        sancionesGenerales:[],
        sancionesActivas:[],
        participantesCanceladores:[],
        salasSinReservas: [],
        programasEdificios: [],
        porcentajeTiposReserva: [],
        };

      for (const key of Object.keys(endpoints) as (keyof Estadisticas)[]) {
        const res = await fetch(`${BASE_URL}${endpoints[key]}`);
        results[key] = await res.json();  // sin errores
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

      {/* Porcentaje por tipo de reservas */}
      {/* Porcentaje por tipo de reservas */}
      <Accordion title="Tipos de reserva - Actividad">
        {stats.porcentajeTiposReserva.length > 0 ? (
          (() => {
            const p = stats.porcentajeTiposReserva[0];
            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Porcentaje de reservas efectivamente utilizadas</Text>
                <Text style={styles.cardSubtitle}>{Number(p.porcentaje_utilizadas).toFixed(2)} %</Text>

                <Text style={[styles.cardTitle, { marginTop: 10 }]}>Porcentaje de reservas canceladas / no asistidas</Text>
                <Text style={styles.cardSubtitle}>{Number(p.porcentaje_canceladas).toFixed(2)} %</Text>
              </View>
            );
          })()
        ) : (
          <Text style={styles.item}>No hay datos disponibles.</Text>
        )}
      </Accordion>

      
      {/* Salas más reservadas */}
      <Accordion title="Salas más reservadas">
        {stats.salas.map((s, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{s.nombre_sala}</Text>
            <Text style={styles.cardSubtitle}>{s.total_reservas} reservas</Text>
          </View>
        ))}
      </Accordion>

      {/* Salas sin reservas */}
      <Accordion title="Salas sin reservas">
        {stats.salasSinReservas.map((s, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{s.nombre_sala}</Text>
            <Text style={styles.cardSubtitle}>{s.nombre_edificio}</Text>
          </View>
        ))}
      </Accordion>


      {/* Turnos */}
      <Accordion title="Turnos más demandados">
        {stats.turnos.map((t, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{t.hora_inicio} - {t.hora_fin}</Text>
            <Text style={styles.cardSubtitle}>{t.total_reservas} reservas</Text>
          </View>
        ))}
      </Accordion>


      {/* Promedio participantes */}
      <Accordion title="Promedio de participantes por sala">
        {stats.promedio.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{p.nombre_sala}</Text>
            <Text style={styles.cardSubtitle}>
              Promedio: {parseFloat(p.promedio_participantes)?.toFixed(1)}
            </Text>
          </View>
        ))}
      </Accordion>


      {/* Reservas por carrera */}
      <Accordion title="Reservas por carrera">
        {stats.carrera.map((c, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{c.facultad}</Text>
            <Text style={styles.cardSubtitle}>{c.programa}</Text>
            <Text style={styles.cardDetail}>{c.cantidad_reservas} reservas</Text>
          </View>
        ))}
      </Accordion>


      {/* Ocupación */}
      <Accordion title="Ocupación por edificio">
        {stats.edificio.map((e, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{e.nombre_edificio}</Text>
            <Text style={styles.cardSubtitle}>{e.porcentaje_ocupacion}% ocupación</Text>
          </View>
        ))}
      </Accordion>

      {/* Reservas por carrera */}
      <Accordion title="Programas que más usan los edificios">
        {stats.programasEdificios.map((c, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>Nombre del programa: {c.nombre_programa}</Text>
            <Text style={styles.cardSubtitle}>Edificios usados: {c.edificios_usados}</Text>
          </View>
        ))}
      </Accordion>


      {/* Actividad personas */}
      <Accordion title="Actividad por tipo de participante">
        {stats.actividad.map((a, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{a.rol} ({a.programa_tipo})</Text>

            <Text style={styles.cardDetail}>
              Reservas: {a.total_reservas}
            </Text>
            <Text style={styles.cardDetail}>
              Asistencias: {a.asistencias}
            </Text>
          </View>
        ))}
      </Accordion>


      {/* Sanciones */}
      <Accordion title="Sanciones por tipo">
        {stats.sanciones.map((s, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{s.rol}</Text>
            <Text style={styles.cardSubtitle}>Tipo: {s.tipo}</Text>
            <Text style={styles.cardDetail}>{s.sanciones} sanciones</Text>
          </View>
        ))}
      </Accordion>


      <Accordion title="Sanciones activas">
        {stats.sancionesActivas.length === 0 ? (
          <Text style={styles.item}>No hay sanciones activas.</Text>
        ) : (
          stats.sancionesActivas.map((s, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{s.nombre} {s.apellido}</Text>
              <Text style={styles.cardSubtitle}>CI: {s.ci_participante}</Text>

              <Text style={styles.cardDetail}>Inicio: {s.fecha_inicio}</Text>
              <Text style={styles.cardDetail}>Fin: {s.fecha_fin}</Text>
            </View>
          ))
        )}
      </Accordion>


      <Accordion title="Historial de sanciones">
      {stats.sancionesGenerales.map((s, i) => {
      const activa = hoy < s.fecha_fin;

      return (
          <View key={i} style={styles.sancionCard}>
            <Text style={styles.sancionNombre}>
              {s.nombre} {s.apellido}
            </Text>

            <Text style={styles.sancionCI}>CI: {s.ci_participante}</Text>

            <Text style={styles.sancionDetalle}>Desde: {s.fecha_inicio}</Text>
            <Text style={styles.sancionDetalle}>Hasta: {s.fecha_fin}</Text>

            <View style={[styles.badge, activa ? styles.badgeActiva : styles.badgeInactiva]}>
              <Text style={styles.badgeText}>
                {activa ? "SANCIÓN ACTIVA" : "SANCIÓN NO ACTIVA"}
              </Text>
            </View>
          </View>
        );
      })}
      </Accordion>

      <Accordion title="Personas que más cancelan">
        {stats.participantesCanceladores.length === 0 ? (
          <Text style={styles.item}>No hay participantes con cantidad de cancelaciones excedentes.</Text>
        ) : (
          stats.participantesCanceladores.map((s, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardSubtitle}>CI: {s.ci_participante}</Text>
              <Text style={styles.cardSubtitle}>Reservas totales: {s.reservas_totales}</Text>
              <Text style={styles.cardSubtitle}>Reservas no efectivas: {s.no_efectivas}</Text>
              <Text style={styles.cardSubtitle}>Porcentaje de cancelación: {s.porcentaje_cancelacion}</Text>
            </View>
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

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,

    // sombras
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
  },

  cardDetail: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 2,
  },

  sancionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,

    // Sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,

    // Sombra Android
    elevation: 3,
  },

    sancionNombre: {
      fontSize: 17,
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: 4,
    },

    sancionCI: {
      fontSize: 14,
      color: "#475569",
      marginBottom: 8,
    },

    sancionDetalle: {
      fontSize: 14,
      color: "#334155",
      marginBottom: 2,
    },

    badge: {
      marginTop: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      alignSelf: "flex-start",
    },

    badgeActiva: {
      backgroundColor: "#dc262620", // rojo suave
      borderWidth: 1,
      borderColor: "#dc2626",
    },

    badgeInactiva: {
      backgroundColor: "#16a34a20", // verde suave
      borderWidth: 1,
      borderColor: "#16a34a",
    },

    badgeText: {
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      color: "#000",
    },

});

