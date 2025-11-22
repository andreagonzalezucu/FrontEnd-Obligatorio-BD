import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import Accordion from "@/components/Accordion";
import { Picker } from "@react-native-picker/picker";
import ModalConfirmar from "@/components/ModalConfirmar";
import ModalResultado from "@/components/ModalResultado";

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
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [salas, setSalas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [roles] = useState(["docente", "alumno"]);
  const [programas, setProgramas] = useState([]);
  const [seleccion, setSeleccion] = useState({ rol: "", id_programa: "" });

  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);
  const [modalResultadoVisible, setModalResultadoVisible] = useState(false);

  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [mensajeResultado, setMensajeResultado] = useState("");
  const [resultadoExito, setResultadoExito] = useState(true);

  const [accionPendiente, setAccionPendiente] = useState<null | (() => void)>(null);

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
    password: "",
  });

  const cargarTodo = async () => {
    try {
      const [e, s, u] = await Promise.all([
        fetch(`${BASE_URL}/edificios`).then(r => r.json() as Promise<Edificio[]>),
        fetch(`${BASE_URL}/salas`).then(r => r.json()),
        fetch(`${BASE_URL}/participantes`).then(r => r.json()),
        ]);


      setEdificios(e);
      const deps = [...new Set(e.map((ed) => ed.departamento))];
      setDepartamentos(deps);
      setSalas(s);
      setUsuarios(u);
      const p = await fetch(`${BASE_URL}/programas`).then(r => r.json());
        setProgramas(p);


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

  const handleEliminarEdificio = (id_edificio: number) => {
    setMensajeConfirmacion(
      "⚠️ ¿Seguro que deseas eliminar este edificio?\n\n" +
      "Al eliminarlo también se borrarán todas las salas pertenecientes a este edificio, " +
      "y las reservas asociadas a esas salas quedarán eliminadas de forma permanente.\n\n" +
      "Esta acción NO se puede deshacer."
    );

    setAccionPendiente(() => () => eliminarEdificio(id_edificio));
    setModalConfirmarVisible(true);
  };


  const eliminarEdificio = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/edificios/${id}?force=true`, {
      method: "DELETE",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok){
        if (res.status === 409) {
          setResultadoExito(false);
          setMensajeResultado(
            data?.mensaje || "No se puede eliminar el edificio porque tiene salas asociadas."
          );
          setModalResultadoVisible(true);
          return;
        }
        // Otros errores (500, 404, etc)
        throw new Error(data?.mensaje || "Error al eliminar");
      } 

      setResultadoExito(true);
      setMensajeResultado("Edificio eliminado con éxito");
      cargarTodo();
    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar el edificio.");
    }

    setModalResultadoVisible(true);
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

  const handleEliminarSala = (id_sala: number) => {
    setMensajeConfirmacion(
      "⚠️ ¿Seguro que deseas eliminar esta sala?\n\n" +
      "Todas las reservas asociadas a esta sala serán eliminadas de forma permanente.\n\n" +
      "Esta acción NO se puede deshacer."
    );
    setAccionPendiente(() => () => eliminarSala(id_sala));
    setModalConfirmarVisible(true);
  };

  const eliminarSala = async (id: number) => {
    try{
      const res = await fetch(`${BASE_URL}/salas/${id}?force=true`, {
      method: "DELETE",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok){
        if (res.status === 409) {
          setResultadoExito(false);
          setMensajeResultado(
            data?.mensaje || "No se puede eliminar la sala porque tiene reservas asociadas."
          );
          setModalResultadoVisible(true);
          return;
        }

        throw new Error(data?.mensaje || "Error al eliminar la sala");
      } 

      setResultadoExito(true);
      setMensajeResultado("Sala eliminada con éxito");
      cargarTodo();
    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar la sala.");
    }

    setModalResultadoVisible(true);
  };


  const crearUsuario = async () => {
    if (
        !nuevoUsuario.ci ||
        !nuevoUsuario.nombre ||
        !nuevoUsuario.email ||
        !nuevoUsuario.password ||
        !seleccion.rol ||
        !seleccion.id_programa
    ) {
        return Alert.alert("Error", "Faltan campos obligatorios");
    }

    try {
        // 1. Crear login primero
        const resLogin = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            correo: nuevoUsuario.email,
            password: nuevoUsuario.password,
        }),
        });

        const dataLogin = await resLogin.json();

        if (!resLogin.ok) {
        return Alert.alert("Error", dataLogin.mensaje || "Error al crear login.");
        }

        // 2. Crear participante
        const resPart = await fetch(`${BASE_URL}/participantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ci: nuevoUsuario.ci,
            nombre: nuevoUsuario.nombre,
            apellido: nuevoUsuario.apellido,
            email: nuevoUsuario.email,
        }),
        });

        const dataPart = await resPart.json();

        if (!resPart.ok) {
        return Alert.alert(
            "Error",
            "El login fue creado, pero ocurrió un error al crear el participante."
        );
        }

        // 3. Crear registro académico
        const resReg = await fetch(`${BASE_URL}/participantes_programa_academico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ci_participante: nuevoUsuario.ci,
            id_programa: Number(seleccion.id_programa),
            rol: seleccion.rol,
        }),
        });

        const dataReg = await resReg.json();

        if (!resReg.ok) {
        return Alert.alert(
            "Error",
            "Usuario creado, pero ocurrió un error al asignar el programa y rol."
        );
        }

        Alert.alert("Éxito", "Usuario creado correctamente.");

        // limpiar formulario
        setNuevoUsuario({
        ci: "",
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        });

        setSeleccion({ rol: "", id_programa: "" });

        cargarTodo();

    } catch (err) {
        console.log(err);
        Alert.alert("Error", "No se pudo crear el usuario.");
    }
    };


  const handleEliminarUsuario = (ci:string) => {
    setMensajeConfirmacion(
    `⚠️ ¿Seguro que deseas eliminar el usuario con CI: ${ci}?\n\n` +
    "El usuario será eliminado del sistema y será removido de cualquier reserva " +
    "en la que participe. Si es el único participante de una reserva, dicha reserva " +
    "será eliminada.\n\n" +
    "Esta acción NO se puede deshacer."
  );

    setAccionPendiente(() => () => eliminarUsuario(ci));
    setModalConfirmarVisible(true);
  };

  const eliminarUsuario = async (ci: string) => {
    try{
        const res = await fetch(`${BASE_URL}/participantes/${ci}?force=true`, {
          method: "DELETE",
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok){
          if (res.status === 409) {
            setResultadoExito(false);
            setMensajeResultado(
              data?.mensaje || "No se puede eliminar el participante porque está asociado a reservas."
            );
            setModalResultadoVisible(true);
            return;
          }

          throw new Error(data?.mensaje || "Error al eliminar el participante");
        } 

        setResultadoExito(true);
        setMensajeResultado("Usuario eliminado con éxito");
        cargarTodo();
      } catch (err) {
        setResultadoExito(false);
        setMensajeResultado("Error inesperado al eliminar el participante.");
      }

      setModalResultadoVisible(true);
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
  <>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <Accordion title="Administrar Edificios">
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

        <Text style={{ marginTop: 10, fontWeight: "600" }}>Departamento</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nuevoEdificio.departamento}
            onValueChange={(value: string) =>
              setNuevoEdificio({ ...nuevoEdificio, departamento: value })
            }
          >
            <Picker.Item label="Seleccione un departamento..." value="" />

            {departamentos.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.btn} onPress={crearEdificio}>
          <Text style={styles.btnText}>Crear Edificio</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Edificios existentes</Text>

        {edificios.map((e: Edificio) => (
          <View key={e.id_edificio} style={styles.row}>
            <Text>{e.nombre_edificio}</Text>
            <TouchableOpacity onPress={() => handleEliminarEdificio(e.id_edificio)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>

      <Accordion title="Administrar Salas">
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

        <Text style={styles.subtitle}>Edificio</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nuevaSala.edificio}
            onValueChange={(value: string) =>
              setNuevaSala({ ...nuevaSala, edificio: value })
            }
          >
            <Picker.Item label="Seleccione un edificio..." value="" />

            {edificios.map((ed: Edificio) => (
              <Picker.Item
                key={ed.id_edificio}
                label={`${ed.nombre_edificio} (${ed.departamento})`}
                value={ed.id_edificio.toString()}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.btn} onPress={crearSala}>
          <Text style={styles.btnText}>Crear Sala</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Salas existentes</Text>

        {salas.map((s: Sala) => (
          <View key={s.id_sala} style={styles.row}>
            <Text>
              {s.nombre_sala} ({s.nombre_edificio})
            </Text>
            <TouchableOpacity onPress={() => handleEliminarSala(s.id_sala)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>

      <Accordion title="Administrar Participantes">
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

        <TextInput
          placeholder="Contraseña"
          style={styles.input}
          secureTextEntry
          value={nuevoUsuario.password}
          onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, password: t })}
        />

        <Text style={styles.subtitle}>Rol</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={seleccion.rol}
            onValueChange={(value: string) =>
              setSeleccion({ ...seleccion, rol: value })
            }
          >
            <Picker.Item label="Seleccione un rol..." value="" />
            {roles.map((r) => (
              <Picker.Item key={r} label={r} value={r} />
            ))}
          </Picker>
        </View>

        <Text style={styles.subtitle}>Programa académico</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={seleccion.id_programa}
            onValueChange={(value: string) =>
              setSeleccion({ ...seleccion, id_programa: value })
            }
          >
            <Picker.Item label="Seleccione un programa..." value="" />
            {programas.map((p: any) => (
              <Picker.Item
                key={p.id_programa}
                label={p.nombre_programa}
                value={p.id_programa.toString()}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.btn} onPress={crearUsuario}>
          <Text style={styles.btnText}>Crear Usuario</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Usuarios existentes</Text>

        {usuarios.map((u: Participante) => (
          <View key={u.ci} style={styles.row}>
            <Text>
              {u.nombre} {u.apellido}
            </Text>
            <TouchableOpacity onPress={() => handleEliminarUsuario(u.ci)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>
    </ScrollView>

    {/* MODAL DE CONFIRMACIÓN */}
    <ModalConfirmar
      visible={modalConfirmarVisible}
      mensaje={mensajeConfirmacion}
      onCancelar={() => setModalConfirmarVisible(false)}
      onConfirmar={() => {
        setModalConfirmarVisible(false);
        accionPendiente?.();
      }}
    />

    {/*Modal de resultado de error o éxito */}
    <ModalResultado
      visible={modalResultadoVisible}
      mensaje={mensajeResultado}
      exito={resultadoExito}
      onCerrar={() => setModalResultadoVisible(false)}
    />
  </>
);
}

const styles = StyleSheet.create({
    pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginVertical: 6,
    },
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
