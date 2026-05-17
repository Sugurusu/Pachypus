import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141712",
        sumi: "#20231f",
        moss: "#254233",
        leaf: "#55735b",
        washi: "#f3f0e8",
        bone: "#fbfaf6",
        stone: "#d7d6cf",
        clay: "#a66f43",
        gold: "#b99a5b"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 23, 18, 0.10)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
