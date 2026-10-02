import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// Persisted user preferences shared by the app and the widgets
// ==========================================

const FONT_SIZE_KEY = '@user_font_size';
const HAPTICS_KEY = '@user_haptics_enabled';

/** Text sizes offered in Settings; 22 is the default. */
export const FONT_SIZE_OPTIONS = [18, 22, 26, 30] as const;
export const DEFAULT_FONT_SIZE = 22;

export const loadFontSize = async (): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(FONT_SIZE_KEY);
    const value = raw ? Number(raw) : NaN;
    return (FONT_SIZE_OPTIONS as readonly number[]).includes(value) ? value : DEFAULT_FONT_SIZE;
  } catch (e) {
    return DEFAULT_FONT_SIZE;
  }
};

export const saveFontSize = async (size: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(FONT_SIZE_KEY, String(size));
  } catch (e) {}
};

export const loadHapticsEnabled = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(HAPTICS_KEY)) !== 'false';
  } catch (e) {
    return true;
  }
};

export const saveHapticsEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAPTICS_KEY, String(enabled));
  } catch (e) {}
};

/**
 * Widget text scale for the app's font size: 18 → 0.9, 22 → 1, 26 → 1.15, 30 → 1.3.
 * Widgets switch to a "large text" layout (fewer decorations) above 1.
 */
export const widgetTextScaleFor = (fontSize: number): number => {
  switch (fontSize) {
    case 18: return 0.9;
    case 26: return 1.15;
    case 30: return 1.3;
    default: return 1;
  }
};

export const loadWidgetTextScale = async (): Promise<number> => widgetTextScaleFor(await loadFontSize());
