import React, { useRef } from "react";
import { Pressable, Text, StyleSheet, Animated } from "react-native";

/**
 * Large, prominent SOS button. Uses a press-and-hold pattern (long press)
 * to avoid accidental triggers, per the "manual trigger" workflow.
 */
export default function SOSButton({ onTrigger, holdDurationMs = 1200 }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, { toValue: 1.08, duration: holdDurationMs, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    scale.stopAnimation((value) => {
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onTrigger}
      delayLongPress={holdDurationMs}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.button, { transform: [{ scale }] }]}>
        <Text style={styles.label}>SOS</Text>
        <Text style={styles.hint}>Hold to send alert</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E0245E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E0245E",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  label: { color: "white", fontSize: 40, fontWeight: "800", letterSpacing: 2 },
  hint: { color: "white", fontSize: 12, marginTop: 6, opacity: 0.85 },
});
