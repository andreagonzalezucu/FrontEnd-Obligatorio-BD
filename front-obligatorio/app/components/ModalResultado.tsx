import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  exito: boolean;
  mensaje: string;
  onCerrar: () => void;
};

export default function ModalResultado({ visible, exito = true, mensaje, onCerrar }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.titulo, { color: exito ? "green" : "red" }]}>
            {exito ? "Éxito" : "Error"}
          </Text>

          <Text style={styles.mensaje}>{mensaje}</Text>

          <TouchableOpacity style={styles.boton} onPress={onCerrar}>
            <Text style={styles.botonTexto}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mensaje: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  boton: {
    backgroundColor: "#457b9d",
    padding: 10,
    borderRadius: 8,
    width: "60%",
    alignItems: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
