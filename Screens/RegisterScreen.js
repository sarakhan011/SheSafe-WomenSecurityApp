import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "", email_address: "", phone_number: "", gender: "female", password: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    const { name, email_address, phone_number, password } = form;
    if (!name || !email_address || !phone_number || !password) {
      return Alert.alert("Missing fields", "Please fill in all fields");
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert("Registration failed", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput style={styles.input} placeholder="Full name" value={form.name} onChangeText={(t) => update("name", t)} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email_address} onChangeText={(t) => update("email_address", t)} />
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={form.phone_number} onChangeText={(t) => update("phone_number", t)} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={(t) => update("password", t)} />

      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: "#E0245E", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", color: "#E0245E", marginTop: 16 },
});
