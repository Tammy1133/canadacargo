import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from 'vite-plugin-mkcert';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // mkcert(),
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
