import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ImportExcelModal } from "@/components/dashboard/ImportExcelModal";
import { exportLiveDataToExcel, type LiveDashboardState } from "@/components/dashboard/exportToExcel";
import { Download, Upload, CheckCircle2, FileSpreadsheet, FileUp, Table2 } from "lucide-react";
import type { WeeklyData, DelegateCategory, ExhibitorCategory, SponsorshipLevel, RegionBuyerData } from "@/components/dashboard/data";
import type { KpiTargets } from "@/components/dashboard/DashboardContext";

export function DataImportExport() {
  const [importOpen, setImportOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [imported, setImported] = useState(false);
  const queryClient = useQueryClient();

  const { data: liveState, isLoading } = useQuery({
    queryKey: ["dashboard", "state"],
    queryFn: () => api.get<LiveDashboardState>("/api/dashboard/state"),
  });

  const importMutation = useMutation({
    mutationFn: (merged: LiveDashboardState) =>
      api.post("/api/dashboard/state", {
        state: { ...merged, lastUpdatedBy: "admin-import" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "state"] });
      setImported(true);
      setTimeout(() => setImported(false), 5000);
    },
  });

  const handleExport = () => {
    if (!liveState) return;
    exportLiveDataToExcel(liveState);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleApply = (
    newWeeklyData: WeeklyData[],
    newKpiTargets?: KpiTargets,
    newDelegates?: DelegateCategory[],
    newExhibitors?: ExhibitorCategory[],
    newSponsorship?: SponsorshipLevel[],
    newRegional?: RegionBuyerData[],
  ) => {
    if (!liveState) return;
    const merged: LiveDashboardState = {
      ...liveState,
      weeklyData: newWeeklyData,
      ...(newKpiTargets !== undefined && { kpiTargets: newKpiTargets }),
      ...(newDelegates !== undefined && { delegateCategories: newDelegates }),
      ...(newExhibitors !== undefined && { exhibitorCategories: newExhibitors }),
      ...(newSponsorship !== undefined && { sponsorshipLevels: newSponsorship }),
      ...(newRegional !== undefined && { regionalData: newRegional as unknown as LiveDashboardState["regionalData"] }),
    };
    importMutation.mutate(merged);
    setImportOpen(false);
  };

  const sheets = [
    { icon: Table2, label: "KPI Summary", desc: "Buyers, delegates, exhibitors & sponsorship targets vs achieved" },
    { icon: Table2, label: "Weekly Progress", desc: "All 11 weeks of outreach and confirmed figures" },
    { icon: Table2, label: "Delegates", desc: "Target, outreach and confirmed per delegate category" },
    { icon: Table2, label: "Exhibitors", desc: "Target, outreach and confirmed per exhibitor category" },
    { icon: Table2, label: "Sponsorship", desc: "Confirmed slots and revenue by tier" },
    { icon: Table2, label: "Regional", desc: "Coffee and tea buyer targets and actuals by region" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "#4A3728" }}>Data Import & Export</h2>
        <p className="text-sm text-gray-500 mt-0.5">Upload data from Excel or download the current live dashboard data.</p>
      </div>

      {imported ? (
        <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium" style={{ background: "#F0F7E8", color: "#4A6B1C" }}>
          <CheckCircle2 className="w-4 h-4" />
          Data imported successfully! The dashboard has been updated with your file.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Card */}
        <div className="rounded-xl border bg-white p-6 flex flex-col" style={{ borderColor: "#E8E0D8" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#4A372818" }}>
              <Download className="w-5 h-5" style={{ color: "#4A3728" }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "#4A3728" }}>Export to Excel</h3>
              <p className="text-xs text-gray-500">Download live dashboard data as .xlsx</p>
            </div>
          </div>

          <div className="space-y-2 mb-5 flex-1">
            {sheets.map((s) => (
              <div key={s.label} className="flex items-start gap-2.5 text-xs text-gray-500">
                <FileSpreadsheet className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#8DB53C" }} />
                <span><span className="font-medium text-gray-700">{s.label}</span> — {s.desc}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleExport}
            disabled={isLoading || !liveState}
            className="w-full text-white"
            style={{ background: "#4A3728" }}
          >
            {exported ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Downloaded!</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Export Live Data</>
            )}
          </Button>
        </div>

        {/* Import Card */}
        <div className="rounded-xl border bg-white p-6 flex flex-col" style={{ borderColor: "#E8E0D8" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#8DB53C18" }}>
              <Upload className="w-5 h-5" style={{ color: "#8DB53C" }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "#4A3728" }}>Import from Excel</h3>
              <p className="text-xs text-gray-500">Upload a formatted .xlsx file to update the dashboard</p>
            </div>
          </div>

          <div className="rounded-lg p-4 mb-5 flex-1 space-y-2" style={{ background: "#FAF7F2" }}>
            <p className="text-xs font-medium" style={{ color: "#4A3728" }}>What gets imported:</p>
            {["Weekly outreach & confirmed figures", "KPI targets (buyers, delegates, exhibitors, sponsorship)", "Delegate & exhibitor category data", "Sponsorship levels & confirmed counts", "Regional buyer data"].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#8DB53C" }} />
                {item}
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t" style={{ borderColor: "#E8E0D8" }}>
              Use Export to download a template with the correct format first.
            </p>
          </div>

          <Button
            onClick={() => setImportOpen(true)}
            disabled={isLoading || importMutation.isPending}
            className="w-full"
            variant="outline"
            style={{ borderColor: "#8DB53C", color: "#4A6B1C" }}
          >
            <FileUp className="w-4 h-4 mr-2" />
            {importMutation.isPending ? "Applying..." : "Upload Excel File"}
          </Button>
        </div>
      </div>

      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onApply={handleApply}
      />
    </div>
  );
}
