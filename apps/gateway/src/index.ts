import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { requireSite, rateLimitMiddleware } from "./auth.js";
import { sseChat } from "./sse.js";
import { attachWS } from "./ws.js";
import analyticsRoutes from "./routes/analytics.js";
import embedConfigRoutes from "./routes/embed-config.js";

const app: express.Application = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(compression());

const noCompression = (_req:any, res:any, next:any) => {
  res.set("x-no-compression","1");
  next();
};

app.get("/health", (_req, res) => res.json({ ok: true }));

const embedPath = path.resolve(process.cwd(), "../../packages/embed/dist");
console.log("Embed static path:", embedPath);
console.log("File exists:", fs.existsSync(path.join(embedPath, "chat.v1.js")));
app.use("/embeds", express.static(embedPath));
app.use("/themes", express.static(path.resolve(process.cwd(), "public/themes")));

app.use("/v1/analytics", analyticsRoutes);
app.use("/v1/embed-config", embedConfigRoutes);

import adminRoutes from "./routes/admin.js";
app.use("/v1/admin", adminRoutes);
app.use("/admin", express.static(path.resolve(process.cwd(), "public/admin")));
app.post("/v1/chat/stream", requireSite, rateLimitMiddleware, noCompression, sseChat);

const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`Gateway running on port ${process.env.PORT || 8080}`);
  console.log(`Rate limit: ${process.env.ORG_RATE_LIMIT_QPS || 2} QPS`);
  console.log(`Daily token cap: ${process.env.ORG_DAILY_TOKEN_CAP || 200000}`);
});

attachWS(server);

export default app;
