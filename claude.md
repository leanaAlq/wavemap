# Radii — Project Context for Claude Code

## What We're Building
A location-based music social app. Users broadcast what 
they're listening to via a live GPS map. Others nearby 
can see, react to, and comment on tracks publicly. 
Premium users can send DMs.

## Current Goal (PoC)
Prove three things work together:
1. Spotify OAuth + now-playing API in React Native
2. Live multi-user location map via WebSockets
3. Track data visible on map pins when tapped

## Tech Stack (decided)
- Mobile: React Native (iOS + Android)
- Backend: Node.js + Express
- Real-time: Socket.io WebSockets
- Database: PostgreSQL
- Cloud: AWS (EC2 + RDS)
- Auth: OAuth 2.0 (Spotify first, then Apple)
- Music APIs: Spotify API (PoC), Apple Music + 
  YouTube Music (Phase 1)

## Privacy Rules (non-negotiable)
- Never store exact GPS coordinates persistently
- Fuzz location to ±50 metres before storing
- Location data lives in memory only
- Session tokens only — no persistent user ID 
  linked to location

## Code Style
- TypeScript preferred
- Functional components in React Native
- Async/await over callbacks
- Add comments explaining WHY not just WHAT
- Keep files under 200 lines where possible

## Workflow Rules
- ALWAYS create a git branch before making changes
- Keep commits atomic and focused

## Project Structure
/client    → React Native app
/server    → Node.js + Express backend
/shared    → Types shared between client/server
```

---

## 🚀 The PoC Build — Give Claude Code These Prompts in Order

Work through these one at a time. Don't move to the next until the current one is working.

**Step 1 — Scaffold the project**
```
Set up a monorepo for a React Native app called Radii.
Create a /client folder with a new React Native + TypeScript 
project, and a /server folder with a Node.js + Express + 
TypeScript backend. Add a /shared folder for types.
Include a basic README and .gitignore. 
Don't build any features yet, just the clean structure.
```

**Step 2 — Spotify integration**
```
In the /client React Native app, implement Spotify OAuth 2.0 
login using the PKCE flow. After login, poll the Spotify 
/me/player/currently-playing endpoint every 30 seconds and 
display the track name, artist, and album art on a simple 
screen. Handle the case where nothing is playing gracefully.
```

**Step 3 — Live location map**
```
In the /server, set up a Socket.io WebSocket server. 
Create a /location namespace where clients can emit their 
current GPS position every 15 seconds. The server should 
hold all active user positions in memory (not in the DB) 
and broadcast the full list to all connected clients.
In /client, add a React Native Maps screen that shows all 
connected users as pins, updating in real time.
IMPORTANT: fuzz each GPS coordinate by a random ±50 metre 
offset before broadcasting — never use exact coordinates.
```

**Step 4 — Attach music to map pins**
```
Combine Steps 2 and 3. When a user is connected to the 
WebSocket and has an active Spotify session, attach their 
currently playing track (name + artist + album art URL) 
to their location payload. 
On the map, when a user taps a pin, show a bottom sheet 
with the track info. Add a reaction button (emoji picker 
with 👍 🔥 ❤️ 🎵) that emits a reaction event to the server.
```

**Step 5 — Public comments**
```
Add a comment thread to each pin's bottom sheet. 
Comments are public and visible to all users within 
500 metres of the pin. Store comments in PostgreSQL 
with: id, anonymous_session_id, pin_id, text, 
created_at. Comments expire after 24 hours.
No real names or user IDs should be visible in comments.


