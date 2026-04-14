import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Colors, ThemeColors } from "@/constants/colors";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextType = {
  theme: ResolvedTheme;
  themePreference: ThemePreference;
  colors: ThemeColors;
  setThemePreference: (mode: ThemePreference) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const THEME_STORAGE_KEY = "sinoticket_theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  themePreference: "system",
  colors: Colors.light,
  setThemePreference: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceScheme = useColorScheme() ?? "light";
  const [themePref, setThemePref] = useState<ThemePreference>("system");
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemePref(saved as ThemePreference);
        }
      } catch (e) {
        console.error("Error loading theme:", e);
      } finally {
        setLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setThemePreference = (mode: ThemePreference) => {
    setThemePref(mode);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    setThemePreference(themePref === "light" ? "dark" : themePref === "dark" ? "system" : "light");
  };

  const resolvedTheme: ResolvedTheme = themePref === "system" ? deviceScheme : themePref;
  const colors = Colors[resolvedTheme];
  const isDark = resolvedTheme === "dark";

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ 
      theme: resolvedTheme, 
      themePreference: themePref,
      colors, 
      setThemePreference, 
      toggleTheme, 
      isDark 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

