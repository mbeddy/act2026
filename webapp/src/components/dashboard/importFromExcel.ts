import * as XLSX from "xlsx";
import type { WeeklyData, DelegateCategory, ExhibitorCategory, SponsorshipLevel, RegionBuyerData } from "./data";
import type { KpiTargets } from "./DashboardContext";
import { DELEGATE_CATEGORIES, EXHIBITOR_CATEGORIES, SPONSORSHIP_LEVELS, REGIONAL_BUYER_DATA } from "./data";

export interface ParsedImportResult {
  weeklyData: WeeklyData[];
  kpiTargets?: KpiTargets;
  delegateCategories?: DelegateCategory[];
  exhibitorCategories?: ExhibitorCategory[];
  sponsorshipLevels?: SponsorshipLevel[];
  regionalData?: RegionBuyerData[];
  warnings: string[];
}

/**
 * Parses an uploaded .xlsx file and returns WeeklyData[] and optional KpiTargets/category data.
 */
export function parseImportExcel(file: File): Promise<ParsedImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file."));
          return;
        }

        const wb = XLSX.read(data, { type: "array" });
        const warnings: string[] = [];

        // ── Parse Weekly Progress sheet ───────────────────────────────────────
        const weeklySheetName = wb.SheetNames.find(
          (n) => n.trim().toLowerCase() === "weekly progress"
        );

        if (!weeklySheetName) {
          reject(new Error('Could not find a sheet named "Weekly Progress". Please use the download template.'));
          return;
        }

        const ws = wb.Sheets[weeklySheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (rows.length === 0) {
          reject(new Error('The "Weekly Progress" sheet has no data rows.'));
          return;
        }

        const weeklyData: WeeklyData[] = [];

        rows.forEach((row, idx) => {
          const rowNum = idx + 2;

          const rawWeek = row["Week"] ?? row["week"] ?? "";
          const rawDate = row["Date Range"] ?? row["date range"] ?? row["Date"] ?? "";
          const rawBuyersOutreach = row["Buyers Outreach"] ?? row["buyers outreach"] ?? "";
          const rawDelegatesOutreach = row["Delegates Outreach"] ?? row["delegates outreach"] ?? "";
          const rawExhibitorsOutreach = row["Exhibitors Outreach"] ?? row["exhibitors outreach"] ?? "";
          const rawSponsorshipOutreach = row["Sponsorship Outreach ($)"] ?? row["sponsorship outreach ($)"] ?? row["Sponsorship Outreach"] ?? "";
          const rawBuyers = row["Buyers Reached"] ?? row["buyers reached"] ?? row["Buyers_Reached"] ?? "";
          const rawDelegates = row["Delegates Confirmed"] ?? row["delegates confirmed"] ?? row["Delegates_Confirmed"] ?? "";
          const rawExhibitors = row["Exhibitors Confirmed"] ?? row["exhibitors confirmed"] ?? row["Exhibitors_Confirmed"] ?? "";
          const rawSponsorship = row["Sponsorship Secured ($)"] ?? row["sponsorship secured ($)"] ?? row["Sponsorship_Secured_($)"] ?? row["Sponsorship Secured"] ?? "";
          const rawNotes = row["Notes"] ?? row["notes"] ?? "";

          const weekStr = String(rawWeek).replace(/^week\s*/i, "").trim();
          const weekNum = parseInt(weekStr, 10);

          if (isNaN(weekNum) || weekNum < 1) {
            warnings.push(`Row ${rowNum}: Skipped — invalid Week value "${rawWeek}".`);
            return;
          }

          const buyersOutreach = parseFloat(String(rawBuyersOutreach));
          const delegatesOutreach = parseFloat(String(rawDelegatesOutreach));
          const exhibitorsOutreach = parseFloat(String(rawExhibitorsOutreach));
          const sponsorshipOutreach = parseFloat(String(rawSponsorshipOutreach));
          const buyers = parseFloat(String(rawBuyers));
          const delegates = parseFloat(String(rawDelegates));
          const exhibitors = parseFloat(String(rawExhibitors));
          const sponsorship = parseFloat(String(rawSponsorship));

          if (isNaN(buyers)) warnings.push(`Row ${rowNum}: "Buyers Reached" is not a number — defaulting to 0.`);
          if (isNaN(delegates)) warnings.push(`Row ${rowNum}: "Delegates Confirmed" is not a number — defaulting to 0.`);
          if (isNaN(exhibitors)) warnings.push(`Row ${rowNum}: "Exhibitors Confirmed" is not a number — defaulting to 0.`);
          if (isNaN(sponsorship)) warnings.push(`Row ${rowNum}: "Sponsorship Secured ($)" is not a number — defaulting to 0.`);

          weeklyData.push({
            week: weekNum,
            date: String(rawDate).trim(),
            buyersOutreach: isNaN(buyersOutreach) ? 0 : Math.round(buyersOutreach),
            delegatesOutreach: isNaN(delegatesOutreach) ? 0 : Math.round(delegatesOutreach),
            exhibitorsOutreach: isNaN(exhibitorsOutreach) ? 0 : Math.round(exhibitorsOutreach),
            sponsorshipOutreach: isNaN(sponsorshipOutreach) ? 0 : Math.round(sponsorshipOutreach),
            buyersReached: isNaN(buyers) ? 0 : Math.round(buyers),
            delegatesConfirmed: isNaN(delegates) ? 0 : Math.round(delegates),
            exhibitorsConfirmed: isNaN(exhibitors) ? 0 : Math.round(exhibitors),
            sponsorshipSecured: isNaN(sponsorship) ? 0 : Math.round(sponsorship),
            notes: String(rawNotes).trim(),
          });
        });

        weeklyData.sort((a, b) => a.week - b.week);

        if (weeklyData.length === 0) {
          reject(new Error('No valid data rows found in "Weekly Progress" sheet.'));
          return;
        }

        // ── Parse KPI Summary sheet (optional) ────────────────────────────────
        let kpiTargets: KpiTargets | undefined;

        const kpiSheetName = wb.SheetNames.find(
          (n) => n.trim().toLowerCase() === "kpi summary"
        );

        if (kpiSheetName) {
          const kpiWs = wb.Sheets[kpiSheetName];
          const kpiRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(kpiWs, { defval: "" });
          const parsed: Partial<KpiTargets> = {};

          kpiRows.forEach((row) => {
            const metric = String(row["Metric"] ?? row["metric"] ?? "").toLowerCase().trim();
            const targetVal = parseFloat(String(row["Target"] ?? row["target"] ?? ""));
            if (isNaN(targetVal)) return;
            if (metric.includes("buyer")) parsed.buyers = Math.round(targetVal);
            else if (metric.includes("delegate")) parsed.delegates = Math.round(targetVal);
            else if (metric.includes("exhibitor")) parsed.exhibitors = Math.round(targetVal);
            else if (metric.includes("sponsor")) parsed.sponsorship = Math.round(targetVal);
          });

          if (
            parsed.buyers !== undefined &&
            parsed.delegates !== undefined &&
            parsed.exhibitors !== undefined &&
            parsed.sponsorship !== undefined
          ) {
            kpiTargets = parsed as KpiTargets;
          } else {
            warnings.push('KPI Summary sheet found but could not parse all 4 targets. Using existing KPI targets.');
          }
        }

        // ── Parse Delegates sheet (optional) ──────────────────────────────────
        let delegateCategories: DelegateCategory[] | undefined;

        const delSheetName = wb.SheetNames.find(
          (n) => n.trim().toLowerCase() === "delegates"
        );

        if (delSheetName) {
          const delWs = wb.Sheets[delSheetName];
          const delRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(delWs, { defval: "" });

          const parsedDelegates: DelegateCategory[] = DELEGATE_CATEGORIES.map((d) => ({ ...d }));

          delRows.forEach((row) => {
            const name = String(row["Delegate Category"] ?? row["delegate category"] ?? "").trim();
            const outreach = parseFloat(String(row["Outreach"] ?? row["outreach"] ?? "0"));
            const confirmed = parseFloat(String(row["Confirmed"] ?? row["confirmed"] ?? "0"));
            const target = parseFloat(String(row["Target"] ?? row["target"] ?? ""));

            const match = parsedDelegates.find(
              (d) => d.name.toLowerCase() === name.toLowerCase()
            );
            if (match) {
              if (!isNaN(outreach)) match.outreach = Math.round(outreach);
              if (!isNaN(confirmed)) match.confirmed = Math.round(confirmed);
              if (!isNaN(target)) match.target = Math.round(target);
            }
          });

          if (parsedDelegates.some((d) => d.outreach > 0 || d.confirmed > 0)) {
            delegateCategories = parsedDelegates;
          }
        }

        // ── Parse Exhibitors sheet (optional) ─────────────────────────────────
        let exhibitorCategories: ExhibitorCategory[] | undefined;

        const exhSheetName = wb.SheetNames.find(
          (n) => n.trim().toLowerCase() === "exhibitors"
        );

        if (exhSheetName) {
          const exhWs = wb.Sheets[exhSheetName];
          const exhRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(exhWs, { defval: "" });

          const parsedExhibitors: ExhibitorCategory[] = EXHIBITOR_CATEGORIES.map((e) => ({ ...e }));

          exhRows.forEach((row) => {
            const name = String(row["Exhibitor Category"] ?? row["exhibitor category"] ?? "").trim();
            const outreach = parseFloat(String(row["Outreach"] ?? row["outreach"] ?? "0"));
            const confirmed = parseFloat(String(row["Confirmed"] ?? row["confirmed"] ?? "0"));
            const target = parseFloat(String(row["Target"] ?? row["target"] ?? ""));

            const match = parsedExhibitors.find(
              (e) => e.name.toLowerCase() === name.toLowerCase()
            );
            if (match) {
              if (!isNaN(outreach)) match.outreach = Math.round(outreach);
              if (!isNaN(confirmed)) match.confirmed = Math.round(confirmed);
              if (!isNaN(target)) match.target = Math.round(target);
            }
          });

          if (parsedExhibitors.some((e) => e.outreach > 0 || e.confirmed > 0)) {
            exhibitorCategories = parsedExhibitors;
          }
        }

        // ── Parse Sponsorship sheet (optional) ────────────────────────────────
        let sponsorshipLevels: SponsorshipLevel[] | undefined;

        const sponSheetName = wb.SheetNames.find(
          (n) => n.trim().toLowerCase() === "sponsorship"
        );

        if (sponSheetName) {
          const sponWs = wb.Sheets[sponSheetName];
          const sponRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sponWs, { defval: "" });

          const parsedSponsorship: SponsorshipLevel[] = SPONSORSHIP_LEVELS.map((s) => ({ ...s }));

          sponRows.forEach((row) => {
            const level = String(row["Level"] ?? row["level"] ?? "").trim();
            const outreach = parseFloat(String(row["Outreach ($)"] ?? row["Outreach"] ?? row["outreach ($)"] ?? row["outreach"] ?? "0"));
            const confirmed = parseFloat(String(row["Confirmed ($)"] ?? row["Confirmed"] ?? row["confirmed ($)"] ?? row["confirmed"] ?? "0"));

            const match = parsedSponsorship.find(
              (s) => s.level.toLowerCase() === level.toLowerCase()
            );
            if (match) {
              if (!isNaN(outreach)) match.outreach = Math.round(outreach);
              if (!isNaN(confirmed)) match.confirmed = Math.round(confirmed);
            }
          });

          if (parsedSponsorship.some((s) => s.outreach > 0 || s.confirmed > 0)) {
            sponsorshipLevels = parsedSponsorship;
          }
        }

        // ── Parse Regional Buyers sheet (optional) ────────────────────────────
        let regionalData: RegionBuyerData[] | undefined;

        const regSheetName = wb.SheetNames.find(
          (n) => n.trim().toLowerCase() === "regional buyers"
        );

        if (regSheetName) {
          const regWs = wb.Sheets[regSheetName];
          const regRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(regWs, { defval: "" });

          const parsedRegional: RegionBuyerData[] = REGIONAL_BUYER_DATA.map((r) => ({ ...r }));

          regRows.forEach((row) => {
            const region = String(row["Region"] ?? row["region"] ?? "").trim();
            const outreach = parseFloat(String(row["Outreach"] ?? row["outreach"] ?? "0"));
            const confirmed = parseFloat(String(row["Confirmed"] ?? row["confirmed"] ?? "0"));

            const match = parsedRegional.find(
              (r) => r.region.toLowerCase() === region.toLowerCase()
            );
            if (match) {
              if (!isNaN(outreach)) match.outreach = Math.round(outreach);
              if (!isNaN(confirmed)) match.confirmed = Math.round(confirmed);
            }
          });

          if (parsedRegional.some((r) => r.outreach > 0 || r.confirmed > 0)) {
            regionalData = parsedRegional;
          }
        }

        resolve({ weeklyData, kpiTargets, delegateCategories, exhibitorCategories, sponsorshipLevels, regionalData, warnings });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads a template Excel file with all sheets and correct column headers
 * including Outreach and Confirmed columns.
 */
export function downloadImportTemplate(): void {
  const wb = XLSX.utils.book_new();

  // ── 1. Weekly Progress sheet (required) ──────────────────────────────────────
  const weeklyRows = [
    [
      "Week",
      "Date Range",
      "Buyers Outreach",
      "Buyers Reached",
      "Delegates Outreach",
      "Delegates Confirmed",
      "Exhibitors Outreach",
      "Exhibitors Confirmed",
      "Sponsorship Outreach ($)",
      "Sponsorship Secured ($)",
      "Notes",
    ],
    ["Week 1", "Mar 16–20", 200, 15, 630, 0, 155, 0, 180000, 0, "Week 1 kickoff outreach"],
    ["Week 2", "Mar 23–27", "", "", "", "", "", "", "", "", ""],
    ["Week 3", "Mar 30–Apr 3", "", "", "", "", "", "", "", "", ""],
    ...Array.from({ length: 8 }, (_, i) => [`Week ${i + 4}`, "", "", "", "", "", "", "", "", "", ""]),
  ];

  const wsWeekly = XLSX.utils.aoa_to_sheet(weeklyRows);
  wsWeekly["!cols"] = [
    { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 16 },
    { wch: 20 }, { wch: 22 }, { wch: 20 }, { wch: 22 },
    { wch: 24 }, { wch: 24 }, { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsWeekly, "Weekly Progress");

  // ── 2. KPI Summary sheet (optional) ──────────────────────────────────────────
  const kpiRows = [
    ["Metric", "Target"],
    ["Buyers", 100],
    ["Delegates", 1000],
    ["Exhibitors", 152],
    ["Sponsorship", 360000],
  ];
  const wsKpi = XLSX.utils.aoa_to_sheet(kpiRows);
  wsKpi["!cols"] = [{ wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsKpi, "KPI Summary");

  // ── 3. Regional Buyers sheet (optional) ──────────────────────────────────────
  // Now includes Outreach and Confirmed columns
  const regRows = [
    ["Region", "Coffee Buyers", "Tea Buyers", "Total", "% Share", "Fully Hosted", "Partially Hosted", "Event Access", "Outreach", "Confirmed"],
    ["Europe",        20, 12, 32, "32%", 3,  18, 6, 0, 0],
    ["Middle East",   10,  8, 18, "18%", 11,  6, 2, 0, 0],
    ["North America", 12,  6, 18, "18%",  3, 10, 3, 0, 0],
    ["Asia",           8,  8, 16, "16%",  9,  4, 3, 0, 0],
    ["Intra-Africa",  10,  6, 16, "16%", 12,  2, 6, 0, 0],
  ];
  const wsRegional = XLSX.utils.aoa_to_sheet(regRows);
  wsRegional["!cols"] = [
    { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRegional, "Regional Buyers");

  // ── 4. Delegates sheet (optional) ─────────────────────────────────────────────
  // Now includes Outreach and Confirmed columns
  const delRows: (string | number)[][] = [
    ["Delegate Category", "Target", "Outreach", "Confirmed"],
    ["Cooperative & Producer Unions", 200, 0, 0],
    ["Sustainable & Climate-Smart Growers", 120, 0, 0],
    ["Agripreneurs", 100, 0, 0],
    ["Youth in Coffee and Tea", 100, 0, 0],
    ["Financial and Logistics Sector", 100, 0, 0],
    ["Innovative Coffee & Tea Products", 80, 0, 0],
    ["Distributors", 70, 0, 0],
    ["Women in Coffee & Tea", 50, 0, 0],
    ["Academia & Research Institutions", 50, 0, 0],
    ["Embassies and Diplomats", 50, 0, 0],
    ["Tea and Coffee Enthusiasts", 50, 0, 0],
    ["Inclusive Enterprises & PWDs", 30, 0, 0],
  ];
  const wsDelegates = XLSX.utils.aoa_to_sheet(delRows);
  wsDelegates["!cols"] = [{ wch: 42 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsDelegates, "Delegates");

  // ── 5. Exhibitors sheet (optional) ────────────────────────────────────────────
  // Now includes Outreach and Confirmed columns
  const exhRows: (string | number)[][] = [
    ["Exhibitor Category", "Target", "Outreach", "Confirmed"],
    ["Coffee Exporters & Producers", 40, 0, 0],
    ["Tea Exporters", 25, 0, 0],
    ["Packaging & Value Addition Companies", 15, 0, 0],
    ["Retailers and Coffee Chains", 10, 0, 0],
    ["Finance Institutions", 10, 0, 0],
    ["Trade & Export Promotion Bodies", 10, 0, 0],
    ["Logistics & Freight Companies", 5, 0, 0],
    ["Coffee & Tea Technology Companies", 5, 0, 0],
    ["Sustainability & Certification Bodies", 5, 0, 0],
    ["Brokers and Distributors", 5, 0, 0],
    ["Warehouses", 5, 0, 0],
    ["Equipment and Machineries", 5, 0, 0],
    ["Government Regulator", 5, 0, 0],
    ["Private Labels", 5, 0, 0],
    ["Disaster Impact on Coffee & Tea", 2, 0, 0],
  ];
  const wsExhibitors = XLSX.utils.aoa_to_sheet(exhRows);
  wsExhibitors["!cols"] = [{ wch: 45 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsExhibitors, "Exhibitors");

  // ── 6. Sponsorship sheet (optional) ───────────────────────────────────────────
  // Now includes Outreach ($) and Confirmed ($) columns
  const sponRows: (string | number)[][] = [
    ["Level", "Unit Price ($)", "Qty", "Total Revenue ($)", "Outreach ($)", "Confirmed ($)"],
    ["Platinum", 50000, 1,  50000, 0, 0],
    ["Diamond",  35000, 2,  70000, 0, 0],
    ["Gold",     25000, 4, 100000, 0, 0],
    ["Silver",   15000, 6,  90000, 0, 0],
    ["Bronze",    5000, 10, 50000, 0, 0],
  ];
  const wsSponsorship = XLSX.utils.aoa_to_sheet(sponRows);
  wsSponsorship["!cols"] = [{ wch: 14 }, { wch: 16 }, { wch: 8 }, { wch: 20 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSponsorship, "Sponsorship");

  XLSX.writeFile(wb, "Africa_Coffee_Tea_Expo_2026_Import_Template.xlsx");
}
