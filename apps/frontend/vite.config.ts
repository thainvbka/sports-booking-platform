import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: "../../",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sports-booking-platform/validation": path.resolve(
        __dirname,
        "../../packages/validation/index.ts"
      ),
    },
  },
  server: {
    port: 5173,
  },
});
