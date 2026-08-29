import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "tests/setup/server-only-stub.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
