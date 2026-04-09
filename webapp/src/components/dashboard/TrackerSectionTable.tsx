import { useState, useRef } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "./data";
import type { TrackerSection, TrackerItem, TrackingStatus } from "./trackerTypes";

interface TrackerSectionTableProps {
  section: TrackerSection;
  isReadOnly: boolean;
  onUpdate: (updated: TrackerSection) => void;
}

function StatusBadge({ status }: { status: TrackingStatus }) {
  const config: Record<TrackingStatus, { label: string; dot: string; bg: string; text: string }> = {
    'on-track': {
      label: 'On Track',
      dot: COLORS.green,
      bg: COLORS.green + '15',
      text: COLORS.green,
    },
    'at-risk': {
      label: 'At Risk',
      dot: COLORS.amber,
      bg: COLORS.amber + '15',
      text: COLORS.amber,
    },
    'behind': {
      label: 'Behind',
      dot: '#E53935',
      bg: '#E5393510',
      text: '#E53935',
    },
  };
  const c = config[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function MiniProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color =
    clamped >= 70 ? COLORS.green :
    clamped >= 40 ? COLORS.amber :
    '#E53935';
  return (
    <div className="flex items-center gap-1.5 min-w-[60px]">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 4, background: COLORS.creamDark }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: COLORS.slateGray, minWidth: 28 }}>
        {clamped}%
      </span>
    </div>
  );
}

interface EditableCellProps {
  value: string;
  isReadOnly: boolean;
  onSave: (val: string) => void;
  className?: string;
  numeric?: boolean;
}

function EditableCell({ value, isReadOnly, onSave, className, numeric }: EditableCellProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    if (isReadOnly) return;
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={cn(
          "w-full px-1 py-0.5 text-xs rounded border outline-none",
          className
        )}
        style={{
          borderColor: COLORS.leafGreen,
          background: 'white',
          color: COLORS.coffeeDark,
          minWidth: numeric ? 48 : 80,
        }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setEditing(false); setDraft(value); }
        }}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      className={cn(
        "group relative inline-block w-full cursor-default text-xs",
        !isReadOnly && "cursor-pointer hover:bg-black/5 rounded px-1 -ml-1",
        className
      )}
      title={!isReadOnly ? "Click to edit" : undefined}
    >
      {value || <span style={{ color: COLORS.slateGrayLight }}>—</span>}
      {!isReadOnly ? (
        <span
          className="absolute right-0 top-0 opacity-0 group-hover:opacity-40 text-[9px] pointer-events-none"
          style={{ color: COLORS.slateGray }}
        >
          ✎
        </span>
      ) : null}
    </span>
  );
}

interface StatusSelectProps {
  value: TrackingStatus;
  isReadOnly: boolean;
  onChange: (val: TrackingStatus) => void;
}

function StatusSelect({ value, isReadOnly, onChange }: StatusSelectProps) {
  if (isReadOnly) return <StatusBadge status={value} />;
  return (
    <select
      className="text-xs rounded border px-1 py-0.5 outline-none cursor-pointer"
      style={{
        borderColor: COLORS.creamDark,
        color: COLORS.coffeeDark,
        background: 'white',
      }}
      value={value}
      onChange={(e) => onChange(e.target.value as TrackingStatus)}
    >
      <option value="on-track">On Track</option>
      <option value="at-risk">At Risk</option>
      <option value="behind">Behind</option>
    </select>
  );
}

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function TrackerSectionTable({ section, isReadOnly, onUpdate }: TrackerSectionTableProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const updateItem = (index: number, patch: Partial<TrackerItem>) => {
    const newItems = section.items.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    onUpdate({ ...section, items: newItems });
  };

  const addRow = () => {
    const newItem: TrackerItem = {
      id: generateId(),
      item: 'New item',
      target: '1',
      confirmed: '0',
      percentComplete: 0,
      status: 'on-track',
      owner: '',
      nextStep: '',
      risk: 'None',
    };
    onUpdate({ ...section, items: [...section.items, newItem] });
  };

  const deleteRow = (index: number) => {
    onUpdate({ ...section, items: section.items.filter((_, i) => i !== index) });
  };

  const completedCount = section.items.filter(i => i.status === 'on-track').length;
  const avgPct = section.items.length > 0
    ? Math.round(section.items.reduce((sum, i) => sum + i.percentComplete, 0) / section.items.length)
    : 0;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: COLORS.creamDark,
        background: 'white',
        boxShadow: '0 1px 4px rgba(74,55,40,0.06)',
      }}
    >
      {/* Section header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-black/[0.02]"
        style={{ background: COLORS.cream }}
        onClick={() => setCollapsed(c => !c)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <span style={{ color: COLORS.slateGray }}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
          <span className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
            {section.name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: COLORS.leafGreen + '18', color: COLORS.leafGreenDark }}
          >
            {section.items.length} items
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: COLORS.slateGrayLight }}>
          <span>{completedCount}/{section.items.length} on track</span>
          <span
            className="px-2 py-0.5 rounded-full font-medium"
            style={{
              background: avgPct >= 70 ? COLORS.green + '18' : avgPct >= 40 ? COLORS.amber + '18' : '#E5393510',
              color: avgPct >= 70 ? COLORS.green : avgPct >= 40 ? COLORS.amber : '#E53935',
            }}
          >
            {avgPct}% avg
          </span>
        </div>
      </button>

      {!collapsed ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.creamDark}`, background: COLORS.cream + '80' }}>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, minWidth: 160 }}>Item</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, width: 60 }}>Target</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, width: 72 }}>Confirmed</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, width: 100 }}>%</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, width: 110 }}>Status</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, minWidth: 100 }}>Owner</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, minWidth: 140 }}>Next Step</th>
                <th className="text-left px-3 py-2 font-medium" style={{ color: COLORS.slateGray, minWidth: 120 }}>Risk</th>
                {!isReadOnly ? <th className="px-2 py-2" style={{ width: 32 }} /> : null}
              </tr>
            </thead>
            <tbody>
              {section.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-black/[0.018]"
                  style={{ borderBottom: `1px solid ${COLORS.creamDark}` }}
                >
                  <td className="px-3 py-2">
                    <EditableCell
                      value={item.item}
                      isReadOnly={isReadOnly}
                      onSave={(v) => updateItem(idx, { item: v })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableCell
                      value={item.target}
                      isReadOnly={isReadOnly}
                      numeric
                      onSave={(v) => updateItem(idx, { target: v })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableCell
                      value={item.confirmed}
                      isReadOnly={isReadOnly}
                      numeric
                      onSave={(v) => updateItem(idx, { confirmed: v })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {isReadOnly ? (
                      <MiniProgressBar value={item.percentComplete} />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="w-12 px-1 py-0.5 text-xs rounded border outline-none"
                          style={{ borderColor: COLORS.creamDark, color: COLORS.coffeeDark }}
                          value={item.percentComplete}
                          onChange={(e) => updateItem(idx, { percentComplete: Math.max(0, Math.min(100, Number(e.target.value))) })}
                        />
                        <span style={{ color: COLORS.slateGrayLight }}>%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isReadOnly ? (
                      <StatusBadge status={item.status} />
                    ) : (
                      <StatusSelect
                        value={item.status}
                        isReadOnly={isReadOnly}
                        onChange={(v) => updateItem(idx, { status: v })}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <EditableCell
                      value={item.owner}
                      isReadOnly={isReadOnly}
                      onSave={(v) => updateItem(idx, { owner: v })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableCell
                      value={item.nextStep}
                      isReadOnly={isReadOnly}
                      onSave={(v) => updateItem(idx, { nextStep: v })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableCell
                      value={item.risk}
                      isReadOnly={isReadOnly}
                      onSave={(v) => updateItem(idx, { risk: v })}
                    />
                  </td>
                  {!isReadOnly ? (
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                        style={{ color: '#E53935' }}
                        onClick={() => deleteRow(idx)}
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

          {!isReadOnly ? (
            <div className="px-3 py-2" style={{ borderTop: `1px solid ${COLORS.creamDark}` }}>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: COLORS.leafGreenDark }}
                onClick={addRow}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
