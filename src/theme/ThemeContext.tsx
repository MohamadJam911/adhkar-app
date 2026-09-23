import { createContext } from 'react';

type ThemeMode = 'auto' | 'light' | 'dark';

const ThemeContext = createContext<{
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}>({
  isDarkMode: true,
  themeMode: 'auto',
  setThemeMode: () => {},
});

export { ThemeContext };
export type { ThemeMode };
