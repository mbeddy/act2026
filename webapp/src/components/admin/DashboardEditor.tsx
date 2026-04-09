import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KpiTargets {
  buyers: number;
  delegates: number;
  exhibitors: number;
  sponsorship: number;
}

interface WeeklyData {
  week: number;
  date: string;
  buyersOutreach: number;
  delegatesOutreach: number;
  exhibitorsOutreach: number;
  sponsorshipOutreach: number;
  buyersReached: number;
  delegatesConfirmed: number;
  exhibitorsConfirmed: number;
  sponsorshipSecured: number;
  notes: string;
}

interface DelegateCategory {
  name: string;
  shortName: string;
  target: number;
  outreach: number;
  confirmed: number;
}

interface ExhibitorCategory {
  name: string;
  shortName: string;
  target: number;
  outreach: number;
  confirmed: number;
}

interface SponsorshipLevel {
  level: string;
  qty: number;
  unitPrice: number;
  confirmed: number;
  color: string;
}

interface RegionalData {
  region: string;
  coffeeTargetBuyers: number;
  teaTargetBuyers: number;
  coffeeBuyersReached: number;
  teaBuyersReached: number;
}

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
  weeklyData: WeeklyData[];
  kpiTargets: KpiTargets;
  delegateCategories: DelegateCategory[];
  exhibitorCategories: ExhibitorCategory[];
  sponsorshipLevels: SponsorshipLevel[];
  regionalData: RegionalData[];
  programSections: ProgramSection[];
  operationsSections: ProgramSection[];
  lastUpdated: string;
  lastUpdatedBy: string;
}

const cellClass =
  "h-8 text-sm px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8DB53C] focus:border-transparent bg-white text-gray-900 placeholder-gray-400";

const thClass =
  "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap";

const tdClass = "px-2 py-1.5 whitespace-nowrap";

export function DashboardEditor() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: dashboardState, isLoading } = useQuery({
    queryKey: ["dashboard", "state"],
    queryFn: () => api.get<DashboardState>("/api/dashboard/state"),
  });

  const [editState, setEditState] = useState<DashboardState | null>(null);

  // Initialise local edit state from server once
  const state: DashboardState | null = editState ?? dashboardState ?? null;

  const saveMutation = useMutation({
    mutationFn: (updatedState: DashboardState) =>
      api.post("/api/dashboard/state", {
        state: { ...updatedState, lastUpdatedBy: "admin" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "state"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    },
  });

  const handleSave = () => {
    if (state) saveMutation.mutate(state);
  };

  // Helpers to mutate nested state immutably
  const setKpi = (key: keyof KpiTargets, value: number) => {
    if (!state) return;
    setEditState({
      ...(editState ?? state),
      kpiTargets: { ...state.kpiTargets, [key]: value },
    });
  };

  const setWeekly = (index: number, key: keyof WeeklyData, value: string | number) => {
    if (!state) return;
    const updated = state.weeklyData.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    setEditState({ ...(editState ?? state), weeklyData: updated });
  };

  const setDelegate = (
    index: number,
    key: keyof DelegateCategory,
    value: string | number
  ) => {
    if (!state) return;
    const updated = state.delegateCategories.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    setEditState({ ...(editState ?? state), delegateCategories: updated });
  };

  const setExhibitor = (
    index: number,
    key: keyof ExhibitorCategory,
    value: string | number
  ) => {
    if (!state) return;
    const updated = state.exhibitorCategories.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    setEditState({ ...(editState ?? state), exhibitorCategories: updated });
  };

  const setSponsorship = (
    index: number,
    key: keyof SponsorshipLevel,
    value: string | number
  ) => {
    if (!state) return;
    const updated = state.sponsorshipLevels.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    setEditState({ ...(editState ?? state), sponsorshipLevels: updated });
  };

  const setRegional = (
    index: number,
    key: keyof RegionalData,
    value: string | number
  ) => {
    if (!state) return;
    const updated = state.regionalData.map((row, i) =>
      i === index ? { ...row, [key]: value } : row
    );
    setEditState({ ...(editState ?? state), regionalData: updated });
  };

  const setProgramItem = (
    sectionIndex: number,
    itemIndex: number,
    key: keyof ProgramItem,
    value: string | number
  ) => {
    if (!state) return;
    const updated = state.programSections.map((section, si) =>
      si === sectionIndex
        ? {
            ...section,
            items: section.items.map((item, ii) =>
              ii === itemIndex ? { ...item, [key]: value } : item
            ),
          }
        : section
    );
    setEditState({ ...(editState ?? state), programSections: updated });
  };

  const setOperationsItem = (
    sectionIndex: number,
    itemIndex: number,
    key: keyof ProgramItem,
    value: string | number
  ) => {
    if (!state) return;
    const updated = state.operationsSections.map((section, si) =>
      si === sectionIndex
        ? {
            ...section,
            items: section.items.map((item, ii) =>
              ii === itemIndex ? { ...item, [key]: value } : item
            ),
          }
        : section
    );
    setEditState({ ...(editState ?? state), operationsSections: updated });
  };

  const newBlankItem = (): ProgramItem => ({
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    item: "",
    target: "",
    confirmed: "",
    percentComplete: 0,
    status: "on-track",
    owner: "",
    nextStep: "",
    risk: "",
  });

  const addProgramItem = (sectionIndex: number) => {
    if (!state) return;
    const updated = state.programSections.map((section, si) =>
      si === sectionIndex ? { ...section, items: [...section.items, newBlankItem()] } : section
    );
    setEditState({ ...(editState ?? state), programSections: updated });
  };

  const removeProgramItem = (sectionIndex: number, itemIndex: number) => {
    if (!state) return;
    const updated = state.programSections.map((section, si) =>
      si === sectionIndex
        ? { ...section, items: section.items.filter((_, ii) => ii !== itemIndex) }
        : section
    );
    setEditState({ ...(editState ?? state), programSections: updated });
  };

  const addOperationsItem = (sectionIndex: number) => {
    if (!state) return;
    const updated = state.operationsSections.map((section, si) =>
      si === sectionIndex ? { ...section, items: [...section.items, newBlankItem()] } : section
    );
    setEditState({ ...(editState ?? state), operationsSections: updated });
  };

  const removeOperationsItem = (sectionIndex: number, itemIndex: number) => {
    if (!state) return;
    const updated = state.operationsSections.map((section, si) =>
      si === sectionIndex
        ? { ...section, items: section.items.filter((_, ii) => ii !== itemIndex) }
        : section
    );
    setEditState({ ...(editState ?? state), operationsSections: updated });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2"
          style={{ borderColor: "#8DB53C", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load dashboard state.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#4A3728" }}>
            Dashboard Editor
          </h2>
          <p className="text-sm text-gray-500">
            Edit all dashboard data directly. Changes are live immediately on save.
          </p>
        </div>
      </div>

      {saved ? (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: "#F0F7E8", color: "#4A6B1C" }}
        >
          <CheckCircle2 className="w-4 h-4" />
          Dashboard updated successfully! Changes are now live.
        </div>
      ) : null}

      <Tabs defaultValue="kpi">
        <div className="overflow-x-auto">
          <TabsList className="mb-4 bg-[#FAF7F2] border border-[#E8E0D8]">
            <TabsTrigger value="kpi">KPI Targets</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Data</TabsTrigger>
            <TabsTrigger value="delegates">Delegates</TabsTrigger>
            <TabsTrigger value="exhibitors">Exhibitors</TabsTrigger>
            <TabsTrigger value="sponsorship">Sponsorship</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
            <TabsTrigger value="programme">Programme</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>
        </div>

        {/* KPI Targets */}
        <TabsContent value="kpi">
          <div
            className="rounded-xl border p-6 bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#4A3728" }}>
              KPI Targets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
              {(
                [
                  { key: "buyers" as const, label: "Buyers Target" },
                  { key: "delegates" as const, label: "Delegates Target" },
                  { key: "exhibitors" as const, label: "Exhibitors Target" },
                  { key: "sponsorship" as const, label: "Sponsorship Target ($)" },
                ] as { key: keyof KpiTargets; label: string }[]
              ).map(({ key, label }) => (
                <div key={key}>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    {label}
                  </Label>
                  <Input
                    type="number"
                    value={state.kpiTargets[key]}
                    onChange={(e) => setKpi(key, Number(e.target.value))}
                    className="focus-visible:ring-[#8DB53C] bg-white text-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Weekly Data */}
        <TabsContent value="weekly">
          <div
            className="rounded-xl border bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "#E8E0D8" }}>
              <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>
                Weekly Data
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#FAF7F2" }}>
                    <th className={thClass} style={{ color: "#4A3728" }}>Week</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Date</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Buyers Outreach</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Buyers Reached</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Delegates Outreach</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Delegates Confirmed</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Exhibitors Outreach</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Exhibitors Confirmed</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Sponsorship Outreach ($)</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Sponsorship Secured ($)</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {state.weeklyData.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t hover:bg-[#FAF7F2]/50"
                      style={{ borderColor: "#E8E0D8", background: i % 2 === 0 ? "white" : "#FDFCFB" }}
                    >
                      <td className={tdClass}>
                        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: "#F5F0EB", color: "#4A3728" }}>
                          W{row.week}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <input
                          type="text"
                          value={row.date}
                          onChange={(e) => setWeekly(i, "date", e.target.value)}
                          className={cellClass}
                          style={{ width: "90px" }}
                        />
                      </td>
                      {(
                        [
                          "buyersOutreach",
                          "buyersReached",
                          "delegatesOutreach",
                          "delegatesConfirmed",
                          "exhibitorsOutreach",
                          "exhibitorsConfirmed",
                          "sponsorshipOutreach",
                          "sponsorshipSecured",
                        ] as (keyof WeeklyData)[]
                      ).map((key) => (
                        <td key={key} className={tdClass}>
                          <input
                            type="number"
                            value={row[key] as number}
                            onChange={(e) => setWeekly(i, key, Number(e.target.value))}
                            className={cellClass}
                            style={{ width: "80px" }}
                          />
                        </td>
                      ))}
                      <td className={tdClass}>
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => setWeekly(i, "notes", e.target.value)}
                          className={cellClass}
                          style={{ width: "160px" }}
                          placeholder="Notes…"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Delegates */}
        <TabsContent value="delegates">
          <div
            className="rounded-xl border bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "#E8E0D8" }}>
              <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>
                Delegate Categories
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#FAF7F2" }}>
                    <th className={thClass} style={{ color: "#4A3728" }}>Category Name</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Target</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Outreach</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {state.delegateCategories.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: "#E8E0D8", background: i % 2 === 0 ? "white" : "#FDFCFB" }}
                    >
                      <td className="px-3 py-2 text-sm font-medium" style={{ color: "#4A3728" }}>
                        {row.name}
                      </td>
                      {(["target", "outreach", "confirmed"] as (keyof DelegateCategory)[]).map(
                        (key) => (
                          <td key={key} className={tdClass}>
                            <input
                              type="number"
                              value={row[key] as number}
                              onChange={(e) => setDelegate(i, key, Number(e.target.value))}
                              className={cellClass}
                              style={{ width: "90px" }}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Exhibitors */}
        <TabsContent value="exhibitors">
          <div
            className="rounded-xl border bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "#E8E0D8" }}>
              <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>
                Exhibitor Categories
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#FAF7F2" }}>
                    <th className={thClass} style={{ color: "#4A3728" }}>Category Name</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Target</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Outreach</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {state.exhibitorCategories.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: "#E8E0D8", background: i % 2 === 0 ? "white" : "#FDFCFB" }}
                    >
                      <td className="px-3 py-2 text-sm font-medium" style={{ color: "#4A3728" }}>
                        {row.name}
                      </td>
                      {(["target", "outreach", "confirmed"] as (keyof ExhibitorCategory)[]).map(
                        (key) => (
                          <td key={key} className={tdClass}>
                            <input
                              type="number"
                              value={row[key] as number}
                              onChange={(e) => setExhibitor(i, key, Number(e.target.value))}
                              className={cellClass}
                              style={{ width: "90px" }}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Sponsorship */}
        <TabsContent value="sponsorship">
          <div
            className="rounded-xl border bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "#E8E0D8" }}>
              <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>
                Sponsorship Levels
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#FAF7F2" }}>
                    <th className={thClass} style={{ color: "#4A3728" }}>Level</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Quantity</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Unit Price ($)</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Confirmed</th>
                  </tr>
                </thead>
                <tbody>
                  {state.sponsorshipLevels.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: "#E8E0D8", background: i % 2 === 0 ? "white" : "#FDFCFB" }}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: row.color }}
                          />
                          <span className="text-sm font-medium" style={{ color: "#4A3728" }}>
                            {row.level}
                          </span>
                        </div>
                      </td>
                      {(["qty", "unitPrice", "confirmed"] as (keyof SponsorshipLevel)[]).map(
                        (key) => (
                          <td key={key} className={tdClass}>
                            <input
                              type="number"
                              value={row[key] as number}
                              onChange={(e) => setSponsorship(i, key, Number(e.target.value))}
                              className={cellClass}
                              style={{ width: "100px" }}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Regional */}
        <TabsContent value="regional">
          <div
            className="rounded-xl border bg-white"
            style={{ borderColor: "#E8E0D8" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "#E8E0D8" }}>
              <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>
                Regional Data
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#FAF7F2" }}>
                    <th className={thClass} style={{ color: "#4A3728" }}>Region</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Coffee Target</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Tea Target</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Coffee Reached</th>
                    <th className={thClass} style={{ color: "#4A3728" }}>Tea Reached</th>
                  </tr>
                </thead>
                <tbody>
                  {state.regionalData.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: "#E8E0D8", background: i % 2 === 0 ? "white" : "#FDFCFB" }}
                    >
                      <td className="px-3 py-2 text-sm font-medium" style={{ color: "#4A3728" }}>
                        {row.region}
                      </td>
                      {(
                        [
                          "coffeeTargetBuyers",
                          "teaTargetBuyers",
                          "coffeeBuyersReached",
                          "teaBuyersReached",
                        ] as (keyof RegionalData)[]
                      ).map((key) => (
                        <td key={key} className={tdClass}>
                          <input
                            type="number"
                            value={row[key] as number}
                            onChange={(e) => setRegional(i, key, Number(e.target.value))}
                            className={cellClass}
                            style={{ width: "100px" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Programme */}
        <TabsContent value="programme">
          <div className="space-y-6">
            {state.programSections.map((section, si) => (
              <div key={si} className="rounded-xl border bg-white" style={{ borderColor: "#E8E0D8" }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#E8E0D8", background: "#FAF7F2" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#8DB53C" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>{section.name}</h3>
                    <span className="text-xs text-gray-400 ml-1">({section.items.length} items)</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addProgramItem(si)} className="h-7 text-xs gap-1" style={{ borderColor: "#8DB53C", color: "#4A6B1C" }}>
                    <Plus className="w-3 h-3" /> Add Item
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#FDFCFB" }}>
                        {["Item", "Target", "Confirmed", "% Done", "Status", "Owner", "Next Step", "Risk", ""].map((h) => (
                          <th key={h} className={thClass} style={{ color: "#4A3728" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item, ii) => (
                        <tr key={item.id} className="border-t" style={{ borderColor: "#E8E0D8", background: ii % 2 === 0 ? "white" : "#FDFCFB" }}>
                          <td className={tdClass}><input type="text" value={item.item} onChange={(e) => setProgramItem(si, ii, "item", e.target.value)} className={cellClass} style={{ width: "180px" }} placeholder="Item name" /></td>
                          <td className={tdClass}><input type="text" value={item.target} onChange={(e) => setProgramItem(si, ii, "target", e.target.value)} className={cellClass} style={{ width: "100px" }} placeholder="Target" /></td>
                          <td className={tdClass}><input type="text" value={item.confirmed} onChange={(e) => setProgramItem(si, ii, "confirmed", e.target.value)} className={cellClass} style={{ width: "100px" }} placeholder="Confirmed" /></td>
                          <td className={tdClass}><input type="number" min={0} max={100} value={item.percentComplete} onChange={(e) => setProgramItem(si, ii, "percentComplete", Number(e.target.value))} className={cellClass} style={{ width: "70px" }} /></td>
                          <td className={tdClass}>
                            <Select value={item.status} onValueChange={(v) => setProgramItem(si, ii, "status", v)}>
                              <SelectTrigger className="h-8 text-xs bg-white text-gray-900 border-gray-300" style={{ width: "110px" }}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on-track">On Track</SelectItem>
                                <SelectItem value="at-risk">At Risk</SelectItem>
                                <SelectItem value="behind">Behind</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className={tdClass}><input type="text" value={item.owner} onChange={(e) => setProgramItem(si, ii, "owner", e.target.value)} className={cellClass} style={{ width: "110px" }} placeholder="Owner" /></td>
                          <td className={tdClass}><input type="text" value={item.nextStep} onChange={(e) => setProgramItem(si, ii, "nextStep", e.target.value)} className={cellClass} style={{ width: "160px" }} placeholder="Next step" /></td>
                          <td className={tdClass}><input type="text" value={item.risk} onChange={(e) => setProgramItem(si, ii, "risk", e.target.value)} className={cellClass} style={{ width: "140px" }} placeholder="Risk" /></td>
                          <td className={tdClass}>
                            <button onClick={() => removeProgramItem(si, ii)} className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {section.items.length === 0 && (
                        <tr><td colSpan={9} className="px-4 py-6 text-center text-xs text-gray-400">No items. Click "Add Item" to add one.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Operations */}
        <TabsContent value="operations">
          <div className="space-y-6">
            {state.operationsSections.map((section, si) => (
              <div key={si} className="rounded-xl border bg-white" style={{ borderColor: "#E8E0D8" }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#E8E0D8", background: "#FAF7F2" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#C8A42A" }} />
                    <h3 className="text-sm font-semibold" style={{ color: "#4A3728" }}>{section.name}</h3>
                    <span className="text-xs text-gray-400 ml-1">({section.items.length} items)</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addOperationsItem(si)} className="h-7 text-xs gap-1" style={{ borderColor: "#C8A42A", color: "#7A5F00" }}>
                    <Plus className="w-3 h-3" /> Add Item
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#FDFCFB" }}>
                        {["Item", "Target", "Confirmed", "% Done", "Status", "Owner", "Next Step", "Risk", ""].map((h) => (
                          <th key={h} className={thClass} style={{ color: "#4A3728" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item, ii) => (
                        <tr key={item.id} className="border-t" style={{ borderColor: "#E8E0D8", background: ii % 2 === 0 ? "white" : "#FDFCFB" }}>
                          <td className={tdClass}><input type="text" value={item.item} onChange={(e) => setOperationsItem(si, ii, "item", e.target.value)} className={cellClass} style={{ width: "180px" }} placeholder="Item name" /></td>
                          <td className={tdClass}><input type="text" value={item.target} onChange={(e) => setOperationsItem(si, ii, "target", e.target.value)} className={cellClass} style={{ width: "100px" }} placeholder="Target" /></td>
                          <td className={tdClass}><input type="text" value={item.confirmed} onChange={(e) => setOperationsItem(si, ii, "confirmed", e.target.value)} className={cellClass} style={{ width: "100px" }} placeholder="Confirmed" /></td>
                          <td className={tdClass}><input type="number" min={0} max={100} value={item.percentComplete} onChange={(e) => setOperationsItem(si, ii, "percentComplete", Number(e.target.value))} className={cellClass} style={{ width: "70px" }} /></td>
                          <td className={tdClass}>
                            <Select value={item.status} onValueChange={(v) => setOperationsItem(si, ii, "status", v)}>
                              <SelectTrigger className="h-8 text-xs bg-white text-gray-900 border-gray-300" style={{ width: "110px" }}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on-track">On Track</SelectItem>
                                <SelectItem value="at-risk">At Risk</SelectItem>
                                <SelectItem value="behind">Behind</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className={tdClass}><input type="text" value={item.owner} onChange={(e) => setOperationsItem(si, ii, "owner", e.target.value)} className={cellClass} style={{ width: "110px" }} placeholder="Owner" /></td>
                          <td className={tdClass}><input type="text" value={item.nextStep} onChange={(e) => setOperationsItem(si, ii, "nextStep", e.target.value)} className={cellClass} style={{ width: "160px" }} placeholder="Next step" /></td>
                          <td className={tdClass}><input type="text" value={item.risk} onChange={(e) => setOperationsItem(si, ii, "risk", e.target.value)} className={cellClass} style={{ width: "140px" }} placeholder="Risk" /></td>
                          <td className={tdClass}>
                            <button onClick={() => removeOperationsItem(si, ii)} className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {section.items.length === 0 && (
                        <tr><td colSpan={9} className="px-4 py-6 text-center text-xs text-gray-400">No items. Click "Add Item" to add one.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="text-white px-6"
          style={{ background: "#4A3728" }}
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
