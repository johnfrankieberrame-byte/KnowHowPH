import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { seedIfEmpty } from "./seed";
import { apiRouter } from "./routes";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 3000;

seedIfEmpty();

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, ".."),
    });
    app.use(vite.middlewares);
  } else {
    const clientDist = path.join(__dirname, "..", "dist", "client");
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`KnowHow.ph server running at http://0.0.0.0:${port} (${isProduction ? "production" : "development"})`);
  });
}

createServer();
