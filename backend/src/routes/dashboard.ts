import { Hono } from "hono";
import { z } from "zod";
import { saveSnapshot } from "./admin";

const DATA_DIR = "/home/user/workspace/backend/data";
const STATE_FILE = `${DATA_DIR}/dashboard-state.json`;

const ProgramItemSchema = z.object({
  id: z.string(),
  item: z.string(),
  target: z.string(),
  confirmed: z.string(),
  percentComplete: z.number(),
  status: z.enum(["on-track", "at-risk", "behind"]),
  owner: z.string(),
  nextStep: z.string(),
  risk: z.string(),
});

const ProgramSectionSchema = z.object({
  name: z.string(),
  items: z.array(ProgramItemSchema),
});

const DashboardStateSchema = z.object({
  weeklyData: z.array(z.unknown()),
  kpiTargets: z.unknown(),
  delegateCategories: z.array(z.unknown()),
  exhibitorCategories: z.array(z.unknown()),
  sponsorshipLevels: z.array(z.unknown()),
  regionalData: z.array(z.unknown()),
  programSections: z.array(ProgramSectionSchema),
  operationsSections: z.array(ProgramSectionSchema),
  lastUpdated: z.string(),
  lastUpdatedBy: z.string(),
});

const PostBodySchema = z.object({
  state: DashboardStateSchema,
});

const dashboardRouter = new Hono();

async function ensureDataDir(): Promise<void> {
  const fs = await import("node:fs/promises");
  await fs.mkdir(DATA_DIR, { recursive: true });
}

dashboardRouter.get("/state", async (c) => {
  try {
    await ensureDataDir();
    const file = Bun.file(STATE_FILE);
    const exists = await file.exists();
    if (!exists) {
      return c.json({ data: null });
    }
    const text = await file.text();
    const state = JSON.parse(text);
    return c.json({ data: state });
  } catch {
    return c.json({ data: null });
  }
});

dashboardRouter.post("/state", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: { message: "Invalid JSON body", code: "INVALID_JSON" } }, 400);
  }

  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { state } = parsed.data;
  await ensureDataDir();
  const lastUpdated = new Date().toISOString();
  const stateToSave = { ...state, lastUpdated };
  await Bun.write(STATE_FILE, JSON.stringify(stateToSave, null, 2));

  // Save history snapshot (non-blocking)
  saveSnapshot(
    stateToSave,
    state.lastUpdatedBy || "unknown",
    "Dashboard state updated"
  ).catch((e) => console.error("[History] Failed to save snapshot:", e));

  return c.json({ data: { success: true, lastUpdated } });
});

export { dashboardRouter };
