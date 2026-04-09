import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS } from "./data";
import { useDashboard } from "./DashboardContext";

interface HBarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}

function HBarTooltip({ active, payload, label }: HBarTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-xl border shadow-lg p-3 text-sm min-w-[160px]"
      style={{ background: "#FFF8F3", borderColor: COLORS.coffeeMid + "40" }}
    >
      <p className="font-semibold mb-2" style={{ color: COLORS.coffeeDark }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span style={{ color: COLORS.warmGray }}>{entry.name}</span>
          </span>
          <span className="font-semibold" style={{ color: COLORS.coffeeDark }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function DelegatesChart() {
  const { delegateCategories } = useDashboard();

  const chartData = delegateCategories.map((d) => ({
    name: d.shortName,
    Target: d.target,
    Outreach: d.outreach,
    Confirmed: d.confirmed,
  }));

  const totalTarget = delegateCategories.reduce((s, d) => s + d.target, 0);
  const totalOutreach = delegateCategories.reduce((s, d) => s + d.outreach, 0);
  const totalConfirmed = delegateCategories.reduce((s, d) => s + d.confirmed, 0);

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader
        className="pb-3 pt-4 px-5"
        style={{ background: "linear-gradient(135deg, #FFF8F3, #FFF0E0)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: COLORS.coffeeBrown }} />
            <CardTitle className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
              Delegate Categories
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: COLORS.coffeeBrown + "15", color: COLORS.coffeeBrown }}
            >
              Target: {totalTarget}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: COLORS.gold + "20", color: COLORS.gold }}
            >
              Outreach: {totalOutreach}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#4CAF5020", color: "#2E7D32" }}
            >
              Confirmed: {totalConfirmed}
            </span>
          </div>
        </div>
        <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>
          12 categories — target vs outreach vs confirmed
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 2, right: 40, left: 0, bottom: 2 }}
            barSize={10}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.coffeeBrown + "15"} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: COLORS.warmGray }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 10, fill: COLORS.warmGray }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<HBarTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value: string) => (
                <span style={{ color: COLORS.warmGray }}>{value}</span>
              )}
            />
            <Bar dataKey="Target" fill={COLORS.coffeeBrown + "80"} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Outreach" fill={COLORS.gold} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Confirmed" fill="#4CAF50" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ExhibitorsChart() {
  const { exhibitorCategories } = useDashboard();

  const chartData = exhibitorCategories.map((e) => ({
    name: e.shortName,
    Target: e.target,
    Outreach: e.outreach,
    Confirmed: e.confirmed,
  }));

  const totalTarget = exhibitorCategories.reduce((s, e) => s + e.target, 0);
  const totalOutreach = exhibitorCategories.reduce((s, e) => s + e.outreach, 0);
  const totalConfirmed = exhibitorCategories.reduce((s, e) => s + e.confirmed, 0);

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader
        className="pb-3 pt-4 px-5"
        style={{ background: "linear-gradient(135deg, #FFF8F3, #FFF0E0)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: COLORS.coffeeBrown }} />
            <CardTitle className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
              Exhibitor Categories
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: COLORS.coffeeBrown + "15", color: COLORS.coffeeBrown }}
            >
              Target: {totalTarget}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: COLORS.gold + "20", color: COLORS.gold }}
            >
              Outreach: {totalOutreach}
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#4CAF5020", color: "#2E7D32" }}
            >
              Confirmed: {totalConfirmed}
            </span>
          </div>
        </div>
        <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>
          15 categories — target vs outreach vs confirmed
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 2, right: 40, left: 0, bottom: 2 }}
            barSize={10}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.coffeeBrown + "15"} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: COLORS.warmGray }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 10, fill: COLORS.warmGray }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<HBarTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value: string) => (
                <span style={{ color: COLORS.warmGray }}>{value}</span>
              )}
            />
            <Bar dataKey="Target" fill={COLORS.coffeeBrown + "80"} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Outreach" fill={COLORS.gold} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Confirmed" fill="#4CAF50" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
