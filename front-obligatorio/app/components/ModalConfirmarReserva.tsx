import { Modal, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";

type SuccessData = {
  sala: string;
  horario: string;
  fecha: string;
  participantes: string[];
};


type Props = {
  visible: boolean;
  loading: boolean;
  successData?: SuccessData | null;
  errorMessage?: string | null;
  onClose: () => void;
};

export default function ModalConfirmarReserva({
  visible,
  loading,
  successData,
  errorMessage,
  onClose,
}: Props) {
  if (!visible) return null;

  // 🔒 Normalización de participantes: siempre array, nunca undefined
  const participantesSeguros: string[] =
    Array.isArray(successData?.participantes)
      ? successData!.participantes
      : successData?.participantes
      ? [String(successData.participantes)]
      : [];

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* LOADING */}
          {loading && (
            <>
              <ActivityIndicator size="large" color="#1e3a8a" />
              <Text style={styles.title}>Creando reserva...</Text>
            </>
          )}

          {/* ÉXITO */}
          {!loading && successData && (
            <>
                <Text style={styles.titleSuccess}>¡Reserva creada!</Text>

                <Text style={styles.label}>Sala:</Text>
                <Text style={styles.value}>{successData.sala}</Text>

                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>{successData.fecha}</Text>

                <Text style={styles.label}>Horario:</Text>
                <Text style={styles.value}>{successData.horario}</Text>

                <Text style={styles.label}>Participantes:</Text>
                {successData.participantes.length > 0 ? (
                successData.participantes.map((ci, i) => (
                    <Text key={i} style={styles.participantItem}>✅ {ci}</Text>
                ))
                ) : (
                <Text style={styles.participantItem}>— Sin participantes —</Text>
                )}

                <TouchableOpacity style={styles.btn} onPress={onClose}>
                <Text style={styles.btnText}>Cerrar</Text>
                </TouchableOpacity>
            </>
        )}


          {/* ERROR */}
          {!loading && errorMessage && (
            <>
              <Text style={styles.titleError}>Error</Text>
              <Text style={styles.value}>{errorMessage}</Text>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "red" }]}
                onPress={onClose}
              >
                <Text style={styles.btnText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    marginTop: 10,
    fontSize: 18,
    textAlign: "center",
  },
  titleSuccess: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    textAlign: "center",
    marginBottom: 10,
  },
  titleError: {
    fontSize: 22,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
  },
  participantItem: {
    fontSize: 16,
    marginLeft: 5,
  },
  btn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
