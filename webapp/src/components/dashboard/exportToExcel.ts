import * as XLSX from "xlsx";
import {
  MOCK_WEEKLY_DATA,
  KPI_TARGETS,
  REGIONAL_BUYER_DATA,
  DELEGATE_CATEGORIES,
  EXHIBITOR_CATEGORIES,
  SPONSORSHIP_LEVELS,
} from "./data";

export function exportDashboardToExcel() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary / KPIs ─────────────────────────────────────────────────
  const latestWeek = MOCK_WEEKLY_DATA[MOCK_WEEKLY_DATA.length - 1];
  const kpiRows = [
    ["Africa Coffee and Tea Expo 2026 — Market Outreach Dashboard"],
    ["Exported on", new Date().toLocaleDateString()],
    [],
    ["KPI Summary", "", "", ""],
    ["Metric", "Target", "Achieved (Week 8)", "% Achievement"],
    [
      "Total Buyers",
      KPI_TARGETS.buyers,
      latestWeek.buyersReached,
      `${Math.round((latestWeek.buyersReached / KPI_TARGETS.buyers) * 100)}%`,
    ],
    [
      "Delegates",
      KPI_TARGETS.delegates,
      latestWeek.delegatesConfirmed,
      `${Math.round((latestWeek.delegatesConfirmed / KPI_TARGETS.delegates) * 100)}%`,
    ],
    [
      "Exhibitors",
      KPI_TARGETS.exhibitors,
      latestWeek.exhibitorsConfirmed,
      `${Math.round((latestWeek.exhibitorsConfirmed / KPI_TARGETS.exhibitors) * 100)}%`,
    ],
    [
      "Sponsorship Revenue ($)",
      KPI_TARGETS.sponsorship,
      latestWeek.sponsorshipSecured,
      `${Math.round((latestWeek.sponsorshipSecured / KPI_TARGETS.sponsorship) * 100)}%`,
    ],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(kpiRows);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "KPI Summary");

  // ── Sheet 2: Weekly Progress ────────────────────────────────────────────────
  const weeklyRows = [
    [
      "Week",
      "Date Range",
      "Weekly Target %",
      "Buyers Outreach",
      "Buyers Reached",
      "Buyers % of Target",
      "Delegates Outreach",
      "Delegates Confirmed",
      "Delegates % of Target",
      "Exhibitors Outreach",
      "Exhibitors Confirmed",
      "Exhibitors % of Target",
      "Sponsorship Outreach ($)",
      "Sponsorship Secured ($)",
      "Sponsorship % of Target",
      "Notes",
    ],
    ...MOCK_WEEKLY_DATA.map((w) => [
      `Week ${w.week}`,
      w.date,
      `${Math.round((w.week / 11) * 100)}%`,
      w.buyersOutreach,
      w.buyersReached,
      `${Math.round((w.buyersReached / KPI_TARGETS.buyers) * 100)}%`,
      w.delegatesOutreach,
      w.delegatesConfirmed,
      `${Math.round((w.delegatesConfirmed / KPI_TARGETS.delegates) * 100)}%`,
      w.exhibitorsOutreach,
      w.exhibitorsConfirmed,
      `${Math.round((w.exhibitorsConfirmed / KPI_TARGETS.exhibitors) * 100)}%`,
      w.sponsorshipOutreach,
      w.sponsorshipSecured,
      `${Math.round((w.sponsorshipSecured / KPI_TARGETS.sponsorship) * 100)}%`,
      w.notes,
    ]),
  ];
  const wsWeekly = XLSX.utils.aoa_to_sheet(weeklyRows);
  wsWeekly["!cols"] = [
    { wch: 8 }, { wch: 14 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 18 },
    { wch: 20 }, { wch: 20 }, { wch: 22 },
    { wch: 20 }, { wch: 20 }, { wch: 22 },
    { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsWeekly, "Weekly Progress");

  // ── Sheet 3: Regional Buyers ────────────────────────────────────────────────
  const regionalRows = [
    [
      "Region",
      "Coffee Buyers",
      "Tea Buyers",
      "Total Buyers",
      "% Share",
      "Fully Hosted",
      "Partially Hosted",
      "Event Access",
    ],
    ...REGIONAL_BUYER_DATA.map((r) => [
      r.region,
      r.coffee,
      r.tea,
      r.total,
      `${r.percentage}%`,
      r.fullyHostedTotal,
      r.partiallyHostedTotal,
      r.eventAccessTotal,
    ]),
    [],
    ["TOTAL",
      REGIONAL_BUYER_DATA.reduce((s, r) => s + r.coffee, 0),
      REGIONAL_BUYER_DATA.reduce((s, r) => s + r.tea, 0),
      REGIONAL_BUYER_DATA.reduce((s, r) => s + r.total, 0),
      "100%",
      REGIONAL_BUYER_DATA.reduce((s, r) => s + r.fullyHostedTotal, 0),
      REGIONAL_BUYER_DATA.reduce((s, r) => s + r.partiallyHostedTotal, 0),
      REGIONAL_BUYER_DATA.reduce((s, r) => s + r.eventAccessTotal, 0),
    ],
  ];
  const wsRegional = XLSX.utils.aoa_to_sheet(regionalRows);
  wsRegional["!cols"] = [
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
    { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRegional, "Regional Buyers");

  // ── Sheet 4: Delegates ──────────────────────────────────────────────────────
  const totalDelegateTarget = DELEGATE_CATEGORIES.reduce((s, d) => s + d.target, 0);
  const delegateRows = [
    ["Delegate Category", "Target", "% of Total Target"],
    ...DELEGATE_CATEGORIES.map((d) => [
      d.name,
      d.target,
      `${Math.round((d.target / totalDelegateTarget) * 100)}%`,
    ]),
    [],
    ["TOTAL", totalDelegateTarget, "100%"],
  ];
  const wsDelegates = XLSX.utils.aoa_to_sheet(delegateRows);
  wsDelegates["!cols"] = [{ wch: 40 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsDelegates, "Delegates");

  // ── Sheet 5: Exhibitors ─────────────────────────────────────────────────────
  const totalExhibitorTarget = EXHIBITOR_CATEGORIES.reduce((s, e) => s + e.target, 0);
  const exhibitorRows = [
    ["Exhibitor Category", "Target", "% of Total Target"],
    ...EXHIBITOR_CATEGORIES.map((e) => [
      e.name,
      e.target,
      `${Math.round((e.target / totalExhibitorTarget) * 100)}%`,
    ]),
    [],
    ["TOTAL", totalExhibitorTarget, "100%"],
  ];
  const wsExhibitors = XLSX.utils.aoa_to_sheet(exhibitorRows);
  wsExhibitors["!cols"] = [{ wch: 45 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsExhibitors, "Exhibitors");

  // ── Sheet 6: Sponsorship ────────────────────────────────────────────────────
  const totalSponsorship = SPONSORSHIP_LEVELS.reduce((s, sp) => s + sp.total, 0);
  const sponsorshipRows = [
    ["Sponsorship Level", "Unit Price ($)", "Qty / Slots", "Total Revenue ($)", "% of Total"],
    ...SPONSORSHIP_LEVELS.map((sp) => [
      sp.level,
      sp.unitPrice,
      sp.qty,
      sp.total,
      `${Math.round((sp.total / totalSponsorship) * 100)}%`,
    ]),
    [],
    [
      "TOTAL",
      "",
      SPONSORSHIP_LEVELS.reduce((s, sp) => s + sp.qty, 0),
      totalSponsorship,
      "100%",
    ],
  ];
  const wsSponsorship = XLSX.utils.aoa_to_sheet(sponsorshipRows);
  wsSponsorship["!cols"] = [{ wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsSponsorship, "Sponsorship");

  // ── Download ────────────────────────────────────────────────────────────────
  XLSX.writeFile(wb, "Africa_Coffee_Tea_Expo_2026_Outreach.xlsx");
}

// ── Live data export (uses actual server state, not mock constants) ──────────

interface LiveWeeklyData {
  week: number; date: string;
  buyersOutreach: number; buyersReached: number;
  delegatesOutreach: number; delegatesConfirmed: number;
  exhibitorsOutreach: number; exhibitorsConfirmed: number;
  sponsorshipOutreach: number; sponsorshipSecured: number;
  notes: string;
}
interface LiveKpi { buyers: number; delegates: number; exhibitors: number; sponsorship: number; }
interface LiveCategory { name: string; target: number; outreach: number; confirmed: number; }
interface LiveSponsorship { level: string; qty: number; unitPrice: number; confirmed: number; }
interface LiveRegional { region: string; coffeeTargetBuyers: number; teaTargetBuyers: number; coffeeBuyersReached: number; teaBuyersReached: number; }

export interface LiveDashboardState {
  weeklyData: LiveWeeklyData[];
  kpiTargets: LiveKpi;
  delegateCategories: LiveCategory[];
  exhibitorCategories: LiveCategory[];
  sponsorshipLevels: LiveSponsorship[];
  regionalData: LiveRegional[];
}

export function exportLiveDataToExcel(state: LiveDashboardState) {
  const wb = XLSX.utils.book_new();
  const { weeklyData, kpiTargets, delegateCategories, exhibitorCategories, sponsorshipLevels, regionalData } = state;

  const latestWithData = [...weeklyData].reverse().find(w => w.buyersReached > 0 || w.buyersOutreach > 0) ?? weeklyData[0];

  // ── Sheet 1: KPI Summary ────────────────────────────────────────────────────
  const kpiRows = [
    ["Africa Coffee and Tea Expo 2026 — Market Outreach Dashboard"],
    ["Exported on", new Date().toLocaleDateString()],
    [],
    ["KPI Summary"],
    ["Metric", "Target", "Latest Achieved", "% Achievement"],
    ["Total Buyers", kpiTargets.buyers, latestWithData?.buyersReached ?? 0, `${Math.round(((latestWithData?.buyersReached ?? 0) / kpiTargets.buyers) * 100)}%`],
    ["Delegates", kpiTargets.delegates, latestWithData?.delegatesConfirmed ?? 0, `${Math.round(((latestWithData?.delegatesConfirmed ?? 0) / kpiTargets.delegates) * 100)}%`],
    ["Exhibitors", kpiTargets.exhibitors, latestWithData?.exhibitorsConfirmed ?? 0, `${Math.round(((latestWithData?.exhibitorsConfirmed ?? 0) / kpiTargets.exhibitors) * 100)}%`],
    ["Sponsorship Revenue ($)", kpiTargets.sponsorship, latestWithData?.sponsorshipSecured ?? 0, `${Math.round(((latestWithData?.sponsorshipSecured ?? 0) / kpiTargets.sponsorship) * 100)}%`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(kpiRows);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "KPI Summary");

  // ── Sheet 2: Weekly Progress ────────────────────────────────────────────────
  const weeklyRows = [
    ["Week", "Date Range", "Buyers Outreach", "Buyers Reached", "Buyers %", "Delegates Outreach", "Delegates Confirmed", "Delegates %", "Exhibitors Outreach", "Exhibitors Confirmed", "Exhibitors %", "Sponsorship Outreach ($)", "Sponsorship Secured ($)", "Sponsorship %", "Notes"],
    ...weeklyData.map(w => [
      `Week ${w.week}`, w.date,
      w.buyersOutreach, w.buyersReached, `${Math.round((w.buyersReached / kpiTargets.buyers) * 100)}%`,
      w.delegatesOutreach, w.delegatesConfirmed, `${Math.round((w.delegatesConfirmed / kpiTargets.delegates) * 100)}%`,
      w.exhibitorsOutreach, w.exhibitorsConfirmed, `${Math.round((w.exhibitorsConfirmed / kpiTargets.exhibitors) * 100)}%`,
      w.sponsorshipOutreach, w.sponsorshipSecured, `${Math.round((w.sponsorshipSecured / kpiTargets.sponsorship) * 100)}%`,
      w.notes,
    ]),
  ];
  const wsWeekly = XLSX.utils.aoa_to_sheet(weeklyRows);
  wsWeekly["!cols"] = [{ wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 24 }, { wch: 15 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsWeekly, "Weekly Progress");

  // ── Sheet 3: Delegates ──────────────────────────────────────────────────────
  const totalDelTarget = delegateCategories.reduce((s, d) => s + d.target, 0);
  const delegateRows = [
    ["Delegate Category", "Target", "Outreach", "Confirmed", "% of Target"],
    ...delegateCategories.map(d => [d.name, d.target, d.outreach, d.confirmed, `${Math.round((d.confirmed / Math.max(1, d.target)) * 100)}%`]),
    [], ["TOTAL", totalDelTarget, delegateCategories.reduce((s, d) => s + d.outreach, 0), delegateCategories.reduce((s, d) => s + d.confirmed, 0), ""],
  ];
  const wsDelegates = XLSX.utils.aoa_to_sheet(delegateRows);
  wsDelegates["!cols"] = [{ wch: 40 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsDelegates, "Delegates");

  // ── Sheet 4: Exhibitors ─────────────────────────────────────────────────────
  const totalExhTarget = exhibitorCategories.reduce((s, e) => s + e.target, 0);
  const exhibitorRows = [
    ["Exhibitor Category", "Target", "Outreach", "Confirmed", "% of Target"],
    ...exhibitorCategories.map(e => [e.name, e.target, e.outreach, e.confirmed, `${Math.round((e.confirmed / Math.max(1, e.target)) * 100)}%`]),
    [], ["TOTAL", totalExhTarget, exhibitorCategories.reduce((s, e) => s + e.outreach, 0), exhibitorCategories.reduce((s, e) => s + e.confirmed, 0), ""],
  ];
  const wsExhibitors = XLSX.utils.aoa_to_sheet(exhibitorRows);
  wsExhibitors["!cols"] = [{ wch: 45 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsExhibitors, "Exhibitors");

  // ── Sheet 5: Sponsorship ────────────────────────────────────────────────────
  const sponsorshipRows = [
    ["Level", "Unit Price ($)", "Quantity", "Confirmed", "Revenue ($)", "% of Target"],
    ...sponsorshipLevels.map(s => [s.level, s.unitPrice, s.qty, s.confirmed, s.confirmed * s.unitPrice, `${Math.round((s.confirmed * s.unitPrice / Math.max(1, kpiTargets.sponsorship)) * 100)}%`]),
    [], ["TOTAL", "", sponsorshipLevels.reduce((s, sp) => s + sp.qty, 0), sponsorshipLevels.reduce((s, sp) => s + sp.confirmed, 0), sponsorshipLevels.reduce((s, sp) => s + sp.confirmed * sp.unitPrice, 0), ""],
  ];
  const wsSponsorship = XLSX.utils.aoa_to_sheet(sponsorshipRows);
  wsSponsorship["!cols"] = [{ wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSponsorship, "Sponsorship");

  // ── Sheet 6: Regional ───────────────────────────────────────────────────────
  const regionalRows = [
    ["Region", "Coffee Target", "Tea Target", "Coffee Reached", "Tea Reached", "Total Reached", "Total Target"],
    ...regionalData.map(r => [r.region, r.coffeeTargetBuyers, r.teaTargetBuyers, r.coffeeBuyersReached, r.teaBuyersReached, r.coffeeBuyersReached + r.teaBuyersReached, r.coffeeTargetBuyers + r.teaTargetBuyers]),
  ];
  const wsRegional = XLSX.utils.aoa_to_sheet(regionalRows);
  wsRegional["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsRegional, "Regional");

  // ── Download ────────────────────────────────────────────────────────────────
  XLSX.writeFile(wb, `Africa_Coffee_Tea_Expo_2026_${new Date().toISOString().split("T")[0]}.xlsx`);
}
