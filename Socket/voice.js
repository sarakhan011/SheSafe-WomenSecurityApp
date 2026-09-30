/**
 * Raw WebSocket server (ws) for streaming binary audio from the mobile
 * client to AssemblyAI's Realtime API, and watching the live transcript
 * for safety trigger phrases ("help", "save me", "emergency", "danger").
 *
 * The mobile client connects to ws://<host>:<VOICE_WS_PORT>?token=<jwt>
 * and streams raw PCM16 audio chunks as binary frames.
 */
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { AssemblyAI } = require("assemblyai");

const TRIGGER_PHRASES = ["help", "save me", "emergency", "danger", "sos"];

const containsTrigger = (text) => {
  const lower = text.toLowerCase();
  return TRIGGER_PHRASES.some((phrase) => lower.includes(phrase));
};

const startVoiceWSServer = (port, onTriggerDetected) => {
  const wss = new WebSocket.Server({ port });
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

  wss.on("connection", async (clientSocket, req) => {
    let userId;
    try {
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      clientSocket.close(4001, "Unauthorized");
      return;
    }

    console.log(`[VoiceWS] User ${userId} connected for realtime transcription`);

    let transcriber;
    try {
      transcriber = client.realtime.transcriber({ sampleRate: 16000 });

      transcriber.on("transcript", (transcript) => {
        if (!transcript.text) return;
        clientSocket.send(JSON.stringify({ type: "transcript", text: transcript.text }));
        if (containsTrigger(transcript.text)) {
          onTriggerDetected(userId, transcript.text);
          clientSocket.send(JSON.stringify({ type: "trigger_detected", text: transcript.text }));
        }
      });

      transcriber.on("error", (err) => console.error("[VoiceWS/AssemblyAI] error:", err));
      await transcriber.connect();
    } catch (err) {
      console.error("[VoiceWS] Failed to start AssemblyAI transcriber:", err.message);
      clientSocket.close(1011, "Transcription service unavailable");
      return;
    }

    clientSocket.on("message", (data) => {
      // Binary PCM16 audio chunk from the mobile client -> forward to AssemblyAI
      transcriber.sendAudio(data);
    });

    clientSocket.on("close", async () => {
      console.log(`[VoiceWS] User ${userId} disconnected`);
      try {
        await transcriber.close();
      } catch (e) {}
    });
  });

  console.log(`[VoiceWS] Listening on port ${port}`);
  return wss;
};

module.exports = startVoiceWSServer;
