import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F1E8",
        paper: "#FFFDF8",
        ink: "#122117",
        moss: "#1B4332",
        sage: "#DCE8DF",
        gold: "#C8A96A",
        clay: "#B2613B",
        wine: "#8E3025"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(19, 37, 28, 0.08)",
        glow: "0 18px 48px rgba(27, 67, 50, 0.18)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top right, rgba(200,169,106,0.22), transparent 34%), radial-gradient(circle at bottom left, rgba(27,67,50,0.18), transparent 28%), linear-gradient(180deg, #faf6ef 0%, #f6f1e8 100%)"
      }
    }
  },
  plugins: []
};

export default config;
