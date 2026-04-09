import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart2, Loader2, CheckCircle, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { WeeklyProgressTracker } from "@/components/dashboard/WeeklyProgressTracker";
import { RegionalBuyerCharts } from "@/components/dashboard/RegionalBuyerCharts";
import { DelegatesChart, ExhibitorsChart } from "@/components/dashboard/CategoryCharts";
import { SponsorshipChart } from "@/components/dashboard/SponsorshipChart";
import { COLORS } from "@/components/dashboard/data";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardContext";
import { SummaryBanner } from "@/components/dashboard/SummaryBanner";
import { ProgramTab } from "@/components/dashboard/ProgramTab";
import { OperationsTab } from "@/components/dashboard/OperationsTab";
import { cn } from "@/lib/utils";

type TabId = 'outreach' | 'programme' | 'operations';

const TABS: { id: TabId; label: string }[] = [
  { id: 'outreach', label: 'Outreach' },
  { id: 'programme', label: 'Programme' },
  { id: 'operations', label: 'Operations' },
];

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div
        className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5"
        style={{ background: `linear-gradient(to bottom, ${COLORS.leafGreen}, ${COLORS.coffeeBrown})` }}
      />
      <div>
        <h2 className="text-base font-semibold" style={{ color: COLORS.coffeeDark }}>{title}</h2>
        {subtitle !== undefined ? (
          <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function formatLastSynced(lastSynced: string | null): string {
  if (lastSynced === null) return "Not synced";
  const diff = Math.round((Date.now() - new Date(lastSynced).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>('outreach');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const {
    weeklyData, isSyncing, lastSynced, isReadOnly,
  } = useDashboard();

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(160deg, ${COLORS.cream} 0%, ${COLORS.creamDark} 50%, #EDE8E0 100%)` }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: `linear-gradient(135deg, ${COLORS.coffeeDark} 0%, ${COLORS.coffeeBrown} 60%, ${COLORS.coffeeMid} 100%)`,
          borderColor: COLORS.coffeeBrown + "40",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div
                className="rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0"
                style={{ width: 48, height: 40, padding: "3px 6px" }}
              >
                <img
                  src="/logo.jpg"
                  alt="Africa Coffee & Tea Expo 2026"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                  Africa Coffee and Tea Expo 2026
                </h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Outreach & Programme Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Read Only badge */}
              {isReadOnly ? (
                <div
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: COLORS.gold + '30', color: COLORS.gold }}
                >
                  <Eye className="w-3 h-3" />
                  Read Only
                </div>
              ) : null}

              {/* Live Sync indicator */}
              <div
                className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: COLORS.leafGreenLight }} />
                )}
                {isSyncing ? "Syncing..." : `Saved ${formatLastSynced(lastSynced)}`}
              </div>

              {/* Week indicator (outreach tab only) */}
              {activeTab === 'outreach' ? (
                <div
                  className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.8)" }}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Week {selectedWeek}
                </div>
              ) : null}

              <Link to="/admin">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  style={{ borderColor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.8)", background: "transparent" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Summary Banner — always visible */}
        <SummaryBanner />

        {/* Tab Pill Selector */}
        <div
          className="flex items-center p-1 rounded-2xl w-full sm:w-auto self-start"
          style={{ background: COLORS.creamDark }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-medium transition-all",
              )}
              style={
                activeTab === tab.id
                  ? { background: COLORS.coffeeDark, color: 'white', boxShadow: '0 1px 4px rgba(74,55,40,0.2)' }
                  : { background: 'transparent', color: COLORS.slateGray }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Uploaded data indicator (outreach tab) */}
        {activeTab === 'outreach' && (weeklyData.length !== 11 || weeklyData[0].week !== 1) ? (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: COLORS.leafGreen + "12", border: `1px solid ${COLORS.leafGreen}30`, color: COLORS.leafGreenDark }}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">Custom data loaded</span>
            <span style={{ color: COLORS.leafGreen }}>
              — {weeklyData.length} week{weeklyData.length !== 1 ? "s" : ""} of data
            </span>
          </div>
        ) : null}

        {/* Tab Content */}
        {activeTab === 'outreach' ? (
          <div className="space-y-8">
            <section>
              <SectionHeading
                title="Performance Summary"
                subtitle="Current progress: Target · Outreach · Achieved — Target completion: May 31, 2026"
              />
              <KpiCards />
            </section>

            <section>
              <SectionHeading
                title="Weekly Progress Tracker"
                subtitle="Cumulative outreach progress vs weekly target — click a week to highlight"
              />
              <WeeklyProgressTracker
                selectedWeek={selectedWeek}
                onSelectWeek={setSelectedWeek}
              />
            </section>

            <section>
              <SectionHeading
                title="Regional Buyer Distribution"
                subtitle="100 buyer targets across 5 regions — by hosting type"
              />
              <RegionalBuyerCharts />
            </section>

            <section>
              <SectionHeading
                title="Delegates & Exhibitors Breakdown"
                subtitle="Target allocation across all participant categories"
              />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <DelegatesChart />
                <ExhibitorsChart />
              </div>
            </section>

            <section>
              <SectionHeading
                title="Sponsorship Projections"
                subtitle="$360,000 total revenue target across 5 sponsorship tiers"
              />
              <SponsorshipChart />
            </section>
          </div>
        ) : activeTab === 'programme' ? (
          <ProgramTab />
        ) : (
          <OperationsTab />
        )}

        {/* Footer */}
        <footer
          className="border-t pt-6 pb-8 text-center"
          style={{ borderColor: COLORS.coffeeBrown + "25" }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-auto object-contain opacity-80" />
            <span className="text-sm font-medium" style={{ color: COLORS.coffeeBrown }}>
              Africa Coffee and Tea Expo 2026
            </span>
          </div>
          <p className="text-xs" style={{ color: COLORS.warmGrayLight }}>
            Use "Upload Data" to import your own weekly data, or "Export to Excel" to download all data.
          </p>
        </footer>
      </main>

    </div>
  );
}

export default function Index() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
