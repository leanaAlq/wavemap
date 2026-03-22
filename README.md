# Radii

A location-based music social app. Users broadcast what they're listening to via a live GPS map. Others nearby can see, react to, and comment on tracks publicly.

## Stack

| Layer | Tech |
|-------|------|
| Mobile | React Native + Expo + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Real-time | Socket.io |
| Database | PostgreSQL |
| Auth | Spotify OAuth 2.0 (PKCE) |

## Monorepo structure

```
/client   — Expo React Native app
/server   — Express + Socket.io backend
/shared   — TypeScript types shared across client and server
```

## Getting started

### Prerequisites

- Node.js 18+
- npm 8+ (workspaces support)
- Expo CLI: `npm install -g expo-cli`

### Install all dependencies

```bash
npm install
```

### Run the server (dev)

```bash
npm run server
# or: cd server && npm run dev
# Server starts on http://localhost:3000
```

### Run the client (dev)

```bash
npm run client
# or: cd client && npm run start
# Opens Expo dev menu — press i for iOS simulator, a for Android
```

## Privacy

- GPS coordinates are never stored persistently
- Location is fuzzed ±50 metres before any broadcast
- Location data lives in memory only
- Session tokens only — no persistent user ID linked to location
