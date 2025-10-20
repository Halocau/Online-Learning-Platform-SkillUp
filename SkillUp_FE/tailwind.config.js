import { defineConfig } from "@tailwindcss/vite";
import { fontFamily } from "tailwindcss/defaultTheme";

export default defineConfig({
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main theme colors
        primary: {
          DEFAULT: "#FF8C00", // vivid orange
          light: "#FFA733",
          dark: "#CC7000",
        },
        secondary: {
          DEFAULT: "#FFD54F", // soft yellow
          light: "#FFE082",
          dark: "#FFCA28",
        },
        accent: {
          DEFAULT: "#FFF3E0", // pale background orange
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4B4B4B",
        },
        background: {
          light: "#FFF8E1",
          DEFAULT: "#FFFFFF",
          dark: "#FDF3E7",
        },
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(255, 140, 0, 0.1)",
      },
    },
  },
  plugins: [],
});
