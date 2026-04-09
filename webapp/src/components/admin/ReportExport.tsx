import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Download,
  CheckCircle,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";

export function ReportExport() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    setDownloaded(false);
    try {
      const response = await adminApi.raw("/api/admin/reports/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = response.headers.get("content-disposition");
      const filenameMatch = disposition?.match(/filename="([^"]+)"/);
      a.download =
        filenameMatch?.[1] ?? `expo-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const sheets = [
    {
      icon: TrendingUp,
      title: "KPI Targets",
      desc: "Buyers, delegates, exhibitors, and sponsorship goals",
    },
    {
      icon: BarChart3,
      title: "Weekly Progress",
      desc: "11-week outreach timeline with metrics",
    },
    {
      icon: Users,
      title: "Regional Breakdown",
      desc: "Coffee and tea buyers by region",
    },
    {
      icon: Users,
      title: "Delegate Categories",
      desc: "Outreach and conversion by delegate type",
    },
    {
      icon: Users,
      title: "Exhibitor Categories",
      desc: "Outreach and confirmation by exhibitor type",
    },
    {
      icon: TrendingUp,
      title: "Sponsorship",
      desc: "Revenue by sponsorship tier and confirmed slots",
    },
    {
      icon: CheckCircle,
      title: "Task Summary",
      desc: "All tasks with status, priority, and assignees",
    },
    {
      icon: Calendar,
      title: "Programme Tracker",
      desc: "Programme items with status and completion",
    },
    {
      icon: Calendar,
      title: "Operations Tracker",
      desc: "Operational items with status and completion",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="w-5 h-5" style={{ color: "#8DB53C" }} />
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#4A3728" }}>
            Senior Management Report
          </h2>
          <p className="text-sm text-gray-500">
            Comprehensive Excel export with all dashboard data
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border p-6 bg-white mb-6"
        style={{ borderColor: "#E8E0D8" }}
      >
        <h3 className="font-semibold mb-4" style={{ color: "#4A3728" }}>
          Report Contents (9 Sheets)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sheets.map((sheet, idx) => {
            const Icon = sheet.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: "#FAF7F2" }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "#8DB53C20" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#8DB53C" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#4A3728" }}>
                    {sheet.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{sheet.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleExport}
          disabled={downloading}
          className="text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          style={{ background: downloading ? "#7B6B58" : "#4A3728" }}
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
              Generating Report...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle className="w-5 h-5 mr-3" />
              Downloaded Successfully!
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-3" />
              Download Excel Report
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Report generated from live data &bull;{" "}
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
