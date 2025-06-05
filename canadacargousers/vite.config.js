import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [
    react(),
    // Custom transform for .js files with JSX
    {
      name: "load+transform-js-files-as-jsx",
      async transform(code, id) {
        if (id.endsWith(".js")) {
          return transformWithEsbuild(code, id, {
            loader: "jsx",
            jsx: "automatic", // 👈 this ensures JSX is parsed correctly
          });
        }
        return null;
      },
    },
  ],
  // Workaround for Vite before renaming .js to .jsx
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx", // Ensure esbuild understands .js as JSX
      },
    },
  },
});
