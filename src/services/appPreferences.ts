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

// ----- Widget text size -----
// "Automatic" (default) follows the app's text size; otherwise the user picks
// a fixed widget size in Settings.

const WIDGET_FONT_AUTO_KEY = '@widget_font_auto';
const WIDGET_FONT_SIZE_KEY = '@widget_font_size';

/** Fixed widget sizes offered in Settings when "automatic" is off. */
export const WIDGET_FONT_SIZE_OPTIONS = [22, 26, 30, 34] as const;
export const DEFAULT_WIDGET_FONT_SIZE = 22;

export type WidgetFontPreference = { auto: boolean; size: number };

export const loadWidgetFontPreference = async (): Promise<WidgetFontPreference> => {
  try {
    const [auto, size] = await Promise.all([
      AsyncStorage.getItem(WIDGET_FONT_AUTO_KEY),
      AsyncStorage.getItem(WIDGET_FONT_SIZE_KEY),
    ]);
    const value = size ? Number(size) : NaN;
    return {
      auto: auto !== 'false',
      size: (WIDGET_FONT_SIZE_OPTIONS as readonly number[]).includes(value) ? value : DEFAULT_WIDGET_FONT_SIZE,
    };
  } catch (e) {
    return { auto: true, size: DEFAULT_WIDGET_FONT_SIZE };
  }
};

export const saveWidgetFontPreference = async (pref: WidgetFontPreference): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [WIDGET_FONT_AUTO_KEY, String(pref.auto)],
      [WIDGET_FONT_SIZE_KEY, String(pref.size)],
    ]);
  } catch (e) {}
};

/**
 * Widget text scale for a text size: 18 → 0.9, 22 → 1, 26 → 1.15, 30 → 1.3, 34 → 1.45.
 * Widgets switch to a "large text" layout (fewer decorations) above 1.
 */
export const widgetTextScaleFor = (fontSize: number): number => {
  switch (fontSize) {
    case 18: return 0.9;
    case 26: return 1.15;
    case 30: return 1.3;
    case 34: return 1.45;
    default: return 1;
  }
};

/** Scale the widgets should use: the app's text size, or the fixed widget size. */
export const loadWidgetTextScale = async (): Promise<number> => {
  const pref = await loadWidgetFontPreference();
  return widgetTextScaleFor(pref.auto ? await loadFontSize() : pref.size);
};
