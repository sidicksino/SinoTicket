import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Colors, ThemeColors } from "@/constants/colors";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
};

const THEME_STORAGE_KEY = "sinoticket_theme"; // SecureStore keys are just strings

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  colors: Colors.light,
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(deviceScheme === "dark" ? "dark" : "light");
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setTheme(saved);
        }
      } catch (e) {
        console.error("Error loading theme:", e);
      } finally {
        setLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      SecureStore.setItemAsync(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  const colors = Colors[theme];
  const isDark = theme === "dark";

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

