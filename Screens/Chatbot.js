import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { sendChatMessage, triggerSOS } from "../services/api";
import { getCurrentLocation } from "../services/locationService";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { id: "welcome", role: "bot", text: "Hi, I'm here for you. How are you feeling right now?" },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const { data } = await sendChatMessage(userMsg.text);
      const botMsg = { id: Date.now().toString() + "-bot", role: "bot", text: data.response, suggestSOS: data.suggestSOS };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [...m, { id: "err", role: "bot", text: "Sorry, I'm having trouble responding right now." }]);
    }
  };

  const handleSOSFromChat = async () => {
    const loc = await getCurrentLocation();
    await triggerSOS({ latitude: loc.latitude, longitude: loc.longitude, description: "general", trigger_method: "manual" });
    setMessages((m) => [...m, { id: Date.now().toString(), role: "bot", text: "SOS sent. Help is on the way." }]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text style={styles.title}>Safety Assistant</Text>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
            <Text style={item.role === "user" ? styles.userText : styles.botText}>{item.text}</Text>
            {item.suggestSOS && (
              <Pressable style={styles.sosInline} onPress={handleSOSFromChat}>
                <Text style={styles.sosInlineText}>Send SOS now</Text>
              </Pressable>
            )}
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Type a message..." value={input} onChangeText={setInput} onSubmitEditing={handleSend} />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  title: { fontSize: 20, fontWeight: "700", paddingHorizontal: 16 },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 14, marginBottom: 10 },
  botBubble: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },
  userBubble: { backgroundColor: "#E0245E", alignSelf: "flex-end" },
  botText: { color: "#222" },
  userText: { color: "#fff" },
  sosInline: { marginTop: 8, backgroundColor: "#fff", padding: 8, borderRadius: 8 },
  sosInlineText: { color: "#E0245E", fontWeight: "700", textAlign: "center" },
  inputRow: { flexDirection: "row", padding: 12, borderTopWidth: 1, borderColor: "#eee" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  sendButton: { backgroundColor: "#E0245E", borderRadius: 20, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "700" },
});
