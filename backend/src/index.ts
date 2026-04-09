import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { sampleRouter } from "./routes/sample";
import { dashboardRouter } from "./routes/dashboard";
import { adminRouter } from "./routes/admin";
import { tasksRouter } from "./routes/tasks";
import { logger } from "hono/logger";

const app = new Hono();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecodeapp\.com$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
  // Production: allow *.vercel.app and any custom FRONTEND_URL
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return null;
      if (allowed.some((re) => re.test(origin))) return origin;
      // Allow explicit FRONTEND_URL set via environment variable
      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
      if (frontendUrl && origin === frontendUrl) return origin;
      return null;
    },
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/sample", sampleRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/admin", adminRouter);
app.route("/api/admin/tasks", tasksRouter);

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
