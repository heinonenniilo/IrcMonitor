import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ command, mode, isPreview }) => {
  const env = { ...loadEnv(mode, root, ""), ...process.env };
  const useHttps = command === "serve" && mode !== "test" && !isPreview;

  if (useHttps && (!env.SSL_CRT_FILE || !env.SSL_KEY_FILE)) {
    throw new Error("Run npm start to configure the ASP.NET Core HTTPS certificate.");
  }

  return {
    plugins: [react()],
    resolve: {
      alias: Object.fromEntries(
        fs.readdirSync(path.join(root, "src"), { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => [entry.name, path.join(root, "src", entry.name)])
      )
    },
    define: {
      // Keep the existing deployment secret compatible during migration.
      "import.meta.env.VITE_GOOGLE_APP_ID": JSON.stringify(
        env.VITE_GOOGLE_APP_ID || env.REACT_APP_GOOGLE_APP_ID || ""
      )
    },
    server: {
      strictPort: true,
      https: useHttps ? {
        cert: fs.readFileSync(env.SSL_CRT_FILE),
        key: fs.readFileSync(env.SSL_KEY_FILE)
      } : undefined,
      proxy: {
        "/weatherforecast": {
          target: "https://localhost:5001/api",
          secure: false
        }
      }
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.js"]
    }
  };
});
