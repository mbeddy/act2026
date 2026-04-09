import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { COLORS, getWeeklyTargetPct } from "./data";
import type { WeeklyData } from "./data";
import { useDashboard } from "./DashboardContext";
import { downloadImportTemplate } from "./importFromExcel";

function pct(value: number, target: number): number {
  return Math.min(100, Math.round((value / target) * 100));
}

function PctBadge({ value, target }: { value: number; target: number }) {
  const p = pct(value, target);
  const color =
    p >= 80 ? COLORS.leafGreen : p >= 50 ? COLORS.gold : COLORS.coffeeMid;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color + "20", color }}
    >
      {p}%
    </span>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl border shadow-lg p-3 text-sm"
      style={{ background: COLORS.cream, borderColor: COLORS.coffeeMid + "40" }}
    >
      <p className="font-semibold mb-2" style={{ color: COLORS.coffeeDark }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: COLORS.warmGray }}>{entry.name}:</span>
          <span className="font-semibold" style={{ color: COLORS.coffeeDark }}>{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

interface WeeklyProgressProps {
  selectedWeek: number;
  onSelectWeek: (w: number) => void;
}

export function WeeklyProgressTracker({ selectedWeek, onSelectWeek }: WeeklyProgressProps) {
  const [activeTab, setActiveTab] = useState<"table" | "chart">("chart");
  const { weeklyData, kpiTargets } = useDashboard();

  const selected: WeeklyData | undefined = weeklyData.find((w) => w.week === selectedWeek);

  const weeklyChartData = weeklyData.map((w) => ({
    week: `Wk ${w.week}`,
    "Buyers %": Math.round((w.buyersReached / kpiTargets.buyers) * 100),
    "Delegates %": Math.round((w.delegatesConfirmed / kpiTargets.delegates) * 100),
    "Exhibitors %": Math.round((w.exhibitorsConfirmed / kpiTargets.exhibitors) * 100),
    "Sponsorship %": Math.round((w.sponsorshipSecured / kpiTargets.sponsorship) * 100),
    "Weekly Target %": getWeeklyTargetPct(w.week),
  }));

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader
        className="pb-3"
        style={{ background: `linear-gradient(135deg, ${COLORS.coffeeDark} 0%, ${COLORS.coffeeBrown} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-300" />
            <CardTitle className="text-white text-base font-semibold">
              Weekly Progress Tracker
            </CardTitle>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)" }}>
              Target: May 31 · 11 Weeks
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {weeklyData.map((w) => (
                <button
                  key={w.week}
                  onClick={() => onSelectWeek(w.week)}
                  className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                  style={{
                    background: selectedWeek === w.week ? COLORS.gold : "rgba(255,255,255,0.15)",
                    color: selectedWeek === w.week ? COLORS.coffeeDark : "rgba(255,255,255,0.85)",
                  }}
                >
                  W{w.week}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-amber-300/50 text-amber-300 hover:bg-amber-300/20 hover:text-amber-200"
              onClick={downloadImportTemplate}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Template
            </Button>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {(["chart", "table"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-xs px-3 py-1 rounded-full capitalize transition-all"
              style={{
                background: activeTab === tab ? "rgba(255,255,255,0.2)" : "transparent",
                color: activeTab === tab ? "white" : "rgba(255,255,255,0.6)",
              }}
            >
              {tab === "chart" ? "Progress Chart" : "Data Table"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4" style={{ background: COLORS.cream }}>
        {selected !== undefined ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 p-3 rounded-xl"
            style={{ background: COLORS.coffeeBrown + "10", border: `1px solid ${COLORS.coffeeBrown}20` }}
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Week {selected.week}</p>
              <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>{selected.date}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Buyers</p>
              <p className="text-xs" style={{ color: COLORS.warmGrayLight }}>Outreach: <span style={{ color: COLORS.coffeeBrown }}>{selected.buyersOutreach}</span></p>
              <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                {selected.buyersReached} <span style={{ color: COLORS.warmGrayLight }}>/ {kpiTargets.buyers}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Delegates</p>
              <p className="text-xs" style={{ color: COLORS.warmGrayLight }}>Outreach: <span style={{ color: COLORS.coffeeBrown }}>{selected.delegatesOutreach.toLocaleString()}</span></p>
              <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                {selected.delegatesConfirmed.toLocaleString()} <span style={{ color: COLORS.warmGrayLight }}>/ {kpiTargets.delegates.toLocaleString()}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Exhibitors</p>
              <p className="text-xs" style={{ color: COLORS.warmGrayLight }}>Outreach: <span style={{ color: COLORS.coffeeBrown }}>{selected.exhibitorsOutreach}</span></p>
              <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                {selected.exhibitorsConfirmed} <span style={{ color: COLORS.warmGrayLight }}>/ {kpiTargets.exhibitors}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Sponsorship</p>
              <p className="text-xs" style={{ color: COLORS.warmGrayLight }}>Outreach: <span style={{ color: COLORS.coffeeBrown }}>${(selected.sponsorshipOutreach / 1000).toFixed(0)}K</span></p>
              <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                ${(selected.sponsorshipSecured / 1000).toFixed(0)}K <span style={{ color: COLORS.warmGrayLight }}>/ ${(kpiTargets.sponsorship / 1000).toFixed(0)}K</span>
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === "chart" ? (
          <>
            <div className="flex flex-wrap gap-3 mb-2 px-1">
              <span className="text-xs flex items-center gap-1.5" style={{ color: COLORS.warmGray }}>
                <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: COLORS.leafGreen + "80" }} />
                Dashed = Weekly Target
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.coffeeBrown + "15"} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: COLORS.warmGray }}
                  axisLine={{ stroke: COLORS.coffeeBrown + "30" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: COLORS.warmGray }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <ReferenceLine y={100} stroke={COLORS.coffeeBrown + "30"} strokeDasharray="4 4" />
                {/* Weekly target line */}
                <Line
                  type="linear"
                  dataKey="Weekly Target %"
                  stroke={COLORS.leafGreen + "80"}
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Buyers %"
                  stroke={COLORS.coffeeBrown}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.coffeeBrown }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Delegates %"
                  stroke={COLORS.gold}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.gold }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Exhibitors %"
                  stroke={COLORS.leafGreenDark}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.leafGreenDark }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Sponsorship %"
                  stroke={COLORS.leafGreen}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.leafGreen }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLORS.coffeeBrown + "20" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: COLORS.coffeeBrown + "10" }}>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Week</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Date</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Target</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Buyers (Out / Ach)</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Delegates (Out / Ach)</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Exhibitors (Out / Ach)</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Sponsorship (Out / Ach)</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyData.map((row) => (
                  <TableRow
                    key={row.week}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: row.week === selectedWeek ? COLORS.gold + "18" : undefined,
                    }}
                    onClick={() => onSelectWeek(row.week)}
                  >
                    <TableCell className="font-semibold text-xs" style={{ color: COLORS.coffeeDark }}>
                      Week {row.week}
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: COLORS.warmGray }}>{row.date}</TableCell>
                    <TableCell className="text-xs font-medium" style={{ color: COLORS.leafGreenDark }}>
                      {getWeeklyTargetPct(row.week)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: COLORS.coffeeBrown }}>{row.buyersOutreach}</span>
                        <span style={{ color: COLORS.warmGrayLight }}>/</span>
                        <span className="text-xs font-medium" style={{ color: COLORS.coffeeDark }}>{row.buyersReached}</span>
                        <PctBadge value={row.buyersReached} target={kpiTargets.buyers} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: COLORS.coffeeBrown }}>{row.delegatesOutreach}</span>
                        <span style={{ color: COLORS.warmGrayLight }}>/</span>
                        <span className="text-xs font-medium" style={{ color: COLORS.coffeeDark }}>{row.delegatesConfirmed}</span>
                        <PctBadge value={row.delegatesConfirmed} target={kpiTargets.delegates} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: COLORS.coffeeBrown }}>{row.exhibitorsOutreach}</span>
                        <span style={{ color: COLORS.warmGrayLight }}>/</span>
                        <span className="text-xs font-medium" style={{ color: COLORS.coffeeDark }}>{row.exhibitorsConfirmed}</span>
                        <PctBadge value={row.exhibitorsConfirmed} target={kpiTargets.exhibitors} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: COLORS.coffeeBrown }}>${(row.sponsorshipOutreach / 1000).toFixed(0)}K</span>
                        <span style={{ color: COLORS.warmGrayLight }}>/</span>
                        <span className="text-xs font-medium" style={{ color: COLORS.coffeeDark }}>${(row.sponsorshipSecured / 1000).toFixed(0)}K</span>
                        <PctBadge value={row.sponsorshipSecured} target={kpiTargets.sponsorship} />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate" style={{ color: COLORS.warmGray }}>
                      {row.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
