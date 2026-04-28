import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coffee, Users, Building2, DollarSign } from "lucide-react";
import { COLORS } from "./data";
import { useDashboard } from "./DashboardContext";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  target: string;
  outreach: string;
  achieved: string;
  achievedRaw: number;
  outreachRaw: number;
  targetRaw: number;
  accent: string;
  bg: string;
}

function KpiCard({ icon, label, target, outreach, achieved, achievedRaw, outreachRaw, targetRaw, accent, bg }: KpiCardProps) {
  const achievedPct = Math.min(100, Math.round((achievedRaw / targetRaw) * 100));
  const outreachPct = Math.min(100, Math.round((outreachRaw / targetRaw) * 100));
  return (
    <Card className="relative overflow-hidden border-0 shadow-md" style={{ background: bg }}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: accent + "22" }}
          >
            <div style={{ color: accent }}>{icon}</div>
          </div>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: accent + "18", color: accent }}
          >
            {achievedPct}% achieved
          </span>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: COLORS.warmGray }}>
          {label}
        </p>
        {/* Three KPI numbers */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Target</p>
            <p className="text-base font-bold" style={{ color: COLORS.coffeeDark }}>{target}</p>
          </div>
          <div className="text-center border-l border-r" style={{ borderColor: accent + "25" }}>
            <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Outreach</p>
            <p className="text-base font-bold" style={{ color: accent }}>{outreach}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: COLORS.warmGray }}>Achieved</p>
            <p className="text-base font-bold" style={{ color: COLORS.leafGreen }}>{achieved}</p>
          </div>
        </div>
        {/* Dual progress bars */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-14 text-right shrink-0" style={{ color: COLORS.warmGrayLight }}>Outreach</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: accent + "20" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${outreachPct}%`, background: accent + "80" }} />
            </div>
            <span className="text-[10px] w-6 shrink-0" style={{ color: COLORS.warmGrayLight }}>{outreachPct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] w-14 text-right shrink-0" style={{ color: COLORS.warmGrayLight }}>Achieved</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: COLORS.leafGreen + "20" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${achievedPct}%`, background: COLORS.leafGreen }} />
            </div>
            <span className="text-[10px] w-6 shrink-0" style={{ color: COLORS.warmGrayLight }}>{achievedPct}%</span>
          </div>
        </div>
        {/* Keep Progress for styling compatibility */}
        <Progress value={0} className="h-0 opacity-0" />
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const { weeklyData, kpiTargets } = useDashboard();
  // Insights are computed cumulatively across all weekly rows and are independent of any week filter.
  const cumulativeInsights = weeklyData.reduce(
    (acc, row) => ({
      buyersOutreach: Math.max(acc.buyersOutreach, row.buyersOutreach),
      buyersReached: Math.max(acc.buyersReached, row.buyersReached),
      delegatesOutreach: Math.max(acc.delegatesOutreach, row.delegatesOutreach),
      delegatesConfirmed: Math.max(acc.delegatesConfirmed, row.delegatesConfirmed),
      exhibitorsOutreach: Math.max(acc.exhibitorsOutreach, row.exhibitorsOutreach),
      exhibitorsConfirmed: Math.max(acc.exhibitorsConfirmed, row.exhibitorsConfirmed),
      sponsorshipOutreach: Math.max(acc.sponsorshipOutreach, row.sponsorshipOutreach),
      sponsorshipSecured: Math.max(acc.sponsorshipSecured, row.sponsorshipSecured),
    }),
    {
      buyersOutreach: 0,
      buyersReached: 0,
      delegatesOutreach: 0,
      delegatesConfirmed: 0,
      exhibitorsOutreach: 0,
      exhibitorsConfirmed: 0,
      sponsorshipOutreach: 0,
      sponsorshipSecured: 0,
    }
  );

  if (weeklyData.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={<Coffee className="w-5 h-5" />}
        label="Buyer Targets"
        target={kpiTargets.buyers.toLocaleString()}
        outreach={cumulativeInsights.buyersOutreach.toString()}
        achieved={cumulativeInsights.buyersReached.toString()}
        achievedRaw={cumulativeInsights.buyersReached}
        outreachRaw={cumulativeInsights.buyersOutreach}
        targetRaw={kpiTargets.buyers}
        accent={COLORS.coffeeBrown}
        bg="#FAF7F2"
      />
      <KpiCard
        icon={<Users className="w-5 h-5" />}
        label="Delegates"
        target={kpiTargets.delegates.toLocaleString()}
        outreach={cumulativeInsights.delegatesOutreach.toLocaleString()}
        achieved={cumulativeInsights.delegatesConfirmed.toLocaleString()}
        achievedRaw={cumulativeInsights.delegatesConfirmed}
        outreachRaw={cumulativeInsights.delegatesOutreach}
        targetRaw={kpiTargets.delegates}
        accent={COLORS.gold}
        bg="#FDFAF0"
      />
      <KpiCard
        icon={<Building2 className="w-5 h-5" />}
        label="Exhibitors"
        target={kpiTargets.exhibitors.toLocaleString()}
        outreach={cumulativeInsights.exhibitorsOutreach.toString()}
        achieved={cumulativeInsights.exhibitorsConfirmed.toString()}
        achievedRaw={cumulativeInsights.exhibitorsConfirmed}
        outreachRaw={cumulativeInsights.exhibitorsOutreach}
        targetRaw={kpiTargets.exhibitors}
        accent={COLORS.leafGreenDark}
        bg="#F5FAF0"
      />
      <KpiCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Sponsorship Revenue"
        target={`$${(kpiTargets.sponsorship / 1000).toFixed(0)}K`}
        outreach={`$${(cumulativeInsights.sponsorshipOutreach / 1000).toFixed(0)}K`}
        achieved={`$${(cumulativeInsights.sponsorshipSecured / 1000).toFixed(0)}K`}
        achievedRaw={cumulativeInsights.sponsorshipSecured}
        outreachRaw={cumulativeInsights.sponsorshipOutreach}
        targetRaw={kpiTargets.sponsorship}
        accent={COLORS.leafGreen}
        bg="#F3FAF2"
      />
    </div>
  );
}
