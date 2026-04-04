// export type ThemeColors = {
//   background: string;
//   card: string;
//   cardBorder: string;
//   text: string;
//   subtext: string;
//   border: string;
//   primary: string;
//   primaryLight: string;
//   inputBg: string;
//   tabBar: string;
//   tabBarPill: string;
//   tabBarIcon: string;
//   overlay: string; // Deprecated, use specific overlays below
//   overlayLight: string;
//   overlayMedium: string;
//   overlayDark: string;
//   seatAvailable: string;
//   seatSelected: string;
//   seatReserved: string;
//   seatBooked: string;
//   // Feedback
//   success: string;
//   error: string;
//   warning: string;
//   // Base
//   white: string;
//   black: string;
//   transparent: string;
//   shadow: string;
// };

// export const Colors: { light: ThemeColors; dark: ThemeColors } = {
//   light: {
//     background: "#FFFFFF",
//     card: "#F8FAFC",
//     cardBorder: "#F1F5F9",
//     text: "#0F172A",
//     subtext: "#64748B",
//     border: "#E2E8F0",
//     primary: "#0286FF",
//     primaryLight: "rgba(2,134,255,0.10)",
//     inputBg: "#F8FAFC",
//     tabBar: "#F1F5F9",
//     tabBarPill: "#FFFFFF",
//     tabBarIcon: "#64748B",
//     overlay: "rgba(0,0,0,0.04)",
//     overlayLight: "rgba(0,0,0,0.1)",
//     overlayMedium: "rgba(0,0,0,0.4)",
//     overlayDark: "rgba(0,0,0,0.6)",
//     seatAvailable: "#E2E8F0",
//     seatSelected: "#0286FF",
//     seatReserved: "#F59E0B",
//     seatBooked: "#EF4444",
//     success: "#22C55E",
//     error: "#EF4444",
//     warning: "#F59E0B",
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#000000",
//   },
//   dark: {
//     background: "#0F172A",
//     card: "#1E293B",
//     cardBorder: "#334155",
//     text: "#F1F5F9",
//     subtext: "#94A3B8",
//     border: "#334155",
//     primary: "#0286FF",
//     primaryLight: "rgba(2,134,255,0.18)",
//     inputBg: "#1E293B",
//     tabBar: "#1E293B",
//     tabBarPill: "#0F172A",
//     tabBarIcon: "#64748B",
//     overlay: "rgba(0,0,0,0.30)",
//     overlayLight: "rgba(0,0,0,0.2)",
//     overlayMedium: "rgba(0,0,0,0.5)",
//     overlayDark: "rgba(0,0,0,0.8)",
//     seatAvailable: "#334155",
//     seatSelected: "#0286FF",
//     seatReserved: "#D97706",
//     seatBooked: "#DC2626",
//     success: "#22C55E",
//     error: "#EF4444",
//     warning: "#F59E0B",
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#000000",
//   },
// };

// 2 blue/cyan theme

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
  overlay: string; // Deprecated, use specific overlays below
  overlayLight: string;
  overlayMedium: string;
  overlayDark: string;
  seatAvailable: string;
  seatSelected: string;
  seatReserved: string;
  seatBooked: string;
  // Feedback
  success: string;
  error: string;
  warning: string;
  // Base
  white: string;
  black: string;
  transparent: string;
  shadow: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#F9FAFB",
    card: "#FFFFFF",
    cardBorder: "#E5E7EB",

    text: "#111827",
    subtext: "#6B7280",
    border: "#E5E7EB",

    primary: "#2563EB",
    primaryLight: "rgba(37,99,235,0.10)",

    inputBg: "#F3F4F6",

    tabBar: "#FFFFFF",
    tabBarPill: "#F3F4F6",
    tabBarIcon: "#6B7280",

    overlay: "rgba(0,0,0,0.04)",
    overlayLight: "rgba(0,0,0,0.08)",
    overlayMedium: "rgba(0,0,0,0.35)",
    overlayDark: "rgba(0,0,0,0.6)",

    seatAvailable: "#E5E7EB",
    seatSelected: "#2563EB",
    seatReserved: "#F59E0B",
    seatBooked: "#EF4444",

    success: "#16A34A",
    error: "#DC2626",
    warning: "#D97706",

    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
    shadow: "#000000",
  },

  dark: {
    background: "#0B0F19",
    card: "#121826",
    cardBorder: "#1F2937",

    text: "#E5E7EB",
    subtext: "#9CA3AF",
    border: "#1F2937",

    primary: "#3B82F6",
    primaryLight: "rgba(59,130,246,0.18)",

    inputBg: "#111827",

    tabBar: "#0F172A",
    tabBarPill: "#1E293B",
    tabBarIcon: "#6B7280",

    overlay: "rgba(0,0,0,0.35)",
    overlayLight: "rgba(0,0,0,0.2)",
    overlayMedium: "rgba(0,0,0,0.55)",
    overlayDark: "rgba(0,0,0,0.85)",

    seatAvailable: "#1F2937",
    seatSelected: "#3B82F6",
    seatReserved: "#F59E0B",
    seatBooked: "#EF4444",

    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",

    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
    shadow: "#000000",
  },
};


// // 3 amber/gold theme

// export type ThemeColors = {
//   background: string;
//   card: string;
//   cardBorder: string;
//   text: string;
//   subtext: string;
//   border: string;
//   primary: string;
//   primaryLight: string;
//   inputBg: string;
//   tabBar: string;
//   tabBarPill: string;
//   tabBarIcon: string;
//   overlay: string;
//   overlayLight: string;
//   overlayMedium: string;
//   overlayDark: string;
//   seatAvailable: string;
//   seatSelected: string;
//   seatReserved: string;
//   seatBooked: string;
//   success: string;
//   error: string;
//   warning: string;
//   white: string;
//   black: string;
//   transparent: string;
//   shadow: string;
// };

// export const Colors: { light: ThemeColors; dark: ThemeColors } = {
//   light: {
//     // ── Surfaces ──
//     background: "#FFFDF7",   // warm ivory white
//     card: "#FFF8EE",   // soft honey cream
//     cardBorder: "#F0DFB8",   // warm straw
//     inputBg: "#FFF8EE",

//     // ── Typography ──
//     text: "#1C1400",   // deep warm black
//     subtext: "#8A7148",   // muted gold-brown

//     // ── Lines ──
//     border: "#E8D5A8",   // light gold border

//     // ── Brand ──
//     primary: "#D97706",   // amber-600 — rich & legible
//     primaryLight: "rgba(217,119,6,0.10)",

//     // ── Tab bar ──
//     tabBar: "#FFF3D6",   // warm parchment
//     tabBarPill: "#FFFFFF",
//     tabBarIcon: "#8A7148",

//     // ── Overlays ──
//     overlay: "rgba(28,20,0,0.04)",
//     overlayLight: "rgba(28,20,0,0.10)",
//     overlayMedium: "rgba(28,20,0,0.40)",
//     overlayDark: "rgba(28,20,0,0.70)",

//     // ── Seats ──
//     seatAvailable: "#E8D5A8",  // warm beige
//     seatSelected: "#D97706",  // amber
//     seatReserved: "#A855F7",  // violet — clearly distinct from amber
//     seatBooked: "#EF4444",  // red

//     // ── Feedback ──
//     success: "#16A34A",
//     error: "#DC2626",
//     warning: "#D97706",

//     // ── Base ──
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#1C1400",
//   },

//   dark: {
//     // ── Surfaces ──
//     background: "#18120A",   // deep warm charcoal — NOT cold navy
//     card: "#241C0E",   // rich espresso
//     cardBorder: "#3D3018",   // dark gold rim
//     inputBg: "#241C0E",

//     // ── Typography ──
//     text: "#FDF8EE",   // warm off-white — easier on eyes than pure white
//     subtext: "#B89A60",   // muted antique gold

//     // ── Lines ──
//     border: "#3D3018",

//     // ── Brand ──
//     primary: "#F59E0B",   // amber-400 — brighter for dark bg legibility
//     primaryLight: "rgba(245,158,11,0.18)",

//     // ── Tab bar ──
//     tabBar: "#241C0E",
//     tabBarPill: "#18120A",
//     tabBarIcon: "#8A7148",

//     // ── Overlays ──
//     overlay: "rgba(0,0,0,0.30)",
//     overlayLight: "rgba(0,0,0,0.20)",
//     overlayMedium: "rgba(0,0,0,0.55)",
//     overlayDark: "rgba(0,0,0,0.85)",

//     // ── Seats ──
//     seatAvailable: "#3D3018",  // dark warm tone
//     seatSelected: "#F59E0B",  // bright amber
//     seatReserved: "#A855F7",  // violet
//     seatBooked: "#EF4444",  // red

//     // ── Feedback ──
//     success: "#22C55E",
//     error: "#EF4444",
//     warning: "#F59E0B",

//     // ── Base ──
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#000000",
//   },
// };



// // purple/violet theme

// export type ThemeColors = {
//   background: string;
//   card: string;
//   cardBorder: string;
//   text: string;
//   subtext: string;
//   border: string;
//   primary: string;
//   primaryLight: string;
//   inputBg: string;
//   tabBar: string;
//   tabBarPill: string;
//   tabBarIcon: string;
//   overlay: string;
//   overlayLight: string;
//   overlayMedium: string;
//   overlayDark: string;
//   seatAvailable: string;
//   seatSelected: string;
//   seatReserved: string;
//   seatBooked: string;
//   success: string;
//   error: string;
//   warning: string;
//   white: string;
//   black: string;
//   transparent: string;
//   shadow: string;
// };

// export const Colors: { light: ThemeColors; dark: ThemeColors } = {
//   light: {
//     // ── Surfaces ──
//     background: "#FAFAFE",   // near-white with a faint violet tint
//     card: "#F3F0FB",   // soft lavender card
//     cardBorder: "#E0D9F5",   // muted violet rim
//     inputBg: "#F3F0FB",

//     // ── Typography ──
//     text: "#12082E",   // deep purple-black
//     subtext: "#7B6EA6",   // muted violet-gray

//     // ── Lines ──
//     border: "#DDD6F3",   // light lavender border

//     // ── Brand ──
//     primary: "#7C3AED",   // violet-600 — rich, legible on white
//     primaryLight: "rgba(124,58,237,0.10)",

//     // ── Tab bar ──
//     tabBar: "#EDE9FA",   // lavender parchment
//     tabBarPill: "#FFFFFF",
//     tabBarIcon: "#7B6EA6",

//     // ── Overlays ──
//     overlay: "rgba(18,8,46,0.04)",
//     overlayLight: "rgba(18,8,46,0.10)",
//     overlayMedium: "rgba(18,8,46,0.40)",
//     overlayDark: "rgba(18,8,46,0.70)",

//     // ── Seats ──
//     seatAvailable: "#DDD6F3",  // soft lavender
//     seatSelected: "#7C3AED",  // violet
//     seatReserved: "#F59E0B",  // amber — clearly distinct from violet
//     seatBooked: "#EF4444",  // red

//     // ── Feedback ──
//     success: "#16A34A",
//     error: "#DC2626",
//     warning: "#D97706",

//     // ── Base ──
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#12082E",
//   },

//   dark: {
//     // ── Surfaces ──
//     background: "#0D0818",   // deep cosmic purple-black
//     card: "#170F2E",   // dark violet surface
//     cardBorder: "#2E1F5E",   // purple rim
//     inputBg: "#170F2E",

//     // ── Typography ──
//     text: "#F0ECFF",   // warm violet-tinted off-white
//     subtext: "#9D8EC7",   // muted mid-violet

//     // ── Lines ──
//     border: "#2E1F5E",

//     // ── Brand ──
//     primary: "#A78BFA",   // violet-400 — bright enough for dark bg
//     primaryLight: "rgba(167,139,250,0.18)",

//     // ── Tab bar ──
//     tabBar: "#170F2E",
//     tabBarPill: "#0D0818",
//     tabBarIcon: "#6B5FA0",

//     // ── Overlays ──
//     overlay: "rgba(0,0,0,0.30)",
//     overlayLight: "rgba(0,0,0,0.20)",
//     overlayMedium: "rgba(0,0,0,0.55)",
//     overlayDark: "rgba(0,0,0,0.85)",

//     // ── Seats ──
//     seatAvailable: "#2E1F5E",  // dark purple tone
//     seatSelected: "#A78BFA",  // bright violet
//     seatReserved: "#F59E0B",  // amber — distinct from violet
//     seatBooked: "#EF4444",  // red

//     // ── Feedback ──
//     success: "#22C55E",
//     error: "#EF4444",
//     warning: "#F59E0B",

//     // ── Base ──
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#000000",
//   },
// };


// // Rose/Pink theme

// export type ThemeColors = {
//   background: string;
//   card: string;
//   cardBorder: string;
//   text: string;
//   subtext: string;
//   border: string;
//   primary: string;
//   primaryLight: string;
//   inputBg: string;
//   tabBar: string;
//   tabBarPill: string;
//   tabBarIcon: string;
//   overlay: string;
//   overlayLight: string;
//   overlayMedium: string;
//   overlayDark: string;
//   seatAvailable: string;
//   seatSelected: string;
//   seatReserved: string;
//   seatBooked: string;
//   success: string;
//   error: string;
//   warning: string;
//   white: string;
//   black: string;
//   transparent: string;
//   shadow: string;
// };

// export const Colors: { light: ThemeColors; dark: ThemeColors } = {
//   light: {
//     // ── Surfaces ──
//     background: "#FFFBFC",   // barely-there rose white
//     card: "#FFF0F3",   // soft blush card
//     cardBorder: "#FCCDD7",   // rose petal rim
//     inputBg: "#FFF0F3",

//     // ── Typography ──
//     text: "#1A0610",   // deep rose-black
//     subtext: "#9D6070",   // muted rose-mauve

//     // ── Lines ──
//     border: "#F9C0CC",   // light blush border

//     // ── Brand ──
//     primary: "#E11D48",   // rose-600 — vivid, legible on white
//     primaryLight: "rgba(225,29,72,0.10)",

//     // ── Tab bar ──
//     tabBar: "#FDE8ED",   // blush parchment
//     tabBarPill: "#FFFFFF",
//     tabBarIcon: "#9D6070",

//     // ── Overlays ──
//     overlay: "rgba(26,6,16,0.04)",
//     overlayLight: "rgba(26,6,16,0.10)",
//     overlayMedium: "rgba(26,6,16,0.40)",
//     overlayDark: "rgba(26,6,16,0.70)",

//     // ── Seats ──
//     seatAvailable: "#FCCDD7",  // soft rose
//     seatSelected: "#E11D48",  // vivid rose
//     seatReserved: "#F59E0B",  // amber — clearly distinct
//     seatBooked: "#6D28D9",  // violet — distinct from both

//     // ── Feedback ──
//     success: "#16A34A",
//     error: "#DC2626",
//     warning: "#D97706",

//     // ── Base ──
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#1A0610",
//   },

//   dark: {
//     // ── Surfaces ──
//     background: "#120608",   // deep rose-tinted black
//     card: "#1F0C12",   // dark crimson surface
//     cardBorder: "#3D1520",   // muted rose rim
//     inputBg: "#1F0C12",

//     // ── Typography ──
//     text: "#FFF0F3",   // rose-tinted off-white — warm on the eyes
//     subtext: "#C47D8E",   // dusty rose

//     // ── Lines ──
//     border: "#3D1520",

//     // ── Brand ──
//     primary: "#FB7185",   // rose-400 — bright & readable on dark bg
//     primaryLight: "rgba(251,113,133,0.18)",

//     // ── Tab bar ──
//     tabBar: "#1F0C12",
//     tabBarPill: "#120608",
//     tabBarIcon: "#7A3F50",

//     // ── Overlays ──
//     overlay: "rgba(0,0,0,0.30)",
//     overlayLight: "rgba(0,0,0,0.20)",
//     overlayMedium: "rgba(0,0,0,0.55)",
//     overlayDark: "rgba(0,0,0,0.85)",

//     // ── Seats ──
//     seatAvailable: "#3D1520",  // dark rose tone
//     seatSelected: "#FB7185",  // bright rose
//     seatReserved: "#F59E0B",  // amber
//     seatBooked: "#A78BFA",  // violet

//     // ── Feedback ──
//     success: "#22C55E",
//     error: "#EF4444",
//     warning: "#F59E0B",

//     // ── Base ──
//     white: "#FFFFFF",
//     black: "#000000",
//     transparent: "transparent",
//     shadow: "#000000",
//   },
// };
