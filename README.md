# Security-application
# SheSafe — Backend + Mobile App

Full implementation of the SheSafe personal safety platform: **backend server**
(Node/Express/Socket.io/MongoDB/AssemblyAI/TensorFlow.js) and the **mobile app**
(React Native + Expo). The web dashboard has been intentionally left out of this build.

```
shesafe/
├── SYSTEM_CONFIG.json     # single source of truth for IP/ports/METER_RADIUS
├── UPDATE_CONFIG.js       # propagates SYSTEM_CONFIG.json -> server/.env and client config
├── server/                # Node.js backend
└── client/                # React Native (Expo) mobile app
```

## 1. Backend setup (`/server`)

```bash
cd server
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, ASSEMBLYAI_API_KEY, SMS creds
npm run dev                # nodemon server.js
```

What's running:
- **REST API** on `http://<host>:5000/api/v1/...` (Express)
- **Socket.io** on the same HTTP server — broadcasts `sos_alert`, `location_update`,
  `sos_accepted`, `sos_resolved`, `anonymous_alert`
- **Voice WebSocket** on port `5001` (`ws.js` + AssemblyAI) — receives streamed mic
  audio and auto-creates an SOS the moment a trigger phrase is transcribed
- **TensorFlow.js chatbot** — trains a small intent classifier in memory on boot,
  no external AI API calls per message

### Key REST endpoints
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | end-user auth |
| POST | `/auth/admin/login` | responder auth (token still issued even without a web UI) |
| POST | `/sos` | trigger SOS (manual / voice / shake) |
| PUT | `/sos/:id/location` | stream live coordinates during an active emergency |
| PUT | `/sos/:id/resolve` | mark safe |
| GET | `/sos/active` | admin-only live queue |
| POST | `/users/me/contacts` | add emergency contact |
| POST | `/chatbot/message` | safety chatbot |
| POST | `/anonymous-alerts` | bystander reports, no auth required |

## 2. Mobile app setup (`/client`)

```bash
cd client
npm install
npx expo install         # aligns native module versions with the installed Expo SDK
npx expo prebuild         # required once, since custom native modules need a Dev Client build
npx expo run:android      # or: npx expo run:ios
```

Before running, edit `src/config/systemConfig.js` (or run `node ../UPDATE_CONFIG.js`
from the repo root after editing `SYSTEM_CONFIG.json`) so `SERVER_IP` points at the
machine running the backend.

### Core flows implemented
- **Manual SOS**: long-press the SOS button on `HomeScreen`
- **Voice SOS**: `expo-speech-recognition` listens on-device for trigger phrases;
  `voiceStreamService.js` also streams audio to the backend's AssemblyAI relay as a
  cloud accuracy backstop
- **Shake SOS**: `shakeDetection.js` watches the accelerometer for a firm shake
  (1.8G threshold)
- **Active Emergency**: live map, continuous location push over Socket.io + REST,
  secret audio recording (`audioRecorder.js`), "I'm safe now" to resolve
- **Emergency Contacts**: add/remove, notified via SMS the instant an SOS fires
- **Chatbot**: on-device-style TF.js-backed assistant, can trigger SOS inline
- **Settings**: profile editing, profile picture picker

## 3. Keeping config in sync

Edit `SYSTEM_CONFIG.json` at the repo root, then:

```bash
node UPDATE_CONFIG.js
```

This rewrites `server/.env`'s port/radius values and regenerates
`client/src/config/systemConfig.js` so both modules always agree.

