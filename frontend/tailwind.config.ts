import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olympic: {
          blue: "#0081C8",
          yellow: "#FCB131",
          black: "#000000",
          green: "#00A651",
          red: "#EE334E",
        }
      },
    },
  },
  plugins: [],
};
export default config;

