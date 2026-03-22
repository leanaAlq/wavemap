# RADII — Brand Guidelines for Claude Code

> This file defines the Radii visual identity, design system, and tone of voice.
> Claude Code must reference this file when building any UI component, screen, or style.
> Never deviate from these guidelines without explicit instruction.

---

## 1. Brand Identity

**Product name:** Radii  
**Tagline:** Discover the music around you.  
**Type:** Mobile-first social app (React Native, iOS + Android)  
**Audience:** 16–30 year olds, urban, music-native, Gen Z  
**Brand personality:** Warm, alive, proximate, social — NOT corporate, cold, or minimal  
**Feel adjacent to:** Spotify (bold, music-first) × Snapchat (location-playful) × Duolingo (warm, character-driven)

---

## 2. Colour Palette

### Primary Colours — use these everywhere

```
DARK_BG       #1A0A2E   /* Primary background — dark navy purple */
DARK_SURFACE  #2D1B5E   /* Cards, sheets, elevated surfaces */
PURPLE        #7C3AED   /* Primary brand colour — CTAs, highlights, active states */
PURPLE_MID    #A78BFA   /* Secondary — gradients, icons, subtle accents */
PURPLE_LIGHT  #F5F0FF   /* Light backgrounds, input fields (light mode only) */
```

### Accent Colours — use sparingly for variety and energy

```
PINK          #DB2777   /* Energy, reactions, premium badge, notifications */
PINK_LIGHT    #FDF2F8   /* Light pink backgrounds */
AMBER         #D97706   /* Warnings, WIP states, venue/artist pins */
AMBER_LIGHT   #FFFBEB   /* Amber light backgrounds */
TEAL          #0891B2   /* Success states, API connected, online indicator */
TEAL_LIGHT    #F0FDFF   /* Teal light backgrounds */
INDIGO        #4F46E5   /* Premium tier, DM feature, upgrade prompts */
```

### Neutral Colours

```
WHITE         #FFFFFF
GREY_100      #F9FAFB
GREY_200      #F3F4F6
GREY_400      #9CA3AF   /* Placeholder text, disabled states */
GREY_600      #4B5563   /* Secondary text */
TEXT          #1F1535   /* Primary text on light backgrounds */
```

### Gradient — use on hero elements, map pins, and the app icon

```
Brand gradient: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)
Dark gradient:  linear-gradient(135deg, #1A0A2E 0%, #2D1B5E 100%)
```

### Implementation in React Native StyleSheet

```javascript
export const Colors = {
  darkBg:       '#1A0A2E',
  darkSurface:  '#2D1B5E',
  purple:       '#7C3AED',
  purpleMid:    '#A78BFA',
  purpleLight:  '#F5F0FF',
  pink:         '#DB2777',
  pinkLight:    '#FDF2F8',
  amber:        '#D97706',
  amberLight:   '#FFFBEB',
  teal:         '#0891B2',
  tealLight:    '#F0FDFF',
  indigo:       '#4F46E5',
  white:        '#FFFFFF',
  grey100:      '#F9FAFB',
  grey200:      '#F3F4F6',
  grey400:      '#9CA3AF',
  grey600:      '#4B5563',
  text:         '#1F1535',
};
```

---

## 3. Typography

### Font Family
- **Primary font:** System font stack — `'SF Pro Display'` on iOS, `'Roboto'` on Android
- Use `fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'`
- For headings only, prefer bold weight; never use thin or light weights

### Type Scale

```javascript
export const Typography = {
  hero:    { fontSize: 36, fontWeight: '800', lineHeight: 44, letterSpacing: -0.5 },
  h1:      { fontSize: 28, fontWeight: '700', lineHeight: 36, letterSpacing: -0.3 },
  h2:      { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3:      { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body:    { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMed: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  small:   { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  tiny:    { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  label:   { fontSize: 12, fontWeight: '600', lineHeight: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
};
```

### Rules
- **Hero text and app name:** Always bold (800), always PURPLE or WHITE
- **Section labels:** Use `label` style — uppercase, wide tracking
- **Body copy:** Never below 14px on mobile
- **Never use italic** except for placeholder text in inputs

---

## 4. Spacing & Layout

```javascript
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  screen: 20,   /* Standard horizontal screen padding */
};
```

### Layout Rules
- **Screen padding:** 20px horizontal on all screens
- **Card padding:** 16px internal padding minimum
- **Stack gap between elements:** 12px default, 8px compact, 24px section gap
- **Bottom tab bar:** always account for safe area insets
- **Map screen:** NO horizontal padding — the map fills edge to edge

---

## 5. Component Design System

### Buttons

```javascript
// PRIMARY button — use for main CTAs
{
  backgroundColor: '#7C3AED',       // PURPLE
  borderRadius: 14,
  paddingVertical: 14,
  paddingHorizontal: 24,
  // Text: white, fontWeight 700, fontSize 16
}

// GRADIENT button — use for premium / upgrade CTAs only
// Apply LinearGradient: ['#7C3AED', '#DB2777'] at 135deg

// SECONDARY button — outlined
{
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: '#7C3AED',
  borderRadius: 14,
  // Text: PURPLE, fontWeight 600
}

// GHOST button — text only, no border
{
  // Text: PURPLE_MID, fontWeight 500
}

// DANGER button — destructive actions
{
  backgroundColor: '#DB2777',       // PINK
  borderRadius: 14,
}

// PREMIUM badge — small inline tag
{
  backgroundColor: '#4F46E5',       // INDIGO
  borderRadius: 6,
  paddingVertical: 3,
  paddingHorizontal: 8,
  // Text: white, label style, "PREMIUM"
}
```

### Cards & Surfaces

```javascript
// Standard card — dark theme
{
  backgroundColor: '#2D1B5E',       // DARK_SURFACE
  borderRadius: 16,
  padding: 16,
  // Shadow: subtle, colour-tinted
  shadowColor: '#7C3AED',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 4,                     // Android
}

// Bottom sheet / modal
{
  backgroundColor: '#2D1B5E',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  // Always include drag handle at top: 40x4px, rounded, GREY_400
}
```

### Input Fields

```javascript
{
  backgroundColor: '#2D1B5E',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#4B5563',            // GREY_600 default
  // Focus state: borderColor '#7C3AED' (PURPLE)
  paddingVertical: 12,
  paddingHorizontal: 16,
  // Text: white, fontSize 16
  // Placeholder: GREY_400
}
```

### Map Pins

```javascript
// Standard pin — free user playing music
{
  width: 48, height: 48,
  borderRadius: 24,
  backgroundColor: '#7C3AED',       // PURPLE
  borderWidth: 3,
  borderColor: '#FFFFFF',
  // Shows album art inside, circular crop
  // Shadow: PURPLE tinted, radius 8
}

// Active / selected pin — tapped by current user
{
  width: 60, height: 60,
  borderRadius: 30,
  borderColor: '#DB2777',            // PINK border when selected
  borderWidth: 3,
  // Subtle pulse animation — scale 1.0 → 1.1 → 1.0, 2s loop
}

// Premium pin — user who is premium
{
  borderColor: '#4F46E5',            // INDIGO border
}

// Empty state pin cluster
{
  backgroundColor: '#2D1B5E',
  // Show music note icon, GREY_400
}
```

### Reaction Chips (emoji reactions on pins)

```javascript
{
  backgroundColor: '#2D1B5E',
  borderRadius: 20,
  paddingVertical: 6,
  paddingHorizontal: 12,
  flexDirection: 'row',
  gap: 4,
  // Active reaction: backgroundColor PURPLE, borderWidth 1, borderColor PURPLE_MID
  // Count text: white, small style
}
```

---

## 6. Screen-by-Screen Design Direction

### Map Screen (home / main screen)
- **Background:** Full-screen map — use dark map tile style if possible (Mapbox dark or Google Maps night mode)
- **Map pins:** Circular album art, PURPLE border, white shadow
- **Top overlay:** Transparent gradient from DARK_BG — shows city name and online user count
- **Bottom overlay:** Mini now-playing bar if current user is broadcasting — DARK_SURFACE, rounded top
- **FAB (floating action button):** PURPLE, bottom right, "broadcast" icon

### Pin Bottom Sheet (tap a pin)
- **Trigger:** Tap any pin on the map
- **Style:** Bottom sheet slides up, DARK_SURFACE bg, 24px top radius
- **Content top:** Track info — album art (large, rounded 12px), track name (h2, white), artist (bodyMed, GREY_400)
- **Reactions row:** Emoji reaction chips horizontally scrollable
- **Comments section:** Public thread — each comment has anonymous avatar (PURPLE circle with initial), username "Anonymous #[number]", comment text, timestamp (tiny, GREY_400)
- **DM button:** Full-width GRADIENT button at bottom — visible only to premium users. Non-premium sees: outlined button "Unlock DMs — Go Premium"

### Onboarding / Spotify Connect
- **Background:** DARK_BG full screen
- **Hero:** Large waveform or ripple animation in PURPLE
- **Headline:** Hero style, white, centred — "Hear what's around you."
- **CTA:** GRADIENT button — "Connect Spotify"
- **Secondary:** Ghost button — "Connect Apple Music"
- **Skip / other options:** tiny, GREY_400, bottom of screen

### Premium Upgrade Screen
- **Background:** Dark gradient (DARK_BG → DARK_SURFACE)
- **Badge:** INDIGO "PREMIUM" label top centre
- **Feature list:** Each feature has a PURPLE checkmark, h3 title, small description
- **Price:** Hero-sized "£4.99/month", PURPLE_MID colour
- **CTA:** Full-width GRADIENT button — "Unlock Premium"
- **Cancel anytime:** tiny, GREY_400, below button

### Profile / Settings
- **Anonymous mode toggle:** TEAL when ON (broadcasting), GREY_400 when OFF
- **Broadcast radius slider:** PURPLE track
- **Delete my data:** PINK text, bottom of list — destructive, requires confirmation

### Empty State (no one nearby)
- **Illustration:** Softly pulsing concentric rings in PURPLE_MID, fading out
- **Headline:** h2, white — "It's quiet around here."
- **Sub:** body, GREY_400 — "Be the first to put your music on the map."
- **CTA:** PURPLE button — "Start Broadcasting"

---

## 7. Animation & Motion

- **Map pins appearing:** Scale from 0.5 → 1.0, spring animation, 300ms
- **Selected pin pulse:** Scale 1.0 → 1.08 → 1.0, loop every 2s, ease in-out
- **Bottom sheet:** Slide up from bottom, spring, 350ms
- **Reaction tap:** Scale 1.0 → 1.3 → 1.0 on the emoji, 200ms bounce
- **Loading states:** Pulsing opacity 1.0 → 0.4 → 1.0 on skeleton elements, DARK_SURFACE colour
- **Premium gradient buttons:** Subtle shimmer animation left to right, 3s loop
- **Avoid:** Excessive transitions, anything over 500ms, rotation animations

---

## 8. Iconography

- **Icon library:** Use `@expo/vector-icons` (Ionicons or Feather set)
- **Icon size:** 24px standard, 20px compact, 28px featured
- **Icon colour:** PURPLE_MID for inactive, WHITE for active, GREY_400 for disabled
- **Custom icons needed (build or source separately):**
  - Waveform / audio bars (now-playing indicator)
  - Map pin with music note
  - Premium crown / sparkle badge

---

## 9. Dark Mode

The app is **dark-first**. Light mode is not in scope for the PoC or Alpha.

All backgrounds default to DARK_BG (`#1A0A2E`). Never use white backgrounds in the main app flow.

---

## 10. Tone of Voice (for UI copy)

- **Short and direct:** "What's playing nearby." not "Discover what music is being played in your local area."
- **Warm, never corporate:** "It's quiet around here." not "No users found in your radius."
- **Playful on empty states:** Give them personality
- **Premium upsell:** Aspirational, not pushy — "Get in the room." not "Upgrade now for more features."
- **Error messages:** Honest and calm — "Couldn't connect to Spotify. Try again?" not "Error 403: Authentication failed."

---

## 11. What Claude Code Must Always Do

1. Import and use the `Colors` and `Typography` constants — never hardcode hex values inline
2. Default to dark backgrounds (`Colors.darkBg`) on all screens
3. Use `borderRadius: 14` on buttons, `borderRadius: 16` on cards, `borderRadius: 24` on bottom sheets
4. Apply PURPLE tinted shadows on all elevated elements
5. Never use pure black (`#000000`) — always use `Colors.darkBg` or `Colors.darkSurface`
6. Always account for safe area insets on screens with fixed bottom elements
7. Use the map pin design spec exactly — circular, album art, PURPLE border, white shadow
8. Gate DM button behind premium check — non-premium users see the upgrade prompt, never the DM input

---

*Last updated: March 2026 — Radii v1 Brand System*