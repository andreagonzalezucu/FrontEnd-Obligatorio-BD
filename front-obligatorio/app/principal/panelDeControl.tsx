import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import Accordion from "@/components/Accordion";

type Edificio = {
  id_edificio: number;
  nombre_edificio: string;
  direccion: string;
  departamento: string;
};

type Sala = {
  id_sala: number;
  nombre_sala: string;
  capacidad: number;
  tipo_sala: string; 
  id_edificio: number;
  nombre_edificio: string;
};

export type Participante = {
  ci: string;
  nombre: string;
  apellido: string;
  email: string;
};


export default function Admin() {
  const BASE_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:5000"
      : "http://127.0.0.1:5000";

  const [loading, setLoading] = useState(true);
  const [edificios, setEdificios] = useState([]);
  const [salas, setSalas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Formularios
  const [nuevoEdificio, setNuevoEdificio] = useState({
    nombre: "",
    direccion: "",
    departamento: "",
  });

  const [nuevaSala, setNuevaSala] = useState({
    nombre: "",
    capacidad: "",
    tipo: "",
    edificio: "",
  });

  const [nuevoUsuario, setNuevoUsuario] = useState({
    ci: "",
    nombre: "",
    apellido: "",
    email: "",
  });

  const cargarTodo = async () => {
    try {
      const [e, s, u] = await Promise.all([
        fetch(`${BASE_URL}/edificios`).then(r => r.json()),
        fetch(`${BASE_URL}/salas`).then(r => r.json()),
        fetch(`${BASE_URL}/participantes`).then(r => r.json()),
      ]);

      setEdificios(e);
      setSalas(s);
      setUsuarios(u);

    } catch (err) {
      console.log("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const crearEdificio = async () => {
    if (!nuevoEdificio.nombre) return Alert.alert("Error", "El nombre es obligatorio");

    const res = await fetch(`${BASE_URL}/edificios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_edificio: nuevoEdificio.nombre,
        direccion: nuevoEdificio.direccion,
        departamento: nuevoEdificio.departamento,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Éxito", data.mensaje);
      setNuevoEdificio({ nombre: "", direccion: "", departamento: "" });
      cargarTodo();
    } else {
      Alert.alert("Error", data.mensaje);
    }
  };

  const eliminarEdificio = async (id:number) => {
    await fetch(`${BASE_URL}/edificios/${id}`, { method: "DELETE" });
    cargarTodo();
  };

  const crearSala = async () => {
    if (!nuevaSala.nombre || !nuevaSala.edificio)
      return Alert.alert("Error", "Faltan campos obligatorios");

    const res = await fetch(`${BASE_URL}/salas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_sala: nuevaSala.nombre,
        id_edificio: nuevaSala.edificio,
        capacidad: nuevaSala.capacidad,
        tipo_sala: nuevaSala.tipo,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Éxito", data.mensaje);
      setNuevaSala({ nombre: "", capacidad: "", tipo: "", edificio: "" });
      cargarTodo();
    } else {
      Alert.alert("Error", data.mensaje);
    }
  };

  const eliminarSala = async (id:number) => {
    await fetch(`${BASE_URL}/salas/${id}`, { method: "DELETE" });
    cargarTodo();
  };

  const crearUsuario = async () => {
    if (!nuevoUsuario.ci || !nuevoUsuario.nombre)
      return Alert.alert("Error", "Faltan campos obligatorios");

    const res = await fetch(`${BASE_URL}/participantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ci: nuevoUsuario.ci,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Éxito", data.mensaje);
      setNuevoUsuario({ ci: "", nombre: "", apellido: "", email: "" });
      cargarTodo();
    } else {
      Alert.alert("Error", data.mensaje);
    }
  };

  const eliminarUsuario = async (ci:string) => {
    await fetch(`${BASE_URL}/participantes/${ci}`, { method: "DELETE" });
    cargarTodo();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Panel de Administración</Text>

      <Accordion title="🏢 Administrar Edificios">
        <Text style={styles.subtitle}>Crear edificio</Text>

        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={nuevoEdificio.nombre}
          onChangeText={(t) => setNuevoEdificio({ ...nuevoEdificio, nombre: t })}
        />
        <TextInput
          placeholder="Dirección"
          style={styles.input}
          value={nuevoEdificio.direccion}
          onChangeText={(t) => setNuevoEdificio({ ...nuevoEdificio, direccion: t })}
        />
        <TextInput
          placeholder="Departamento"
          style={styles.input}
          value={nuevoEdificio.departamento}
          onChangeText={(t) => setNuevoEdificio({ ...nuevoEdificio, departamento: t })}
        />

        <TouchableOpacity style={styles.btn} onPress={crearEdificio}>
          <Text style={styles.btnText}>Crear Edificio</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Edificios existentes</Text>
        {edificios.map((e:Edificio) => (
          <View key={e.id_edificio} style={styles.row}>
            <Text>{e.nombre_edificio}</Text>
            <TouchableOpacity onPress={() => eliminarEdificio(e.id_edificio)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>

      <Accordion title="🏫 Administrar Salas">
        <Text style={styles.subtitle}>Crear sala</Text>

        <TextInput
          placeholder="Nombre sala"
          style={styles.input}
          value={nuevaSala.nombre}
          onChangeText={(t) => setNuevaSala({ ...nuevaSala, nombre: t })}
        />

        <TextInput
          placeholder="Capacidad"
          style={styles.input}
          keyboardType="numeric"
          value={nuevaSala.capacidad}
          onChangeText={(t) => setNuevaSala({ ...nuevaSala, capacidad: t })}
        />

        <TextInput
          placeholder="Tipo (docente, libre, posgrado)"
          style={styles.input}
          value={nuevaSala.tipo}
          onChangeText={(t) => setNuevaSala({ ...nuevaSala, tipo: t })}
        />

        <TextInput
          placeholder="ID edificio"
          style={styles.input}
          keyboardType="numeric"
          value={nuevaSala.edificio}
          onChangeText={(t) => setNuevaSala({ ...nuevaSala, edificio: t })}
        />

        <TouchableOpacity style={styles.btn} onPress={crearSala}>
          <Text style={styles.btnText}>Crear Sala</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Salas existentes</Text>
        {salas.map((s:Sala) => (
          <View key={s.id_sala} style={styles.row}>
            <Text>{s.nombre_sala} ({s.nombre_edificio})</Text>
            <TouchableOpacity onPress={() => eliminarSala(s.id_sala)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>

      <Accordion title="👤 Administrar Participantes">
        <Text style={styles.subtitle}>Crear usuario</Text>

        <TextInput
          placeholder="CI"
          style={styles.input}
          value={nuevoUsuario.ci}
          onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, ci: t })}
        />

        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={nuevoUsuario.nombre}
          onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, nombre: t })}
        />

        <TextInput
          placeholder="Apellido"
          style={styles.input}
          value={nuevoUsuario.apellido}
          onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, apellido: t })}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={nuevoUsuario.email}
          onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, email: t })}
        />

        <TouchableOpacity style={styles.btn} onPress={crearUsuario}>
          <Text style={styles.btnText}>Crear Usuario</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Usuarios existentes</Text>
        {usuarios.map((u:Participante) => (
          <View key={u.ci} style={styles.row}>
            <Text>{u.nombre} {u.apellido}</Text>
            <TouchableOpacity onPress={() => eliminarUsuario(u.ci)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 6,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  delete: { color: "red", fontWeight: "bold" },
  btn: {
    backgroundColor: "#1e3a8a",
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
