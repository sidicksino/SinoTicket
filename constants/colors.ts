export type ThemeColors = {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  primaryLight: string;
  inputBg: string;
  tabBar: string;
  tabBarPill: string;
  tabBarIcon: string;
  overlay: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#FFFFFF",
    card: "#F8FAFC",
    cardBorder: "#F1F5F9",
    text: "#0F172A",
    subtext: "#64748B",
    border: "#E2E8F0",
    primary: "#0286FF",
    primaryLight: "rgba(2,134,255,0.10)",
    inputBg: "#F8FAFC",
    tabBar: "#F1F5F9",
    tabBarPill: "#FFFFFF",
    tabBarIcon: "#64748B",
    overlay: "rgba(0,0,0,0.04)",
  },
  dark: {
    background: "#0F172A",
    card: "#1E293B",
    cardBorder: "#334155",
    text: "#F1F5F9",
    subtext: "#94A3B8",
    border: "#334155",
    primary: "#0286FF",
    primaryLight: "rgba(2,134,255,0.18)",
    inputBg: "#1E293B",
    tabBar: "#1E293B",
    tabBarPill: "#0F172A",
    tabBarIcon: "#64748B",
    overlay: "rgba(0,0,0,0.30)",
  },
};
