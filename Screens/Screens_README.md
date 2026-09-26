# SheSafe — Screens

Documentation for the seven screen components in `client/src/screens/`. Each
screen is a top-level route rendered by `AppNavigator.js`. This README covers
only the screens — for services, contexts, and the backend API, see the main
project README.

```
src/screens/
├── LoginScreen.js
├── RegisterScreen.js
├── HomeScreen.js
├── ActiveEmergencyScreen.js
├── ContactsScreen.js
├── ChatbotScreen.js
└── SettingsScreen.js
```

---

## LoginScreen.js

**Route:** `Login` (shown when no user is authenticated)

Sign-in form for existing end-users.

- **State:** `email`, `password`, `loading`
- **Uses:** `useAuth().login(email, password)`
- **Behavior:** validates both fields are filled, shows a spinner in the
  submit button while the request is in flight, and surfaces the server's
  error message on failure via `Alert`.
- **Navigates to:** `Register` (link at the bottom)
- **On success:** `AuthContext` stores the JWT and updates `user`, which
  flips `AppNavigator` over to the authenticated stack automatically — this
  screen does not navigate manually on success.

---

## RegisterScreen.js

**Route:** `Register`

Sign-up form for new end-users.

- **State:** `form` (`name`, `email_address`, `phone_number`, `gender`,
  `password`), `loading`
- **Uses:** `useAuth().register(form)`
- **Behavior:** requires name, email, phone, and password before submitting;
  `gender` defaults to `"female"` but isn't currently exposed as an input —
  add a picker here if you want the user to set it at signup.
- **Navigates to:** `Login` (link at the bottom)
- **On success:** same as Login — `AuthContext` handles the redirect.

---

## HomeScreen.js

**Route:** `Home` (the authenticated landing screen)

The main hub: live map, the SOS button, and passive safety monitoring.

- **State:** `region` (map viewport), `activeSOS` (the in-progress SOS
  document, if any)
- **On mount:**
  1. Requests location permission and centers the map on the user
  2. Starts passive background location tracking (`locationService`)
  3. Requests mic permission and starts on-device voice trigger-phrase
     listening (`voiceRecognition`)
  4. Starts accelerometer shake detection (`shakeDetection`)
  5. Cleans up all three listeners on unmount
- **`handleTriggerSOS(method)`:** shared by the SOS button, voice trigger,
  and shake trigger. Gets current location, calls `triggerSOS()`, starts
  secret audio recording, opens a 5s interval that pushes location updates
  both to the REST API and over the socket, then navigates to
  `ActiveEmergency`.
- **`handleEndEmergency()`:** stops the location interval and recording and
  resolves the SOS. (Currently only wired up as a standalone handler — the
  UI's actual "resolve" action lives on `ActiveEmergencyScreen`.)
- **Navigates to:** `Contacts`, `Chatbot`, `Settings`, `ActiveEmergency`
- **Depends on:** `useAuth`, `useSocket`, `SOSButton` component,
  `react-native-maps`

---

## ActiveEmergencyScreen.js

**Route:** `ActiveEmergency` (pushed on top of `Home` once an SOS fires)

**Route params:** `{ sos }` — the SOS document returned by `triggerSOS()`,
used to center the initial map region.

Full-screen "help is coming" state shown for the duration of an emergency.

- **State:** `region`, refreshed every 5s from `getCurrentLocation()` so the
  map marker tracks the user live
- **`handleImSafe()`:** confirmation dialog → calls `resolveSOS(sos._id)` →
  `navigation.popToTop()` back to Home
- **Note:** `gestureEnabled: false` is set on this route in the navigator so
  the user can't accidentally swipe back out of an active emergency; the
  only way out is explicitly marking themselves safe.
- **Depends on:** `react-native-maps`, `locationService`

---

## ContactsScreen.js

**Route:** `Contacts`

Manage the emergency contacts who are notified/watch the live location when
an SOS fires.

- **State:** `contacts` (mirrors `user.emergency_contact`), `form` (`name`,
  `phone_number`, `relationship`)
- **`refresh()`:** re-fetches the profile via `getProfile()` and syncs both
  local state and the shared `AuthContext` user object
- **`handleAdd()`:** requires name + phone number, calls `addContact()`,
  clears the form, refreshes the list
- **`handleDelete(contactId)`:** calls `removeContact()`, refreshes
- **Renders:** `EmergencyContactItem` per contact, with a "Remove" action
- **Depends on:** `useAuth`, `EmergencyContactItem` component

---

## ChatbotScreen.js

**Route:** `Chatbot`

Conversational safety assistant backed by the server's chatbot endpoint.

- **State:** `messages` (chat history, seeded with a welcome message),
  `input`
- **`handleSend()`:** appends the user's message locally, calls
  `sendChatMessage()`, appends the bot's reply. If the backend classifies the
  message as high-risk (`data.suggestSOS === true`), the bot bubble renders
  an inline **"Send SOS now"** button.
- **`handleSOSFromChat()`:** gets current location and calls `triggerSOS()`
  directly from the chat — this is a secondary SOS entry point separate from
  `HomeScreen`'s flow and does **not** currently start audio recording or
  the location-streaming interval; if you want full parity with the
  Home-screen trigger, route this through the same `handleTriggerSOS` logic
  instead of calling `triggerSOS()` inline.
- **Depends on:** `locationService`

---

## SettingsScreen.js

**Route:** `Settings`

Profile management and logout.

- **State:** `name` (initialized from `user.name`)
- **`handlePickImage()`:** requests media library permission, launches the
  image picker, and saves the picked image's local URI directly via
  `updateProfile()`. **Note:** this stores the on-device `file://` URI as-is
  — for production, upload the picked asset to object storage first and
  save the returned public URL instead.
- **`handleSaveName()`:** calls `updateProfile({ name })`, updates
  `AuthContext`
- **`logout()`:** clears the stored token and returns to the unauthenticated
  stack (handled by `AuthContext` / `AppNavigator`)
- **Depends on:** `useAuth`, `expo-image-picker`

---

## Shared patterns across all screens

- **Styling:** each screen defines its own `StyleSheet.create({...})` inline
  rather than importing a shared theme — the brand color `#E0245E` is
  repeated across files. Consider extracting a `theme.js` if you want a
  single place to adjust the palette.
- **Error handling:** API errors are surfaced with `Alert.alert(title,
  err.response?.data?.message || fallback)` consistently.
- **Auth-gated navigation:** none of the screens check `user` themselves —
  `AppNavigator.js` decides which stack (auth vs. main) is mounted based on
  `useAuth().user`, so screens can assume they only render in the correct
  context.
