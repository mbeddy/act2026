import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Trash2, Eye, Clock, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Snapshot {
  id: string;
  timestamp: string;
  updatedBy: string;
  changeDescription: string;
}

interface SnapshotDetail extends Snapshot {
  state: unknown;
}

export function DashboardHistory() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "history"],
    queryFn: () => adminApi.get<{ snapshots: Snapshot[] }>("/api/admin/history"),
  });

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ["admin", "history", previewId],
    queryFn: () =>
      adminApi.get<{ snapshot: SnapshotDetail }>(`/api/admin/history/${previewId}`),
    enabled: !!previewId,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.post<{ success: boolean }>(`/api/admin/history/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "history"] });
      setRestoreId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/admin/history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "history"] });
      setDeleteId(null);
    },
  });

  const snapshots = data?.snapshots ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2"
          style={{ borderColor: "#8DB53C", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load history. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5" style={{ color: "#8DB53C" }} />
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#4A3728" }}>
            Dashboard History
          </h2>
          <p className="text-sm text-gray-500">{snapshots.length} snapshots tracked</p>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl border-2 border-dashed"
          style={{ borderColor: "#7B6B58", color: "#7B6B58" }}
        >
          <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No history yet</p>
          <p className="text-sm mt-1 opacity-70">
            Snapshots are saved automatically when the dashboard is updated
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snapshot, idx) => (
            <div
              key={snapshot.id}
              className="rounded-xl border p-4 flex items-start gap-4 bg-white hover:shadow-sm transition-shadow"
              style={{ borderColor: "#E8E0D8" }}
            >
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: idx === 0 ? "#8DB53C" : "#7B6B58" }}
                >
                  {snapshots.length - idx}
                </div>
                {idx < snapshots.length - 1 ? (
                  <div className="w-0.5 h-full mt-2" style={{ background: "#E8E0D8" }} />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: "#4A3728" }}>
                  {snapshot.changeDescription}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(snapshot.timestamp), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    {snapshot.updatedBy}
                  </span>
                  {idx === 0 ? (
                    <Badge className="text-xs" style={{ background: "#8DB53C", color: "white" }}>
                      Current
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(new Date(snapshot.timestamp), "PPpp")}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewId(snapshot.id)}
                  className="text-xs h-7"
                >
                  <Eye className="w-3 h-3 mr-1" /> Preview
                </Button>
                {idx !== 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRestoreId(snapshot.id)}
                    className="text-xs h-7"
                    style={{ borderColor: "#8DB53C", color: "#8DB53C" }}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Restore
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteId(snapshot.id)}
                  className="text-xs h-7 text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Snapshot Preview</DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin rounded-full h-6 w-6 border-2"
                style={{ borderColor: "#8DB53C", borderTopColor: "transparent" }}
              />
            </div>
          ) : previewData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg p-3" style={{ background: "#FAF7F2" }}>
                  <p className="text-gray-500 text-xs">Updated By</p>
                  <p className="font-medium mt-0.5">{previewData.snapshot.updatedBy}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "#FAF7F2" }}>
                  <p className="text-gray-500 text-xs">Timestamp</p>
                  <p className="font-medium mt-0.5">
                    {format(new Date(previewData.snapshot.timestamp), "PPp")}
                  </p>
                </div>
              </div>
              {previewData.snapshot.state &&
              typeof previewData.snapshot.state === "object" &&
              (previewData.snapshot.state as Record<string, unknown>).kpiTargets ? (
                <div className="rounded-lg p-3" style={{ background: "#FAF7F2" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#4A3728" }}>
                    KPI Targets
                  </p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(
                      (previewData.snapshot.state as Record<string, unknown>).kpiTargets,
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : null}
              <div className="rounded-lg p-3" style={{ background: "#FAF7F2" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#4A3728" }}>
                  Description
                </p>
                <p className="text-sm">{previewData.snapshot.changeDescription}</p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation */}
      <AlertDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current dashboard state with this historical snapshot. A backup
              of the current state will be saved automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (restoreId) restoreMutation.mutate(restoreId);
              }}
              style={{ background: "#8DB53C" }}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this snapshot?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
