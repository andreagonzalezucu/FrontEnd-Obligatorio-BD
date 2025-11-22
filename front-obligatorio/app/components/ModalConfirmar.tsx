import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  mensaje: string;
  onCancelar: () => void;
  onConfirmar: () => void;
};

export default function ModalConfirmar({ visible, mensaje, onCancelar, onConfirmar }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.text}>{mensaje}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.btnCancelar]} onPress={onCancelar}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnConfirmar]} onPress={onConfirmar}>
              <Text style={styles.btnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnCancelar: {
    backgroundColor: "#c0392b",
  },
  btnConfirmar: {
    backgroundColor: "#27ae60",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
