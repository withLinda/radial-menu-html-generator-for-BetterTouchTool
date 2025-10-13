import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Everforest Dark Hard
        // Backgrounds (palette1)
        ef: {
          bg0: "#1E2326", // darkest background (use this for page bg)
          bg1: "#272E33",
          bg2: "#2E383C",
          bg3: "#374145",
          bg4: "#414B50",
          bg5: "#495156",
          bg6: "#4F5B58",
          bg7: "#4C3743",
          bg8: "#493B40",
          bg9: "#45443c",
          bg10: "#3C4841",
          bg11: "#384B55",
          bg12: "#463F48",
          // Foreground & accents (palette2)
          fg: "#D3C6AA",
          red: "#E67E80",
          orange: "#E69875",
          yellow: "#DBBC7F",
          aqua: "#83C092",
          cyan: "#7FBBB3",
          purple: "#D699B6",
          // Greys
          g1: "#7A8478",
          g2: "#859289",
          g3: "#9DA9A0",
          // Statusline examples
          sl_fg: "#D3C6AA",
          sl_red: "#E67E80"
        },
      },
      boxShadow: {
        efsoft: "0 10px 30px rgba(211, 198, 170, 0.08)"
      }
    },
  },
  plugins: [],
};
export default config;
