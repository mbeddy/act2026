import { AlertTriangle, TrendingUp, Users, Award, Package } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { COLORS } from "./data";
import type { TrackingStatus } from "./trackerTypes";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[140px]"
      style={{ background: 'white', border: `1px solid ${COLORS.creamDark}`, boxShadow: '0 1px 3px rgba(74,55,40,0.06)' }}
    >
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ background: accent + '18', color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: COLORS.slateGray }}>{label}</div>
        <div className="text-base font-bold leading-tight" style={{ color: COLORS.coffeeDark }}>{value}</div>
        {sub !== undefined ? (
          <div className="text-xs truncate" style={{ color: COLORS.slateGrayLight }}>{sub}</div>
        ) : null}
      </div>
    </div>
  );
}

export function SummaryBanner() {
  const { programSections, sponsorshipLevels, exhibitorCategories, kpiTargets } = useDashboard();

  // Programme Completion: average of all program item percentComplete
  const allProgramItems = programSections.flatMap(s => s.items);
  const programCompletion = allProgramItems.length > 0
    ? Math.round(allProgramItems.reduce((sum, i) => sum + i.percentComplete, 0) / allProgramItems.length)
    : 0;

  // Speakers Confirmed: from programSections[0] (Speakers section)
  const speakersSection = programSections[0];
  const speakersConfirmed = speakersSection
    ? speakersSection.items.reduce((sum, item) => {
        const n = parseInt(item.confirmed, 10);
        return sum + (isNaN(n) ? 0 : n);
      }, 0)
    : 0;
  const speakersTarget = 40;

  // Sponsors Closed: sum of sponsorship confirmed value
  const sponsorsClosed = sponsorshipLevels.reduce((sum, s) => sum + s.confirmed * s.unitPrice, 0);
  const sponsorsTarget = kpiTargets.sponsorship;

  // Exhibitors Signed: sum of all exhibitor confirmed
  const exhibitorsSigned = exhibitorCategories.reduce((sum, e) => sum + e.confirmed, 0);
  const exhibitorsTarget = kpiTargets.exhibitors;

  // Key Risk: first at-risk or behind item across all program sections
  const keyRiskItem = allProgramItems.find(
    (i): boolean => (i.status as TrackingStatus) === 'at-risk' || (i.status as TrackingStatus) === 'behind'
  );
  const keyRisk = keyRiskItem !== undefined ? keyRiskItem.risk || keyRiskItem.item : null;

  return (
    <div
      className="flex flex-wrap gap-3 p-3 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${COLORS.cream} 0%, white 100%)`,
        border: `1px solid ${COLORS.creamDark}`,
        boxShadow: '0 2px 8px rgba(74,55,40,0.07)',
      }}
    >
      <StatCard
        icon={<TrendingUp className="w-4 h-4" />}
        label="Programme Completion"
        value={`${programCompletion}%`}
        sub={`${allProgramItems.length} items tracked`}
        accent={programCompletion >= 70 ? COLORS.green : programCompletion >= 40 ? COLORS.amber : '#E53935'}
      />
      <StatCard
        icon={<Users className="w-4 h-4" />}
        label="Speakers Confirmed"
        value={`${speakersConfirmed}/${speakersTarget}`}
        sub="Target: 40 speakers"
        accent={COLORS.leafGreen}
      />
      <StatCard
        icon={<Award className="w-4 h-4" />}
        label="Sponsors Closed"
        value={`$${(sponsorsClosed / 1000).toFixed(0)}k`}
        sub={`of $${(sponsorsTarget / 1000).toFixed(0)}k target`}
        accent={COLORS.gold}
      />
      <StatCard
        icon={<Package className="w-4 h-4" />}
        label="Exhibitors Signed"
        value={`${exhibitorsSigned}/${exhibitorsTarget}`}
        sub={`${Math.round((exhibitorsSigned / exhibitorsTarget) * 100)}% of target`}
        accent={COLORS.coffeeBrown}
      />
      {keyRisk !== null ? (
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-xl flex-1 min-w-[200px]"
          style={{ background: '#E5393508', border: `1px solid #E5393525` }}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#E53935' }} />
          <div className="min-w-0">
            <div className="text-xs font-medium" style={{ color: '#E53935' }}>Key Risk</div>
            <div
              className="text-xs mt-0.5 line-clamp-2"
              style={{ color: COLORS.coffeeDark }}
            >
              {keyRisk}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
