import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
  Legend,
} from "recharts";
import { COLORS } from "./data";
import { useDashboard } from "./DashboardContext";

interface SponsorTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: { level: string; unitPrice: number; qty: number; color: string } }>;
  label?: string;
}

function SponsorTooltip({ active, payload, label }: SponsorTooltipProps) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl border shadow-lg p-3 text-sm"
      style={{ background: "#FFF8F3", borderColor: COLORS.coffeeMid + "40" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
        <p className="font-semibold" style={{ color: COLORS.coffeeDark }}>{d.level}</p>
      </div>
      <p style={{ color: COLORS.warmGray }}>
        Unit Price: <span className="font-semibold" style={{ color: COLORS.coffeeDark }}>
          ${d.unitPrice.toLocaleString()}
        </span>
      </p>
      <p style={{ color: COLORS.warmGray }}>
        Quantity: <span className="font-semibold" style={{ color: COLORS.coffeeDark }}>{d.qty}</span>
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: COLORS.warmGray }}>
          {entry.name}: <span className="font-semibold" style={{ color: entry.name === "Confirmed" ? "#4CAF50" : entry.name === "Outreach" ? COLORS.gold : COLORS.coffeeDark }}>
            ${entry.value.toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
}

export function SponsorshipChart() {
  const { sponsorshipLevels } = useDashboard();

  const chartData = sponsorshipLevels.map((s) => ({
    level: s.level,
    Target: s.total,
    Outreach: s.outreach,
    Confirmed: s.confirmed,
    unitPrice: s.unitPrice,
    qty: s.qty,
    color: s.color,
  }));

  const totalTarget = sponsorshipLevels.reduce((sum, s) => sum + s.total, 0);
  const totalOutreach = sponsorshipLevels.reduce((sum, s) => sum + s.outreach, 0);
  const totalConfirmed = sponsorshipLevels.reduce((sum, s) => sum + s.confirmed, 0);

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader
        className="pb-3 pt-4 px-5"
        style={{ background: "linear-gradient(135deg, #4A2C1A 0%, #6F4E37 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-300" />
            <CardTitle className="text-sm font-semibold text-white">
              Sponsorship Projections
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <div>
                <p className="text-xs text-amber-200/80">Target</p>
                <p className="text-base font-bold text-amber-300">${(totalTarget / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-xs text-amber-200/80">Outreach</p>
                <p className="text-base font-bold" style={{ color: COLORS.gold }}>${(totalOutreach / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-xs text-amber-200/80">Confirmed</p>
                <p className="text-base font-bold" style={{ color: "#4CAF50" }}>${(totalConfirmed / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-xs text-amber-200/80">Slots</p>
                <p className="text-base font-bold text-amber-300">23</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-4" style={{ background: "#FFF8F3" }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
          {sponsorshipLevels.map((s) => (
            <div
              key={s.level}
              className="rounded-xl p-3 text-center border"
              style={{
                background: s.color + "18",
                borderColor: s.color + "40",
              }}
            >
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold"
                style={{ background: s.color, color: "#FFF8F3" }}
              >
                {s.qty}x
              </div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: COLORS.coffeeDark }}>{s.level}</p>
              <p className="text-xs" style={{ color: COLORS.warmGray }}>
                ${s.unitPrice.toLocaleString()}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: COLORS.coffeeDark }}>
                ${(s.total / 1000).toFixed(0)}K
              </p>
              {s.outreach > 0 ? (
                <p className="text-xs mt-0.5" style={{ color: COLORS.gold }}>
                  Out: ${(s.outreach / 1000).toFixed(0)}K
                </p>
              ) : null}
              {s.confirmed > 0 ? (
                <p className="text-xs" style={{ color: "#2E7D32" }}>
                  Conf: ${(s.confirmed / 1000).toFixed(0)}K
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -5, bottom: 5 }} barSize={22} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.coffeeBrown + "15"} vertical={false} />
            <XAxis
              dataKey="level"
              tick={{ fontSize: 11, fill: COLORS.warmGray }}
              axisLine={{ stroke: COLORS.coffeeBrown + "30" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              tick={{ fontSize: 10, fill: COLORS.warmGray }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<SponsorTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value: string) => (
                <span style={{ color: COLORS.warmGray }}>{value}</span>
              )}
            />
            <Bar dataKey="Target" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.level} fill={entry.color === "#E5E4E2" ? "#9E9E9E" : entry.color} fillOpacity={0.5} />
              ))}
              <LabelList
                dataKey="Target"
                position="top"
                formatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                style={{ fontSize: 10, fontWeight: 600, fill: COLORS.coffeeDark }}
              />
            </Bar>
            <Bar dataKey="Outreach" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Confirmed" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
