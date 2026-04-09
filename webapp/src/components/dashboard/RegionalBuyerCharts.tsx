import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { REGION_PIE_DATA, REGION_COLORS, COLORS } from "./data";
import { useDashboard } from "./DashboardContext";

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { total: number } }>;
}

function PieTooltipContent({ active, payload }: PieTooltipProps) {
  if (!active || !payload || !payload[0]) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-xl border shadow-lg p-3 text-sm"
      style={{ background: "#FFF8F3", borderColor: COLORS.coffeeMid + "40" }}
    >
      <p className="font-semibold" style={{ color: COLORS.coffeeDark }}>{item.name}</p>
      <p style={{ color: COLORS.warmGray }}>
        Share: <span className="font-semibold" style={{ color: COLORS.coffeeBrown }}>{item.value}%</span>
      </p>
      <p style={{ color: COLORS.warmGray }}>
        Target: <span className="font-semibold" style={{ color: COLORS.coffeeBrown }}>{item.payload.total} buyers</span>
      </p>
    </div>
  );
}

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function BarTooltipContent({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl border shadow-lg p-3 text-sm"
      style={{ background: "#FFF8F3", borderColor: COLORS.coffeeMid + "40" }}
    >
      <p className="font-semibold mb-2" style={{ color: COLORS.coffeeDark }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: COLORS.warmGray }}>{entry.name}:</span>
          <span className="font-semibold" style={{ color: COLORS.coffeeDark }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function renderCustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function RegionalBuyerCharts() {
  const { regionalData } = useDashboard();

  const stackedData = regionalData.map((r) => ({
    region: r.region,
    "Coffee Target": r.coffee,
    "Tea Target": r.tea,
    "Outreach": r.outreach,
    "Confirmed": r.confirmed,
  }));

  const outreachData = regionalData.map((r) => ({
    region: r.region,
    Target: r.total,
    Outreach: r.outreach,
    Confirmed: r.confirmed,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader
            className="pb-3 pt-4 px-5"
            style={{ background: "linear-gradient(135deg, #FFF8F3, #FFF0E0)" }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: COLORS.coffeeBrown }} />
              <CardTitle className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                Regional Buyer Distribution
              </CardTitle>
            </div>
            <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>
              Target: 100 buyers across 5 regions
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={REGION_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={40}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {REGION_PIE_DATA.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={REGION_COLORS[entry.name] ?? COLORS.coffeeMid}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltipContent />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value: string) => (
                    <span style={{ color: COLORS.warmGray }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Region summary with outreach/confirmed */}
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {regionalData.map((r) => (
                <div key={r.region} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: REGION_COLORS[r.region] ?? COLORS.coffeeMid }}
                  />
                  <span className="text-xs flex-1" style={{ color: COLORS.warmGray }}>{r.region}</span>
                  <span className="text-xs font-semibold" style={{ color: COLORS.coffeeDark }}>
                    {r.total}
                  </span>
                  {r.outreach > 0 ? (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: COLORS.gold + "20", color: COLORS.gold }}>
                      {r.outreach} out
                    </span>
                  ) : null}
                  {r.confirmed > 0 ? (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: "#4CAF5020", color: "#2E7D32" }}>
                      {r.confirmed} conf
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outreach vs Achieved by Region */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader
            className="pb-3 pt-4 px-5"
            style={{ background: "linear-gradient(135deg, #FFF8F3, #FFF0E0)" }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: COLORS.coffeeBrown }} />
              <CardTitle className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                Outreach vs Achieved by Region
              </CardTitle>
            </div>
            <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>
              Coffee &amp; tea buyers: target, outreach and confirmed
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={stackedData}
                margin={{ top: 5, right: 10, left: -15, bottom: 40 }}
                barSize={12}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.coffeeBrown + "15"} vertical={false} />
                <XAxis
                  dataKey="region"
                  tick={{ fontSize: 10, fill: COLORS.warmGray }}
                  axisLine={{ stroke: COLORS.coffeeBrown + "30" }}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: COLORS.warmGray }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltipContent />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Coffee Target" fill={COLORS.coffeeBrown + "60"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tea Target" fill={"#4CAF5060"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outreach" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Confirmed" fill={"#4CAF50"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Outreach & Confirmed by Region */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader
          className="pb-3 pt-4 px-5"
          style={{ background: "linear-gradient(135deg, #FFF8F3, #FFF0E0)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: COLORS.coffeeBrown }} />
              <CardTitle className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                Buyer Outreach & Confirmed by Region
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: COLORS.coffeeBrown + "15", color: COLORS.coffeeBrown }}>
                Target: {regionalData.reduce((s, r) => s + r.total, 0)}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: COLORS.gold + "20", color: COLORS.gold }}>
                Outreach: {regionalData.reduce((s, r) => s + r.outreach, 0)}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#4CAF5020", color: "#2E7D32" }}>
                Confirmed: {regionalData.reduce((s, r) => s + r.confirmed, 0)}
              </span>
            </div>
          </div>
          <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>
            KPI tracking: target vs outreach vs confirmed buyers per region
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={outreachData}
              margin={{ top: 5, right: 20, left: -15, bottom: 5 }}
              barSize={18}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.coffeeBrown + "15"} vertical={false} />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 10, fill: COLORS.warmGray }}
                axisLine={{ stroke: COLORS.coffeeBrown + "30" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: COLORS.warmGray }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltipContent />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: COLORS.warmGray }}>{value}</span>
                )}
              />
              <Bar dataKey="Target" fill={COLORS.coffeeBrown + "80"} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Outreach" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Confirmed" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
