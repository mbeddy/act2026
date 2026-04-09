import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { adminAuth } from "../middleware/adminAuth";
import { CreateTaskSchema, UpdateTaskSchema, type Task } from "../types";

const DATA_DIR = "/home/user/workspace/backend/data";
const TASKS_FILE = `${DATA_DIR}/tasks.json`;

const tasksRouter = new Hono();

async function loadTasks(): Promise<Task[]> {
  try {
    const file = Bun.file(TASKS_FILE);
    if (!(await file.exists())) return [];
    return JSON.parse(await file.text());
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  const fs = await import("node:fs/promises");
  await fs.mkdir(DATA_DIR, { recursive: true });
  await Bun.write(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// GET /api/admin/tasks
tasksRouter.get("/", adminAuth, async (c) => {
  const tasks = await loadTasks();
  return c.json({ data: { tasks } });
});

// POST /api/admin/tasks
tasksRouter.post("/", adminAuth, zValidator("json", CreateTaskSchema), async (c) => {
  const body = c.req.valid("json");
  const tasks = await loadTasks();

  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    ...body,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(task);
  await saveTasks(tasks);

  // Send email notification (non-blocking)
  import("../services/email").then(({ sendTaskAssignedEmail }) => {
    sendTaskAssignedEmail(task).catch((e) => console.error("[Email] Failed to send:", e));
  });

  return c.json({ data: { task } }, 201);
});

// PUT /api/admin/tasks/:id
tasksRouter.put("/:id", adminAuth, zValidator("json", UpdateTaskSchema), async (c) => {
  const { id } = c.req.param();
  const updates = c.req.valid("json");
  const tasks = await loadTasks();

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return c.json({ error: { message: "Task not found", code: "NOT_FOUND" } }, 404);
  }

  const existing = tasks[idx]!;
  const prevStatus = existing.status;
  const now = new Date().toISOString();

  const updated: Task = {
    ...existing,
    ...updates,
    updatedAt: now,
    completedAt: updates.status === "completed" ? now : existing.completedAt,
  };
  tasks[idx] = updated;

  await saveTasks(tasks);

  // Send email if status changed
  if (updates.status && updates.status !== prevStatus) {
    import("../services/email").then(({ sendTaskStatusEmail }) => {
      sendTaskStatusEmail({
        title: updated.title,
        assignedTo: updated.assignedTo,
        assignedToName: updated.assignedToName,
        status: updated.status,
        updatedBy: "Admin",
      }).catch((e) => console.error("[Email] Failed to send:", e));
    });
  }

  return c.json({ data: { task: updated } });
});

// DELETE /api/admin/tasks/:id
tasksRouter.delete("/:id", adminAuth, async (c) => {
  const { id } = c.req.param();
  const tasks = await loadTasks();
  const updated = tasks.filter((t) => t.id !== id);
  await saveTasks(updated);
  return new Response(null, { status: 204 });
});

export { tasksRouter };
