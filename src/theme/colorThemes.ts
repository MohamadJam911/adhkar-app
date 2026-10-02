import { BACKGROUND_STYLE } from './backgroundStyle';

// Card shadows per background option (backgroundStyle.ts):
//   classic   ← the original values
//   courtyard ← a clear warm shadow so cards float
//   girih     ← a very soft shadow (light-mode separation comes from white cards on darker beige)
const CARD_SHADOWS = {
  classic: {
    dark: {},
    light: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  },
  courtyard: {
    dark: { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
    light: { shadowColor: '#8A5E33', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  },
  girih: {
    dark: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
    light: { shadowColor: '#8A5E33', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  },
} as const;

const darkCardShadow = CARD_SHADOWS[BACKGROUND_STYLE].dark;
const lightCardShadow = CARD_SHADOWS[BACKGROUND_STYLE].light;

const heritageDarkTheme = {
  card: { backgroundColor: '#28231F', borderWidth: 1.8, borderColor: '#D4A373AA', ...darkCardShadow },
  text: { color: '#F4EADF' },
  subText: { color: '#B5A290' },
  accentText: { color: '#D4A373' },
  badge: { backgroundColor: '#3A322A' },
  counterText: { color: '#D4A373' },
  circleBtn: { backgroundColor: '#D4A373' },
  circleText: { color: '#1E1B18' },
  circleSubText: { color: '#4A3B2C' },
};

const heritageLightTheme = {
  card: { backgroundColor: '#FFFFFF', ...lightCardShadow, borderWidth: 1.8, borderColor: '#D4A373AA' },
  text: { color: '#332922' },
  subText: { color: '#7A6B5D' },
  accentText: { color: '#9E6D3B' },
  badge: { backgroundColor: '#F4ECE1' },
  counterText: { color: '#9E6D3B' },
  circleBtn: { backgroundColor: '#D4A373' },
  circleText: { color: '#FFFFFF' },
  circleSubText: { color: '#FAF6F0' },
};


export { heritageDarkTheme, heritageLightTheme };
