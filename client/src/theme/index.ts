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

export const Typography = {
  hero:    { fontSize: 36, fontWeight: '800' as const, lineHeight: 44, letterSpacing: -0.5 },
  h1:      { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
  h2:      { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  h3:      { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  body:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMed: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  small:   { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  tiny:    { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:   { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, screen: 20,
};
