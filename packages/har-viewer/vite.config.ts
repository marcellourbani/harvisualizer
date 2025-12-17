import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { ConfigEnv } from "vitest/config"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/HarViewer.tsx"),
      name: "HarViewer",
      fileName: (format) => `har-viewer.${format}.js`,
    },
    outDir: resolve(__dirname, "dist"), // Output to a local dist folder

    emptyOutDir: true,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    minify: false,
    sourcemap: true,
  },
  test: {
    // Add Vitest configuration
    globals: true, // This exposes describe, it, etc. globally
    environment: "jsdom", // Use jsdom for DOM-related tests
    setupFiles: "./vitest.setup.ts", // Path to your setup file
  },
})
