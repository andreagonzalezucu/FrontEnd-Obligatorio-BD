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

type Facultad= {
  id_facultad: number;
  nombre: string;
}

type ProgramaAcademico = {
  id_facultad: number;
  id_programa: number;
  nombre_programa : string;
  tipo: string;
}

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
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [programas, setProgramas] = useState<ProgramaAcademico[]>([]);
  const [roles] = useState(["docente", "alumno"]);
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

  const [nuevaFacultad, setNuevaFacultad] = useState({
    nombre: "",
  });

  const [nuevoPrograma, setNuevoPrograma] = useState({
    nombre_programa: "",
    id_facultad: "",
    tipo: "",
  });

  const cargarTodo = async () => {
    try {
      const [e, s, u, f, p] = await Promise.all([
        fetch(`${BASE_URL}/edificios`).then(r => r.json() as Promise<Edificio[]>),
        fetch(`${BASE_URL}/salas`).then(r => r.json()),
        fetch(`${BASE_URL}/participantes`).then(r => r.json()),
        fetch(`${BASE_URL}/facultades`).then(r => r.json() as Promise<Facultad[]>),
        fetch(`${BASE_URL}/programas`).then(r => r.json()) as Promise<ProgramaAcademico[]>  
      ]);


      setEdificios(e);
      const deps = [...new Set(e.map((ed) => ed.departamento))];
      setDepartamentos(deps);
      setSalas(s);
      setUsuarios(u);
      setFacultades(f)
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
      "Si el edificio tiene salas asociadas, deberás confirmar una eliminación FORZADA.\n" +
      "Esta acción borrará:\n" +
      "• Todas las salas del edificio\n" +
      "• Todas las reservas de esas salas\n" +
      "• Todas las relaciones que tenían los participantes con dichas reservas\n\n" +
      "Esta acción NO se puede deshacer."
    );

    setAccionPendiente(() => () => intentoEliminarEdificio(id_edificio));
    setModalConfirmarVisible(true);
  };

  const intentoEliminarEdificio = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/edificios/${id}`, {
        method: "DELETE",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        setResultadoExito(true);
        setMensajeResultado("Edificio eliminado con éxito");
        cargarTodo();
        setModalResultadoVisible(true);
        return;
      }

      // Caso 409 → necesita force
      if (res.status === 409) {
        setMensajeConfirmacion(
          "⚠️ El edificio tiene salas asociadas.\n\n" +
          "¿Deseas continuar con la eliminación FORZADA?\n" +
          "Esto borrará salas, reservas y relaciones asociadas."
        );

        setAccionPendiente(() => () => eliminarEdificioForzado(id));
        setModalConfirmarVisible(true);
        return;
      }

      throw new Error(data?.mensaje || "Error al eliminar el edificio");
    } catch (e) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al intentar eliminar el edificio.");
      setModalResultadoVisible(true);
    }
  };

  const eliminarEdificioForzado = async (id: number) => {
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

      if (!res.ok) {
        throw new Error(data?.mensaje || "Error al eliminar edificio.");
      }

      setResultadoExito(true);
      setMensajeResultado("Edificio eliminado con éxito");
      cargarTodo();
    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar edificio.");
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
      "Si tiene reservas asociadas, deberás confirmar nuevamente.\n\n" +
      "Esta acción NO se puede deshacer."
    );

    // Primer intento: force = false
    setAccionPendiente(() => () => intentoEliminarSala(id_sala));
    setModalConfirmarVisible(true);
  };

  const intentoEliminarSala = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/salas/${id}?force=false`, {
      method: "DELETE",
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      // Si el backend devuelve 409 → requiere force
      if (res.status === 409) {
        setMensajeConfirmacion(
          `⚠️ La sala tiene reservas asociadas.\n\n` +
          `${data?.mensaje || "¿Deseas forzar la eliminación?"}`
        );

        // Ahora la acción pendiente será el DELETE con force=true
        setAccionPendiente(() => () => eliminarSalaForzado(id));
        setModalConfirmarVisible(true);
        return;
      }

      throw new Error(data?.mensaje || "Error al eliminar la sala");
    }

      // Eliminó OK sin force
      setResultadoExito(true);
      setMensajeResultado("Sala eliminada con éxito");
      cargarTodo();
    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar la sala.");
    }

    setModalResultadoVisible(true);
  };


  const eliminarSalaForzado = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/salas/${id}?force=true`, {
      method: "DELETE",
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
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


  const handleEliminarUsuario = (ci: string) => {
  setMensajeConfirmacion(
    `⚠️ ¿Seguro que deseas eliminar el usuario con CI: ${ci}?\n\n` +
    "Si tiene reservas activas, se te pedirá una confirmación adicional.\n\n" +
    "Esta acción NO se puede deshacer."
  );

  setAccionPendiente(() => () => intentarEliminarUsuario(ci));
  setModalConfirmarVisible(true);
};


const intentarEliminarUsuario = async (ci: string) => {
  try {
    const res = await fetch(`${BASE_URL}/participantes/${ci}`, {
      method: "DELETE"
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // Caso: requiere confirmación forzada
    if (res.status === 409) {
      setMensajeConfirmacion(
        `⚠️ El participante con CI ${ci} tiene reservas activas.\n\n` +
        "¿Deseas ELIMINARLO FORZADAMENTE?\n\n" +
        "Si es el único participante de una reserva, la reserva será eliminada."
      );
      setAccionPendiente(() => () => eliminarUsuarioForzado(ci));
      setModalConfirmarVisible(true);
      return;
    }

    if (!res.ok) {
      throw new Error(data?.mensaje || "Error eliminando participante.");
    }

        // Eliminación exitosa
        setResultadoExito(true);
        setMensajeResultado("Usuario eliminado con éxito.");
        cargarTodo();
        
      } catch (error) {
        setResultadoExito(false);
        setMensajeResultado("Error inesperado al eliminar el participante.");
      }

      setModalResultadoVisible(true);
    };


  const eliminarUsuarioForzado = async (ci: string) => {
    try {
      const res = await fetch(`${BASE_URL}/participantes/${ci}?force=true`, {
        method: "DELETE"
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.mensaje || "Error eliminando participante.");
      }

      setResultadoExito(true);
      setMensajeResultado("Usuario eliminado de forma forzada con éxito.");
      cargarTodo();

    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar el participante.");
    }

    setModalResultadoVisible(true);
  };

const crearFacultad = async () => {
    if (!nuevaFacultad.nombre) return Alert.alert("Error", "El nombre es obligatorio");

    const res = await fetch(`${BASE_URL}/facultades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevaFacultad.nombre,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Éxito", data.mensaje);
      setNuevaFacultad({ nombre: "" });
      cargarTodo();
    } else {
      Alert.alert("Error", data.mensaje);
    }
  };

  const handleEliminarFacultad = (id_facultad: number) => {
    setMensajeConfirmacion(
      "⚠️ ¿Seguro que deseas eliminar esta facultad?\n\n" +
      "Si la facultad tiene programas asociados, se realizará una eliminación FORZADA.\n" +
      "Esta acción borrará:\n" +
      "• Todos los programas de dicha facultad\n" +
      "• Todas las relaciones que tenían los participantes con dichaos programas\n\n" +
      "Esta acción NO se puede deshacer."
    );

    setAccionPendiente(() => () => eliminarFacultad(id_facultad));
    setModalConfirmarVisible(true);
  };


  const eliminarFacultad = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/facultades/${id}`, {
      method: "DELETE",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.mensaje || "Error al eliminar facultad.");
      }

      setResultadoExito(true);
      setMensajeResultado("Facultad eliminada con éxito");
      cargarTodo();
    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar facultad.");
    }

    setModalResultadoVisible(true);
  };

  const crearPrograma = async () => {
    if (!nuevoPrograma.nombre_programa) return Alert.alert("Error", "El nombre es obligatorio");

    const res = await fetch(`${BASE_URL}/programas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_programa: nuevoPrograma.nombre_programa,
        tipo: nuevoPrograma.tipo,
        id_facultad: nuevoPrograma.id_facultad,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Éxito", data.mensaje);
      setNuevoPrograma({ nombre_programa: "", tipo: "" , id_facultad:""});
      cargarTodo();
    } else {
      Alert.alert("Error", data.mensaje);
    }
  };

  const handleEliminarPrograma = (id_programa: number) => {
    setMensajeConfirmacion(
      "⚠️ ¿Seguro que deseas eliminar este programa?\n\n" +
      "Aquellas personas que pertenezcan a este programa estarán registradas sin programa asociado"+
      "Esta acción NO se puede deshacer."
    );

    setAccionPendiente(() => () => eliminarPrograma(id_programa));
    setModalConfirmarVisible(true);
  };

  const eliminarPrograma = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/programas/${id}`, {
      method: "DELETE",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.mensaje || "Error al eliminar programa.");
      }

      setResultadoExito(true);
      setMensajeResultado("Programa eliminado con éxito");
      cargarTodo();
    } catch (err) {
      setResultadoExito(false);
      setMensajeResultado("Error inesperado al eliminar programa.");
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
        <Text style={styles.subtitle}>Tipo (docente, libre, posgrado)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nuevaSala.tipo}
            onValueChange={(t) => setNuevaSala({ ...nuevaSala, tipo: t })}>
            
            <Picker.Item label="Seleccione un tipo..." value="" />
            <Picker.Item label="Exclusiva docentes" value="docente" />
            <Picker.Item label="De uso Libre" value="libre" />
            <Picker.Item label="Exclusiva estudiantes de posgrado" value="posgrado" />
          </Picker>
        </View>

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

      <Accordion title="Administrar Facultades">
        <Text style={styles.subtitle}>Crear facultad</Text>

        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={nuevaFacultad.nombre}
          onChangeText={(t) => setNuevaFacultad({ ...nuevaFacultad, nombre: t })}
        />
        
        <Text style={styles.subtitle}>Facultad</Text>
    
        <TouchableOpacity style={styles.btn} onPress={crearFacultad}>
          <Text style={styles.btnText}>Crear Facultad</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Facultades existentes</Text>

        {facultades.map((f: Facultad) => (
          <View key={f.id_facultad} style={styles.row}>
            <Text>{f.nombre}</Text>
            <TouchableOpacity onPress={() => handleEliminarFacultad(f.id_facultad)}>
              <Text style={styles.delete}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Accordion>

      <Accordion title="Administrar Programas Académicos">
        <Text style={styles.subtitle}>Crear Programa Académico</Text>

        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={nuevoPrograma.nombre_programa}
          onChangeText={(t) => setNuevoPrograma({ ...nuevoPrograma, nombre_programa: t })}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nuevoPrograma.id_facultad}
            onValueChange={(value: string) =>
              setNuevoPrograma({ ...nuevoPrograma, id_facultad: value })
            }
          >
            <Picker.Item label="Seleccione facultad a la que corresponde..." value="" />
            {facultades.map((f: any) => (
              <Picker.Item
                key={f.id_facultad}
                label={f.nombre}
                value={f.id_facultad.toString()}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nuevaSala.tipo}
            onValueChange={(t) => setNuevaSala({ ...nuevaSala, tipo: t })}>
            
            <Picker.Item label="Seleccione un tipo..." value="" />
            <Picker.Item label="Carrera de Grado" value="grado" />
            <Picker.Item label="Carrera de Posgrado" value="posgrado" />
          </Picker>
        </View>
        
        <TouchableOpacity style={styles.btn} onPress={crearPrograma}>
          <Text style={styles.btnText}>Crear Programa Académico</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Programas Académicos existentes</Text>

        {programas.map((p: ProgramaAcademico) => (
          <View key={p.id_programa} style={styles.row}>
            <Text>{p.nombre_programa}</Text>
            <TouchableOpacity onPress={() => handleEliminarPrograma(p.id_programa)}>
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
