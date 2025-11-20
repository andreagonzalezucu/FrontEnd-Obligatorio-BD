import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ImageBackground, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router= useRouter();

  const BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://127.0.0.1:5000"; //Local host, para que se pueda conectar desde cualquier dispositivo

  const handleLogin = async () => {
    setError('');

    if (!email.includes('@')) {
      setError('El correo debe contener "@"');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    //chequear ruta del fetch
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: email,
          password: password
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        await AsyncStorage.setItem("user_ci", String(data.ci));
        Alert.alert("Bienvenido", data.mensaje);
        router.replace("/principal");
      } else {
        setError(data.mensaje || "Error de inicio de sesión");
      }

    } catch (err) {
      setLoading(false);
      setError("No se pudo conectar con el servidor", err);
    }
  };


  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66' }}
      style={styles.background}
      blurRadius={3}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#6b8afd' }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffa" />
            ) : (
              <Text style={styles.buttonText}>Acceder</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e11d48',
    textAlign: 'center',
    marginBottom: 10,
  },
});
