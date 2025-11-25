import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    preserveSymlinks: true,
    conditions: ["typescript"],
  },
  server: {
    host: true,
    watch: {
      ignored: ["!**/eip712domains/**"],
    },
  },
  optimizeDeps: {
    exclude: ["eip712domains"],
  },
  build: {
    // commonjsOptions: {
    //   include: [/eip712domains/, /node_modules/],
    // },
  },
});
