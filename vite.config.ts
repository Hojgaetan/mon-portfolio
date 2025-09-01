import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { readFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Lire la version depuis package.json (chemin relatif au fichier config)
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
  const appVersion = pkg.version ?? '0.0.0';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    assetsInclude: ["**/*.JPG", "**/*.JPEG"],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
  };
});
