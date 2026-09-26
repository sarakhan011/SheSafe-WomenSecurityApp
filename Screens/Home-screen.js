import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";

import SOSButton from "../components/SOSButton";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { triggerSOS, updateSOSLocation as pushSOSLocation, resolveSOS } from "../services/api";
import {
  requestLocationPermissions,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
} from "../services/locationService";
import { startShakeDetection, stopShakeDetection } from "../services/shakeDetection";
import { startVoiceListening, stopVoiceListening, requestVoicePermissions } from "../services/voiceRecognition";
import { startSecretRecording, stopSecretRecording } from "../services/audioRecorder";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [region, setRegion] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null); // holds the created SOS doc while emergency is live
  const recordingRef = useRef(null);

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermissions();
      if (!granted) {
        Alert.alert("Location required", "SheSafe needs location access to work correctly.");
        return;
      }
      const loc = await getCurrentLocation();
      setRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });

      // Passive background tracking always runs so the last known location
      // is fresh enough to use for shake/voice auto-triggers.
      startLocationTracking();

      const voiceOk = await requestVoicePermissions();
      if (voiceOk) {
        startVoiceListening((transcript) => {
          Alert.alert("Trigger phrase detected", `Heard: "${transcript}". Sending SOS...`);
          handleTriggerSOS("voice");
        });
      }

      startShakeDetection(() => {
        handleTriggerSOS("shake");
      });
    })();

    return () => {
      stopShakeDetection();
      stopVoiceListening();
      stopLocationTracking();
    };
  }, []);

  const handleTriggerSOS = async (method = "manual") => {
    try {
      const loc = await getCurrentLocation();
      const { data } = await triggerSOS({
        latitude: loc.latitude,
        longitude: loc.longitude,
        description: "general",
        trigger_method: method,
      });
      setActiveSOS(data.sos);

      // Begin secretly recording audio evidence for the duration of the emergency
      recordingRef.current = await startSecretRecording();

      // Stream live location over the socket while the emergency is active
      const unsubscribeInterval = setInterval(async () => {
        const l = await getCurrentLocation();
        pushSOSLocation(data.sos._id, l.latitude, l.longitude).catch(() => {});
        socket?.emit("location_update", { sosId: data.sos._id, userId: user.id, ...l });
      }, 5000);
      activeSOS?._intervalId && clearInterval(activeSOS._intervalId);
      data.sos._intervalId = unsubscribeInterval;

      navigation.navigate("ActiveEmergency", { sos: data.sos });
    } catch (err) {
      Alert.alert("Failed to send SOS", err.response?.data?.message || "Please try again");
    }
  };

  const handleEndEmergency = async () => {
    if (!activeSOS) return;
    clearInterval(activeSOS._intervalId);
    await stopSecretRecording();
    await resolveSOS(activeSOS._id).catch(() => {});
    setActiveSOS(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.name?.split(" ")[0] || "there"}</Text>
        <Pressable onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      {region && (
        <MapView style={styles.map} initialRegion={region} showsUserLocation followsUserLocation>
          <Marker coordinate={region} title="You are here" />
        </MapView>
      )}

      <View style={styles.sosArea}>
        <SOSButton onTrigger={() => handleTriggerSOS("manual")} />
        <Text style={styles.helperText}>
          Also triggers automatically on a firm shake or by saying "help" / "emergency"
        </Text>
      </View>

      <View style={styles.navRow}>
        <Pressable onPress={() => navigation.navigate("Contacts")}><Text style={styles.navItem}>Contacts</Text></Pressable>
        <Pressable onPress={() => navigation.navigate("Chatbot")}><Text style={styles.navItem}>Chatbot</Text></Pressable>
        <Pressable onPress={() => navigation.navigate("Settings")}><Text style={styles.navItem}>Settings</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 50 },
  greeting: { fontSize: 20, fontWeight: "700" },
  logout: { color: "#E0245E" },
  map: { width: "100%", height: 260 },
  sosArea: { alignItems: "center", marginTop: 24 },
  helperText: { color: "#888", fontSize: 12, marginTop: 12, textAlign: "center", paddingHorizontal: 40 },
  navRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 32, borderTopWidth: 1, borderColor: "#eee", paddingTop: 16 },
  navItem: { fontSize: 15, fontWeight: "600", color: "#333" },
});
