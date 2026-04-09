import { z } from "zod";

// Task link schema — represents a linked dashboard item
export const TaskLinkSchema = z.object({
  type: z.enum(["programme", "operations", "kpi"]),
  sectionName: z.string().optional(),
  itemId: z.string().optional(),
  itemName: z.string().optional(),
  kpiKey: z.enum(["buyers", "delegates", "exhibitors", "sponsorship"]).optional(),
  label: z.string(),
});
export type TaskLink = z.infer<typeof TaskLinkSchema>;

// Task schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assignedTo: z.string().email(),
  assignedToName: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  dueDate: z.string(),
  status: z.enum(["pending", "in-progress", "completed", "overdue"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["outreach", "programme", "operations", "sponsorship", "logistics", "other"]),
  notes: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
  linkedTo: TaskLinkSchema.optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// Dashboard snapshot for history
export const DashboardSnapshotSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  updatedBy: z.string(),
  changeDescription: z.string(),
  state: z.unknown(), // The full dashboard state
});
export type DashboardSnapshot = z.infer<typeof DashboardSnapshotSchema>;

// Admin login
export const AdminLoginSchema = z.object({
  password: z.string(),
});

// Create task
export const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  assignedTo: z.string().email(),
  assignedToName: z.string(),
  createdBy: z.string(),
  dueDate: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["outreach", "programme", "operations", "sponsorship", "logistics", "other"]),
  notes: z.string().default(""),
  linkedTo: TaskLinkSchema.optional(),
});

// Update task
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "overdue"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
  linkedTo: TaskLinkSchema.optional(),
});
