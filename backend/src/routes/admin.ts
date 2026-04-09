import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { signAdminToken, adminAuth } from "../middleware/adminAuth";
import * as XLSX from "xlsx";

const DATA_DIR = "/home/user/workspace/backend/data";
const HISTORY_FILE = `${DATA_DIR}/dashboard-history.json`;
const STATE_FILE = `${DATA_DIR}/dashboard-state.json`;

const adminRouter = new Hono();

// POST /api/admin/login
adminRouter.post("/login", zValidator("json", z.object({ password: z.string() })), async (c) => {
  const { password } = c.req.valid("json");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== adminPassword) {
    return c.json({ error: { message: "Invalid password", code: "INVALID_PASSWORD" } }, 401);
  }
  const token = await signAdminToken();
  return c.json({ data: { token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() } });
});

// Load history helper
async function loadHistory(): Promise<unknown[]> {
  try {
    const file = Bun.file(HISTORY_FILE);
    if (!(await file.exists())) return [];
    return JSON.parse(await file.text());
  } catch {
    return [];
  }
}

// Save snapshot (exported so dashboard.ts can use it)
export async function saveSnapshot(
  state: unknown,
  updatedBy: string,
  changeDescription: string
): Promise<void> {
  const fs = await import("node:fs/promises");
  await fs.mkdir(DATA_DIR, { recursive: true });

  const history = (await loadHistory()) as unknown[];
  const snapshot = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    updatedBy,
    changeDescription,
    state,
  };

  // Keep last 100 snapshots
  const updated = [snapshot, ...history].slice(0, 100);
  await Bun.write(HISTORY_FILE, JSON.stringify(updated, null, 2));
}

// GET /api/admin/history - list snapshots (without state data for brevity)
adminRouter.get("/history", adminAuth, async (c) => {
  const history = (await loadHistory()) as Array<{
    id: string;
    timestamp: string;
    updatedBy: string;
    changeDescription: string;
    state: unknown;
  }>;
  const summaries = history.map(({ id, timestamp, updatedBy, changeDescription }) => ({
    id,
    timestamp,
    updatedBy,
    changeDescription,
  }));
  return c.json({ data: { snapshots: summaries } });
});

// GET /api/admin/history/:id - get specific snapshot
adminRouter.get("/history/:id", adminAuth, async (c) => {
  const { id } = c.req.param();
  const history = (await loadHistory()) as Array<{
    id: string;
    timestamp: string;
    updatedBy: string;
    changeDescription: string;
    state: unknown;
  }>;
  const snapshot = history.find((s) => s.id === id);
  if (!snapshot) {
    return c.json({ error: { message: "Snapshot not found", code: "NOT_FOUND" } }, 404);
  }
  return c.json({ data: { snapshot } });
});

// POST /api/admin/history/:id/restore - restore snapshot
adminRouter.post("/history/:id/restore", adminAuth, async (c) => {
  const { id } = c.req.param();
  const history = (await loadHistory()) as Array<{
    id: string;
    timestamp: string;
    updatedBy: string;
    changeDescription: string;
    state: unknown;
  }>;
  const snapshot = history.find((s) => s.id === id);
  if (!snapshot) {
    return c.json({ error: { message: "Snapshot not found", code: "NOT_FOUND" } }, 404);
  }

  const lastUpdated = new Date().toISOString();
  const stateToSave = { ...(snapshot.state as Record<string, unknown>), lastUpdated };
  await Bun.write(STATE_FILE, JSON.stringify(stateToSave, null, 2));

  // Save a snapshot of this restore action
  await saveSnapshot(stateToSave, "admin-restore", `Restored from snapshot: ${snapshot.timestamp}`);

  return c.json({ data: { success: true, lastUpdated } });
});

// DELETE /api/admin/history/:id
adminRouter.delete("/history/:id", adminAuth, async (c) => {
  const { id } = c.req.param();
  const history = (await loadHistory()) as Array<{ id: string }>;
  const updated = history.filter((s) => s.id !== id);
  await Bun.write(HISTORY_FILE, JSON.stringify(updated, null, 2));
  return new Response(null, { status: 204 });
});

// GET /api/admin/reports/export - generate Excel report
adminRouter.get("/reports/export", adminAuth, async (c) => {
  // Load current dashboard state
  let state: Record<string, unknown> = {};
  try {
    const file = Bun.file(STATE_FILE);
    if (await file.exists()) {
      state = JSON.parse(await file.text());
    }
  } catch {
    // state stays empty
  }

  // Load tasks
  let tasks: unknown[] = [];
  try {
    const tasksFile = Bun.file(`${DATA_DIR}/tasks.json`);
    if (await tasksFile.exists()) {
      tasks = JSON.parse(await tasksFile.text());
    }
  } catch {
    // tasks stays empty
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1: KPI Summary
  const kpi = (state.kpiTargets as Record<string, unknown>) || {};
  const kpiData = [
    ["Metric", "Target", "As of Date"],
    ["Total Buyers", kpi.buyers ?? "", new Date().toLocaleDateString()],
    ["Total Delegates", kpi.delegates ?? "", ""],
    ["Total Exhibitors", kpi.exhibitors ?? "", ""],
    ["Sponsorship (USD)", kpi.sponsorship ?? "", ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), "KPI Targets");

  // Sheet 2: Weekly Progress
  const weekly = (state.weeklyData as unknown[]) || [];
  const weeklyRows: (string | number)[][] = [
    ["Week", "Dates", "Buyers Reached", "Delegates Confirmed", "Exhibitors", "Sponsorship (USD)"],
  ];
  for (const w of weekly) {
    const wd = w as Record<string, unknown>;
    weeklyRows.push([
      String(wd.week ?? ""),
      String(wd.dates ?? ""),
      String(wd.buyers ?? 0),
      String(wd.delegates ?? 0),
      String(wd.exhibitors ?? 0),
      String(wd.sponsorship ?? 0),
    ]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(weeklyRows), "Weekly Progress");

  // Sheet 3: Regional Breakdown
  const regional = (state.regionalData as unknown[]) || [];
  const regionalRows: (string | number)[][] = [["Region", "Coffee", "Tea", "Total"]];
  for (const r of regional) {
    const rd = r as Record<string, unknown>;
    const coffee = Number(rd.coffee ?? 0);
    const tea = Number(rd.tea ?? 0);
    regionalRows.push([String(rd.region ?? ""), String(coffee), String(tea), String(coffee + tea)]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(regionalRows), "Regional Breakdown");

  // Sheet 4: Delegate Categories
  const delegateCats = (state.delegateCategories as unknown[]) || [];
  const delegateRows: (string | number)[][] = [
    ["Category", "Outreach", "Confirmed", "% Conversion"],
  ];
  for (const d of delegateCats) {
    const dd = d as Record<string, unknown>;
    const outreach = Number(dd.outreach ?? 0);
    const confirmed = Number(dd.confirmed ?? 0);
    const pct = outreach > 0 ? ((confirmed / outreach) * 100).toFixed(1) + "%" : "0%";
    delegateRows.push([String(dd.name ?? ""), String(outreach), String(confirmed), pct]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(delegateRows), "Delegate Categories");

  // Sheet 5: Exhibitor Categories
  const exhibitorCats = (state.exhibitorCategories as unknown[]) || [];
  const exhibitorRows: (string | number)[][] = [
    ["Category", "Outreach", "Confirmed", "% Conversion"],
  ];
  for (const e of exhibitorCats) {
    const ed = e as Record<string, unknown>;
    const outreach = Number(ed.outreach ?? 0);
    const confirmed = Number(ed.confirmed ?? 0);
    const pct = outreach > 0 ? ((confirmed / outreach) * 100).toFixed(1) + "%" : "0%";
    exhibitorRows.push([String(ed.name ?? ""), String(outreach), String(confirmed), pct]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exhibitorRows), "Exhibitor Categories");

  // Sheet 6: Sponsorship
  const sponsorship = (state.sponsorshipLevels as unknown[]) || [];
  const sponsorshipRows: (string | number)[][] = [
    ["Level", "Price (USD)", "Available Slots", "Confirmed", "Revenue (USD)"],
  ];
  for (const s of sponsorship) {
    const sd = s as Record<string, unknown>;
    const price = Number(sd.price ?? 0);
    const confirmed = Number(sd.confirmed ?? 0);
    sponsorshipRows.push([
      String(sd.name ?? ""),
      String(price),
      String(sd.quantity ?? 0),
      String(confirmed),
      String(price * confirmed),
    ]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sponsorshipRows), "Sponsorship");

  // Sheet 7: Tasks
  const taskRows: (string | number)[][] = [
    ["Title", "Category", "Priority", "Assigned To", "Status", "Due Date", "Created By", "Notes"],
  ];
  for (const t of tasks) {
    const td = t as Record<string, unknown>;
    taskRows.push([
      String(td.title ?? ""),
      String(td.category ?? ""),
      String(td.priority ?? ""),
      String(td.assignedToName ?? ""),
      String(td.status ?? ""),
      String(td.dueDate ?? ""),
      String(td.createdBy ?? ""),
      String(td.notes ?? ""),
    ]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(taskRows), "Task Summary");

  // Sheet 8: Programme Tracker
  const programSections = (state.programSections as unknown[]) || [];
  const programRows: (string | number)[][] = [
    [
      "Section",
      "Item",
      "Target",
      "Confirmed",
      "% Complete",
      "Status",
      "Owner",
      "Next Step",
      "Risk",
    ],
  ];
  for (const section of programSections) {
    const sec = section as Record<string, unknown>;
    const items = (sec.items as unknown[]) || [];
    for (const item of items) {
      const it = item as Record<string, unknown>;
      programRows.push([
        String(sec.name ?? ""),
        String(it.item ?? ""),
        String(it.target ?? ""),
        String(it.confirmed ?? ""),
        String(it.percentComplete ?? 0) + "%",
        String(it.status ?? ""),
        String(it.owner ?? ""),
        String(it.nextStep ?? ""),
        String(it.risk ?? ""),
      ]);
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(programRows), "Programme Tracker");

  // Sheet 9: Operations Tracker
  const opsSections = (state.operationsSections as unknown[]) || [];
  const opsRows: (string | number)[][] = [
    [
      "Section",
      "Item",
      "Target",
      "Confirmed",
      "% Complete",
      "Status",
      "Owner",
      "Next Step",
      "Risk",
    ],
  ];
  for (const section of opsSections) {
    const sec = section as Record<string, unknown>;
    const items = (sec.items as unknown[]) || [];
    for (const item of items) {
      const it = item as Record<string, unknown>;
      opsRows.push([
        String(sec.name ?? ""),
        String(it.item ?? ""),
        String(it.target ?? ""),
        String(it.confirmed ?? ""),
        String(it.percentComplete ?? 0) + "%",
        String(it.status ?? ""),
        String(it.owner ?? ""),
        String(it.nextStep ?? ""),
        String(it.risk ?? ""),
      ]);
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(opsRows), "Operations Tracker");

  // Generate buffer
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `expo-report-${new Date().toISOString().split("T")[0]}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});

export { adminRouter };
