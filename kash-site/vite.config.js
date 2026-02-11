import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for React (.jsx) build on Vercel
export default defineConfig({
  plugins: [react()],
});
