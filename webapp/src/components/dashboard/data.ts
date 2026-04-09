// ─── Dashboard Data Constants ─────────────────────────────────────────────────
// Colors inspired by the Africa Coffee & Tea Expo 2026 logo
// Primary: olive leaf green, coffee bean brown, slate gray

export const COLORS = {
  // From the logo — leaf green
  leafGreen: "#8DB53C",
  leafGreenDark: "#6B8B2A",
  leafGreenLight: "#A8CC55",
  // From the logo — coffee bean brown
  coffeeDark: "#4A3728",
  coffeeBrown: "#7B6B58",
  coffeeMid: "#9A8472",
  coffeeLight: "#B5A090",
  // Logo gray (text)
  slateGray: "#5A5A5A",
  slateGrayLight: "#8A8A8A",
  // Aliases for backwards compatibility
  warmGray: "#5A5A5A",
  warmGrayLight: "#8A8A8A",
  // Accent gold
  gold: "#C8A42A",
  goldLight: "#DEB94A",
  // Supporting
  cream: "#FAF7F2",
  creamDark: "#F0EAE0",
  green: "#5A9C3A",
  amber: "#D4880E",
  teal: "#2A8B7A",
};

export const REGION_COLORS: Record<string, string> = {
  Europe: "#7B6B58",
  "Middle East": "#C8A42A",
  "North America": "#9A8472",
  Asia: "#8DB53C",
  "Intra-Africa": "#4A3728",
};

// ─── KPI Targets ───────────────────────────────────────────────────────────────

export const KPI_TARGETS = {
  buyers: 100,
  delegates: 1000,
  exhibitors: 152,
  sponsorship: 360000,
};

// ─── Weekly Target Schedule ────────────────────────────────────────────────────
// Target completion date: May 31, 2026
// Starting from week of March 16, 2026 = 11 weeks total

export const TOTAL_WEEKS = 11;

export function getWeeklyTargetPct(weekNumber: number): number {
  return Math.min(100, Math.round((weekNumber / TOTAL_WEEKS) * 100));
}

export const WEEK_DATES: Record<number, string> = {
  1: "Mar 16–20",
  2: "Mar 23–27",
  3: "Mar 30–Apr 3",
  4: "Apr 6–10",
  5: "Apr 13–17",
  6: "Apr 20–24",
  7: "Apr 27–May 1",
  8: "May 4–8",
  9: "May 11–15",
  10: "May 18–22",
  11: "May 25–31",
};

// ─── Regional Buyer Data ───────────────────────────────────────────────────────

export interface RegionBuyerData {
  region: string;
  coffee: number;
  tea: number;
  total: number;
  percentage: number;
  fullyHostedCoffee: number;
  fullyHostedTea: number;
  fullyHostedTotal: number;
  partiallyHostedCoffee: number;
  partiallyHostedTea: number;
  partiallyHostedTotal: number;
  eventAccessCoffee: number;
  eventAccessTea: number;
  eventAccessTotal: number;
  outreach: number;
  confirmed: number;
}

export const REGIONAL_BUYER_DATA: RegionBuyerData[] = [
  {
    region: "Europe",
    coffee: 20, tea: 12, total: 32, percentage: 32,
    fullyHostedCoffee: 4, fullyHostedTea: 1, fullyHostedTotal: 3,
    partiallyHostedCoffee: 12, partiallyHostedTea: 6, partiallyHostedTotal: 18,
    eventAccessCoffee: 4, eventAccessTea: 2, eventAccessTotal: 6,
    outreach: 0, confirmed: 0,
  },
  {
    region: "Middle East",
    coffee: 10, tea: 8, total: 18, percentage: 18,
    fullyHostedCoffee: 6, fullyHostedTea: 5, fullyHostedTotal: 11,
    partiallyHostedCoffee: 4, partiallyHostedTea: 2, partiallyHostedTotal: 6,
    eventAccessCoffee: 1, eventAccessTea: 1, eventAccessTotal: 2,
    outreach: 0, confirmed: 0,
  },
  {
    region: "North America",
    coffee: 12, tea: 6, total: 18, percentage: 18,
    fullyHostedCoffee: 2, fullyHostedTea: 1, fullyHostedTotal: 3,
    partiallyHostedCoffee: 6, partiallyHostedTea: 4, partiallyHostedTotal: 10,
    eventAccessCoffee: 2, eventAccessTea: 1, eventAccessTotal: 3,
    outreach: 0, confirmed: 0,
  },
  {
    region: "Asia",
    coffee: 8, tea: 8, total: 16, percentage: 16,
    fullyHostedCoffee: 6, fullyHostedTea: 4, fullyHostedTotal: 9,
    partiallyHostedCoffee: 3, partiallyHostedTea: 1, partiallyHostedTotal: 4,
    eventAccessCoffee: 2, eventAccessTea: 1, eventAccessTotal: 3,
    outreach: 0, confirmed: 0,
  },
  {
    region: "Intra-Africa",
    coffee: 10, tea: 6, total: 16, percentage: 16,
    fullyHostedCoffee: 8, fullyHostedTea: 4, fullyHostedTotal: 12,
    partiallyHostedCoffee: 1, partiallyHostedTea: 1, partiallyHostedTotal: 2,
    eventAccessCoffee: 5, eventAccessTea: 1, eventAccessTotal: 6,
    outreach: 0, confirmed: 0,
  },
];

export const REGION_PIE_DATA = REGIONAL_BUYER_DATA.map((r) => ({
  name: r.region,
  value: r.percentage,
  total: r.total,
}));

export const REGION_STACKED_DATA = REGIONAL_BUYER_DATA.map((r) => ({
  region: r.region,
  "Fully Hosted": r.fullyHostedTotal,
  "Partially Hosted": r.partiallyHostedTotal,
  "Event Access": r.eventAccessTotal,
}));

// ─── Delegates Data ────────────────────────────────────────────────────────────

export interface DelegateCategory {
  name: string;
  target: number;
  shortName: string;
  outreach: number;
  confirmed: number;
}

export const DELEGATE_CATEGORIES: DelegateCategory[] = [
  { name: "Cooperative & Producer Unions", shortName: "Coop & Producers", target: 200, outreach: 0, confirmed: 0 },
  { name: "Sustainable & Climate-Smart Growers", shortName: "Sustainable Growers", target: 120, outreach: 0, confirmed: 0 },
  { name: "Agripreneurs", shortName: "Agripreneurs", target: 100, outreach: 0, confirmed: 0 },
  { name: "Youth in Coffee and Tea", shortName: "Youth", target: 100, outreach: 0, confirmed: 0 },
  { name: "Financial and Logistics Sector", shortName: "Finance & Logistics", target: 100, outreach: 0, confirmed: 0 },
  { name: "Innovative Coffee & Tea Products", shortName: "Innovative Products", target: 80, outreach: 0, confirmed: 0 },
  { name: "Distributors", shortName: "Distributors", target: 70, outreach: 0, confirmed: 0 },
  { name: "Women in Coffee & Tea", shortName: "Women in C&T", target: 50, outreach: 0, confirmed: 0 },
  { name: "Academia & Research Institutions", shortName: "Academia & Research", target: 50, outreach: 0, confirmed: 0 },
  { name: "Embassies and Diplomats", shortName: "Embassies", target: 50, outreach: 0, confirmed: 0 },
  { name: "Tea and Coffee Enthusiasts", shortName: "Enthusiasts", target: 50, outreach: 0, confirmed: 0 },
  { name: "Inclusive Enterprises & PWDs", shortName: "Inclusive Enterprises", target: 30, outreach: 0, confirmed: 0 },
];

// ─── Exhibitors Data ───────────────────────────────────────────────────────────

export interface ExhibitorCategory {
  name: string;
  shortName: string;
  target: number;
  outreach: number;
  confirmed: number;
}

export const EXHIBITOR_CATEGORIES: ExhibitorCategory[] = [
  { name: "Coffee Exporters & Producers", shortName: "Coffee Exporters", target: 40, outreach: 0, confirmed: 0 },
  { name: "Tea Exporters", shortName: "Tea Exporters", target: 25, outreach: 0, confirmed: 0 },
  { name: "Packaging & Value Addition Companies", shortName: "Packaging & Value", target: 15, outreach: 0, confirmed: 0 },
  { name: "Retailers and Coffee Chains", shortName: "Retailers & Chains", target: 10, outreach: 0, confirmed: 0 },
  { name: "Finance Institutions", shortName: "Finance", target: 10, outreach: 0, confirmed: 0 },
  { name: "Trade & Export Promotion Bodies", shortName: "Trade & Export", target: 10, outreach: 0, confirmed: 0 },
  { name: "Logistics & Freight Companies", shortName: "Logistics", target: 5, outreach: 0, confirmed: 0 },
  { name: "Coffee & Tea Technology Companies", shortName: "Technology", target: 5, outreach: 0, confirmed: 0 },
  { name: "Sustainability & Certification Bodies", shortName: "Sustainability", target: 5, outreach: 0, confirmed: 0 },
  { name: "Brokers and Distributors", shortName: "Brokers", target: 5, outreach: 0, confirmed: 0 },
  { name: "Warehouses", shortName: "Warehouses", target: 5, outreach: 0, confirmed: 0 },
  { name: "Equipment and Machineries", shortName: "Equipment", target: 5, outreach: 0, confirmed: 0 },
  { name: "Government Regulator", shortName: "Government", target: 5, outreach: 0, confirmed: 0 },
  { name: "Private Labels", shortName: "Private Labels", target: 5, outreach: 0, confirmed: 0 },
  { name: "Disaster Impact on Coffee & Tea", shortName: "Disaster Impact", target: 2, outreach: 0, confirmed: 0 },
];

// ─── Sponsorship Data ──────────────────────────────────────────────────────────

export interface SponsorshipLevel {
  level: string;
  unitPrice: number;
  qty: number;
  total: number;
  color: string;
  outreach: number;
  confirmed: number;
}

export const SPONSORSHIP_LEVELS: SponsorshipLevel[] = [
  { level: "Platinum", unitPrice: 50000, qty: 1, total: 50000, color: "#E5E4E2", outreach: 0, confirmed: 0 },
  { level: "Diamond", unitPrice: 35000, qty: 2, total: 70000, color: "#B9F2FF", outreach: 0, confirmed: 0 },
  { level: "Gold", unitPrice: 25000, qty: 4, total: 100000, color: "#C8A42A", outreach: 0, confirmed: 0 },
  { level: "Silver", unitPrice: 15000, qty: 6, total: 90000, color: "#C0C0C0", outreach: 0, confirmed: 0 },
  { level: "Bronze", unitPrice: 5000, qty: 10, total: 50000, color: "#CD7F32", outreach: 0, confirmed: 0 },
];

// ─── Weekly Progress Data ─────────────────────────────────────────────────────
// Tracking period: March 16 – May 31, 2026 (11 weeks)
// Each week tracks: outreach (contacts made) and achieved (confirmed/secured)

export interface WeeklyData {
  week: number;
  date: string;
  // Outreach — how many have been contacted/reached out to
  buyersOutreach: number;
  delegatesOutreach: number;
  exhibitorsOutreach: number;
  sponsorshipOutreach: number; // $ value contacted
  // Achieved — confirmed/secured
  buyersReached: number;
  delegatesConfirmed: number;
  exhibitorsConfirmed: number;
  sponsorshipSecured: number;
  notes: string;
}

export const MOCK_WEEKLY_DATA: WeeklyData[] = [
  {
    week: 1, date: "Mar 16–20",
    buyersOutreach: 18, delegatesOutreach: 95, exhibitorsOutreach: 22, sponsorshipOutreach: 60000,
    buyersReached: 6, delegatesConfirmed: 42, exhibitorsConfirmed: 7, sponsorshipSecured: 15000,
    notes: "Kickoff outreach — initial buyer and delegate contacts, first sponsor discussion",
  },
  {
    week: 2, date: "Mar 23–27",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 3, date: "Mar 30–Apr 3",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 4, date: "Apr 6–10",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 5, date: "Apr 13–17",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 6, date: "Apr 20–24",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 7, date: "Apr 27–May 1",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 8, date: "May 4–8",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 9, date: "May 11–15",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 10, date: "May 18–22",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
  {
    week: 11, date: "May 25–31",
    buyersOutreach: 0, delegatesOutreach: 0, exhibitorsOutreach: 0, sponsorshipOutreach: 0,
    buyersReached: 0, delegatesConfirmed: 0, exhibitorsConfirmed: 0, sponsorshipSecured: 0,
    notes: "",
  },
];

export const WEEKLY_CHART_DATA = MOCK_WEEKLY_DATA.map((w) => ({
  week: `Wk ${w.week}`,
  "Buyers %": Math.round((w.buyersReached / KPI_TARGETS.buyers) * 100),
  "Delegates %": Math.round((w.delegatesConfirmed / KPI_TARGETS.delegates) * 100),
  "Exhibitors %": Math.round((w.exhibitorsConfirmed / KPI_TARGETS.exhibitors) * 100),
  "Sponsorship %": Math.round((w.sponsorshipSecured / KPI_TARGETS.sponsorship) * 100),
  "Weekly Target %": getWeeklyTargetPct(w.week),
}));
