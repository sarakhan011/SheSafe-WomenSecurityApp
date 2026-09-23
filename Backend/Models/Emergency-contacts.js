import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function EmergencyContactItem({ contact, onDelete }) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phone_number}</Text>
        {!!contact.relationship && <Text style={styles.relation}>{contact.relationship}</Text>}
      </View>
      <Pressable onPress={() => onDelete(contact._id)}>
        <Text style={styles.delete}>Remove</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: { fontSize: 16, fontWeight: "600" },
  phone: { fontSize: 14, color: "#666" },
  relation: { fontSize: 12, color: "#999" },
  delete: { color: "#E0245E", fontWeight: "600" },
});
