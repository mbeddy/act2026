import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminApi } from "@/lib/adminApi";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, CheckCircle2, Clock, AlertCircle, XCircle, Mail, Trash2, Filter, Link2 } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

interface ProgramItem {
  id: string;
  item: string;
  target: string;
  confirmed: string;
  percentComplete: number;
  status: "on-track" | "at-risk" | "behind";
  owner: string;
  nextStep: string;
  risk: string;
}

interface ProgramSection {
  name: string;
  items: ProgramItem[];
}

interface DashboardState {
  programSections: ProgramSection[];
  operationsSections: ProgramSection[];
  kpiTargets: {
    buyers: number;
    delegates: number;
    exhibitors: number;
    sponsorship: number;
  };
}

interface TaskLink {
  type: "programme" | "operations" | "kpi";
  sectionName?: string;
  itemId?: string;
  itemName?: string;
  kpiKey?: string;
  label: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  category: "outreach" | "programme" | "operations" | "sponsorship" | "logistics" | "other";
  notes: string;
  updatedAt: string;
  completedAt?: string;
  linkedTo?: TaskLink;
}

const linkedToSchema = z
  .object({
    type: z.enum(["programme", "operations", "kpi"]),
    sectionName: z.string().optional(),
    itemId: z.string().optional(),
    itemName: z.string().optional(),
    kpiKey: z.string().optional(),
    label: z.string(),
  })
  .optional();

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  assignedTo: z.string().email("Valid email required"),
  assignedToName: z.string().min(1, "Name is required"),
  createdBy: z.string().min(1, "Your name is required"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["outreach", "programme", "operations", "sponsorship", "logistics", "other"]),
  notes: z.string().default(""),
  linkedTo: linkedToSchema,
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#7B6B58", bg: "#F5F0EB", icon: Clock },
  "in-progress": { label: "In Progress", color: "#C8A42A", bg: "#FFF8E7", icon: AlertCircle },
  completed: { label: "Completed", color: "#8DB53C", bg: "#F0F7E8", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "#DC2626", bg: "#FEF2F2", icon: XCircle },
} as const;

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#7B6B58" },
  medium: { label: "Medium", color: "#C8A42A" },
  high: { label: "High", color: "#F97316" },
  urgent: { label: "Urgent", color: "#DC2626" },
} as const;

const KPI_OPTIONS: { key: string; label: string }[] = [
  { key: "buyers", label: "Buyers Target" },
  { key: "delegates", label: "Delegates Target" },
  { key: "exhibitors", label: "Exhibitors Target" },
  { key: "sponsorship", label: "Sponsorship Target" },
];

export function TaskManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [justCreated, setJustCreated] = useState(false);
  const queryClient = useQueryClient();

  // Link state for the create form
  const [linkType, setLinkType] = useState<"none" | "programme" | "operations" | "kpi">("none");
  const [linkSection, setLinkSection] = useState<string>("");
  const [linkItem, setLinkItem] = useState<string>("");
  const [linkKpi, setLinkKpi] = useState<string>("");

  const resetLinkState = () => {
    setLinkType("none");
    setLinkSection("");
    setLinkItem("");
    setLinkKpi("");
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tasks"],
    queryFn: () => adminApi.get<{ tasks: Task[] }>("/api/admin/tasks"),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard", "state"],
    queryFn: () => api.get<DashboardState>("/api/dashboard/state"),
    staleTime: 5 * 60 * 1000,
  });

  const buildLinkedTo = (): TaskLink | undefined => {
    if (linkType === "none") return undefined;
    if (linkType === "kpi") {
      const kpiOption = KPI_OPTIONS.find((o) => o.key === linkKpi);
      if (!kpiOption) return undefined;
      return { type: "kpi", kpiKey: linkKpi, label: `KPI › ${kpiOption.label}` };
    }
    // programme or operations
    const sections =
      linkType === "programme"
        ? dashboardData?.programSections ?? []
        : dashboardData?.operationsSections ?? [];
    const section = sections.find((s) => s.name === linkSection);
    if (!section) return undefined;
    const item = section.items.find((it) => it.id === linkItem);
    if (!item) return undefined;
    return {
      type: linkType,
      sectionName: linkSection,
      itemId: item.id,
      itemName: item.item,
      label: `${linkSection} › ${item.item}`,
    };
  };

  const createMutation = useMutation({
    mutationFn: (body: CreateTaskForm & { linkedTo?: TaskLink }) =>
      adminApi.post<{ task: Task }>("/api/admin/tasks", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
      setShowCreate(false);
      setJustCreated(true);
      setTimeout(() => setJustCreated(false), 4000);
      form.reset();
      resetLinkState();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.put<{ task: Task }>(`/api/admin/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/admin/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
      setDeleteId(null);
    },
  });

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { priority: "medium", category: "other", notes: "", description: "" },
  });

  const onSubmit = (formData: CreateTaskForm) => {
    const linkedTo = buildLinkedTo();
    const payload = { ...formData, linkedTo };
    createMutation.mutate(payload);
  };

  const allTasks = data?.tasks ?? [];

  const tasks = allTasks.map((t) => ({
    ...t,
    status:
      t.status !== "completed" && t.status !== "overdue" && isPast(parseISO(t.dueDate))
        ? ("overdue" as const)
        : t.status,
  }));

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  // Sections available for linking
  const programmeSections = dashboardData?.programSections ?? [];
  const operationsSections = dashboardData?.operationsSections ?? [];
  const activeSections = linkType === "programme" ? programmeSections : operationsSections;
  const activeSectionItems =
    activeSections.find((s) => s.name === linkSection)?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#4A3728" }}>
            Task Management
          </h2>
          <p className="text-sm text-gray-500">Assign and track tasks with email notifications</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="text-white"
          style={{ background: "#4A3728" }}
        >
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      {justCreated ? (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: "#F0F7E8", color: "#4A6B1C" }}
        >
          <Mail className="w-4 h-4" />
          Task created! Email notification sent to the assignee.
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "#4A3728" },
          { label: "Pending", value: stats.pending, color: "#7B6B58" },
          { label: "In Progress", value: stats.inProgress, color: "#C8A42A" },
          { label: "Completed", value: stats.completed, color: "#8DB53C" },
          { label: "Overdue", value: stats.overdue, color: "#DC2626" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4 text-center bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-8 w-8 border-2"
            style={{ borderColor: "#8DB53C", borderTopColor: "transparent" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border-2 border-dashed"
          style={{ borderColor: "#7B6B58", color: "#7B6B58" }}
        >
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1 opacity-70">Create a new task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const statusCfg = STATUS_CONFIG[task.status];
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={task.id}
                className="rounded-xl border p-4 bg-white hover:shadow-sm transition-shadow"
                style={{ borderColor: "#E8E0D8" }}
              >
                <div className="flex items-start gap-4">
                  <StatusIcon
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: statusCfg.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-medium" style={{ color: "#4A3728" }}>
                          {task.title}
                        </p>
                        {task.description ? (
                          <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                        ) : null}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: PRIORITY_CONFIG[task.priority].color + "20",
                            color: PRIORITY_CONFIG[task.priority].color,
                          }}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: statusCfg.bg, color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>
                        {task.assignedToName} ({task.assignedTo})
                      </span>
                      <span>Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
                      <span className="capitalize">{task.category}</span>
                    </div>
                    {task.notes ? (
                      <p className="mt-2 text-xs text-gray-400 italic">{task.notes}</p>
                    ) : null}
                    {task.linkedTo ? (
                      <div className="mt-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
                          style={{
                            background: "#FAF7F2",
                            borderColor: "#E8E0D8",
                            color: "#4A3728",
                          }}
                        >
                          <Link2 className="w-3 h-3" />
                          {task.linkedTo.label}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Select
                      value={task.status}
                      onValueChange={(v) =>
                        updateStatusMutation.mutate({ id: task.id, status: v })
                      }
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(task.id)}
                      className="h-8 w-8 p-0 text-red-400 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) resetLinkState();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input {...form.register("title")} placeholder="Task title" className="mt-1" />
              {form.formState.errors.title ? (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
              ) : null}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                {...form.register("description")}
                placeholder="Task details..."
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Assignee Name *</Label>
                <Input
                  {...form.register("assignedToName")}
                  placeholder="Full name"
                  className="mt-1"
                />
                {form.formState.errors.assignedToName ? (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.assignedToName.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Assignee Email *</Label>
                <Input
                  {...form.register("assignedTo")}
                  type="email"
                  placeholder="email@example.com"
                  className="mt-1"
                />
                {form.formState.errors.assignedTo ? (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.assignedTo.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div>
              <Label>Assigned By (your name) *</Label>
              <Input {...form.register("createdBy")} placeholder="Your name" className="mt-1" />
              {form.formState.errors.createdBy ? (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.createdBy.message}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Due Date *</Label>
                <Input {...form.register("dueDate")} type="date" className="mt-1" />
                {form.formState.errors.dueDate ? (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.dueDate.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v) =>
                    form.setValue("priority", v as "low" | "medium" | "high" | "urgent")
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) =>
                    form.setValue(
                      "category",
                      v as
                        | "outreach"
                        | "programme"
                        | "operations"
                        | "sponsorship"
                        | "logistics"
                        | "other"
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outreach">Outreach</SelectItem>
                    <SelectItem value="programme">Programme</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="sponsorship">Sponsorship</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Link to Dashboard Item */}
            <div
              className="rounded-lg border p-3 space-y-3"
              style={{ borderColor: "#E8E0D8", background: "#FAF7F2" }}
            >
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" style={{ color: "#4A3728" }} />
                <Label className="text-sm font-medium" style={{ color: "#4A3728" }}>
                  Link to Dashboard Item
                </Label>
              </div>
              <Select
                value={linkType}
                onValueChange={(v) => {
                  setLinkType(v as "none" | "programme" | "operations" | "kpi");
                  setLinkSection("");
                  setLinkItem("");
                  setLinkKpi("");
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No link</SelectItem>
                  <SelectItem value="programme">Programme Item</SelectItem>
                  <SelectItem value="operations">Operations Item</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                </SelectContent>
              </Select>

              {(linkType === "programme" || linkType === "operations") ? (
                <div className="space-y-2">
                  <Select
                    value={linkSection}
                    onValueChange={(v) => {
                      setLinkSection(v);
                      setLinkItem("");
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select section…" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSections.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {linkSection !== "" ? (
                    <Select value={linkItem} onValueChange={setLinkItem}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select item…" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeSectionItems.map((it) => (
                          <SelectItem key={it.id} value={it.id}>
                            {it.item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              ) : null}

              {linkType === "kpi" ? (
                <Select value={linkKpi} onValueChange={setLinkKpi}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select KPI…" />
                  </SelectTrigger>
                  <SelectContent>
                    {KPI_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                {...form.register("notes")}
                placeholder="Additional notes..."
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  resetLinkState();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-white"
                style={{ background: "#4A3728" }}
                disabled={createMutation.isPending}
              >
                <Mail className="w-4 h-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create & Notify"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
