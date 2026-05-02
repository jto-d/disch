import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { env } from "./lib/env.js";
import { voterRouter } from "./routes/voter.js";
import { marketsRouter } from "./routes/markets.js";
import { attendeesRouter } from "./routes/attendees.js";
import { adminRouter } from "./routes/admin.js";

const app = express();

app.use(express.json({ limit: "32kb" }));
app.use(cookieParser(env.COOKIE_SECRET));

// CORS — only relevant when client is served from a different origin in dev or
// split deployments. Keep credentials on for cookies.
const allowedOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/voter", voterRouter);
app.use("/api/markets", marketsRouter);
app.use("/api/attendees", attendeesRouter);
app.use("/api/admin", adminRouter);

// Same-origin static serving in production.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Error handler (last).
app.use(((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("[server error]", err);
  res
    .status(500)
    .json({ error: "internal_error", message: "Something went wrong on the server" });
}) as express.ErrorRequestHandler);

// Bind explicitly to 0.0.0.0 — Node's default can be IPv6-only on some
// container runtimes (including some Cloud Run images), which makes the
// IPv4 startup probe time out.
app.listen(env.PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`disch server listening on 0.0.0.0:${env.PORT}`);
});
