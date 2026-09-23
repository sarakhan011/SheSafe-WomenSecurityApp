import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";

export default function SettingsScreen() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) {
      // In production: upload result.assets[0].uri to storage, then save the returned URL.
      const { data } = await updateProfile({ profile_image: result.assets[0].uri });
      setUser(data.user);
    }
  };

  const handleSaveName = async () => {
    try {
      const { data } = await updateProfile({ name });
      setUser(data.user);
      Alert.alert("Saved", "Your profile has been updated");
    } catch (err) {
      Alert.alert("Failed to save", err.response?.data?.message || "Try again");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Pressable onPress={handlePickImage}>
        <Text style={styles.link}>Change profile picture</Text>
      </Pressable>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
      <Pressable style={styles.button} onPress={handleSaveName}>
        <Text style={styles.buttonText}>Save changes</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 24 },
  link: { color: "#E0245E", marginBottom: 20, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 12 },
  button: { backgroundColor: "#E0245E", padding: 16, borderRadius: 10, alignItems: "center", marginTop: 8 },
  logoutButton: { backgroundColor: "#333", marginTop: 24 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
