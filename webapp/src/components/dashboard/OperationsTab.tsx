import { Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./DashboardContext";
import { TrackerSectionTable } from "./TrackerSectionTable";
import { COLORS } from "./data";
import type { TrackerSection } from "./trackerTypes";

function formatLastSynced(lastSynced: string | null): string {
  if (lastSynced === null) return "Not yet saved";
  const diff = Math.round((Date.now() - new Date(lastSynced).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function OperationsTab() {
  const { operationsSections, setOperationsSections, saveToServer, lastSynced, isSyncing, isReadOnly } = useDashboard();

  const updateSection = (index: number, updated: TrackerSection) => {
    const next = operationsSections.map((s, i) => (i === index ? updated : s));
    setOperationsSections(next);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.slateGrayLight }}>
          <Clock className="w-3.5 h-3.5" />
          <span>
            {isSyncing ? "Saving..." : `Last saved: ${formatLastSynced(lastSynced)}`}
          </span>
        </div>
        {!isReadOnly ? (
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            style={{ background: COLORS.leafGreen, color: 'white' }}
            onClick={() => void saveToServer()}
            disabled={isSyncing}
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </Button>
        ) : null}
      </div>

      {/* Section tables */}
      {operationsSections.map((section, i) => (
        <TrackerSectionTable
          key={section.name}
          section={section}
          isReadOnly={isReadOnly}
          onUpdate={(updated) => updateSection(i, updated)}
        />
      ))}
    </div>
  );
}
