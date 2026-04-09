import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2, X, Coffee } from "lucide-react";
import { parseImportExcel, downloadImportTemplate } from "./importFromExcel";
import type { ParsedImportResult } from "./importFromExcel";
import { COLORS } from "./data";
import type { WeeklyData, DelegateCategory, ExhibitorCategory, SponsorshipLevel, RegionBuyerData } from "./data";
import type { KpiTargets } from "./DashboardContext";

interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (
    weeklyData: WeeklyData[],
    kpiTargets?: KpiTargets,
    delegateCategories?: DelegateCategory[],
    exhibitorCategories?: ExhibitorCategory[],
    sponsorshipLevels?: SponsorshipLevel[],
    regionalData?: RegionBuyerData[],
  ) => void;
}

type UploadState = "idle" | "dragging" | "parsing" | "preview" | "error";

export function ImportExcelModal({ open, onClose, onApply }: ImportExcelModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [parsed, setParsed] = useState<ParsedImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setUploadState("idle");
    setParsed(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setErrorMsg("Only .xlsx files are accepted. Please use the template provided.");
      setUploadState("error");
      return;
    }

    setUploadState("parsing");
    setErrorMsg("");

    try {
      const result = await parseImportExcel(file);
      setParsed(result);
      setUploadState("preview");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse the file.");
      setUploadState("error");
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState("idle");
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    setUploadState("idle");
  }, []);

  const handleApply = useCallback(() => {
    if (!parsed) return;
    onApply(
      parsed.weeklyData,
      parsed.kpiTargets,
      parsed.delegateCategories,
      parsed.exhibitorCategories,
      parsed.sponsorshipLevels,
      parsed.regionalData,
    );
    handleClose();
  }, [parsed, onApply, handleClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-0 p-0"
        style={{ background: "linear-gradient(160deg, #FDF6EE 0%, #F7EBD8 100%)" }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 rounded-t-lg"
          style={{ background: "linear-gradient(135deg, #3A1A08 0%, #6F4E37 100%)" }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: COLORS.gold + "25" }}>
                <Coffee className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <DialogTitle className="text-white text-base font-bold">
                  Upload Dashboard Data
                </DialogTitle>
                <DialogDescription className="text-amber-200/70 text-xs mt-0.5">
                  Import weekly progress data from an Excel file
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Template download row */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border"
            style={{ background: COLORS.gold + "0D", borderColor: COLORS.gold + "35" }}
          >
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: COLORS.gold }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                  Download Import Template
                </p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>
                  6-sheet template — fill in "Weekly Progress" (required) and optionally update
                  KPI Summary, Regional Buyers (with Outreach/Confirmed), Delegates (with Outreach/Confirmed),
                  Exhibitors (with Outreach/Confirmed), and Sponsorship (with Outreach/Confirmed) sheets.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="text-xs h-8 flex-shrink-0 whitespace-nowrap"
              style={{ background: COLORS.gold, color: COLORS.coffeeDark }}
              onClick={downloadImportTemplate}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Template
            </Button>
          </div>

          {/* Expected format info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: COLORS.warmGray }}>
              Expected Columns — Weekly Progress Sheet
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                "Week",
                "Date Range",
                "Buyers Reached",
                "Delegates Confirmed",
                "Exhibitors Confirmed",
                "Sponsorship Secured ($)",
                "Notes",
              ].map((col) => (
                <div
                  key={col}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style={{ background: COLORS.coffeeBrown + "12", color: COLORS.coffeeDark }}
                >
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Upload area */}
          {uploadState !== "preview" ? (
            <div>
              <div
                className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
                style={{
                  borderColor: uploadState === "dragging"
                    ? COLORS.gold
                    : uploadState === "error"
                    ? "#ef4444"
                    : COLORS.coffeeBrown + "40",
                  background: uploadState === "dragging"
                    ? COLORS.gold + "0A"
                    : uploadState === "error"
                    ? "#ef444408"
                    : "rgba(255,255,255,0.5)",
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadState === "parsing" ? (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: COLORS.gold, borderTopColor: "transparent" }}
                    />
                    <p className="text-sm font-medium" style={{ color: COLORS.coffeeDark }}>
                      Parsing your file...
                    </p>
                  </div>
                ) : uploadState === "error" ? (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "#ef444415" }}
                    >
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-600 mb-1">Upload Failed</p>
                      <p className="text-xs text-red-500 max-w-xs mx-auto">{errorMsg}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs mt-1"
                      onClick={(e) => { e.stopPropagation(); resetState(); }}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform"
                      style={{
                        background: uploadState === "dragging" ? COLORS.gold + "20" : COLORS.coffeeBrown + "12",
                        transform: uploadState === "dragging" ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <Upload
                        className="w-6 h-6"
                        style={{ color: uploadState === "dragging" ? COLORS.gold : COLORS.coffeeBrown }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: COLORS.coffeeDark }}>
                        {uploadState === "dragging" ? "Drop your file here" : "Drag & drop your .xlsx file"}
                      </p>
                      <p className="text-xs mt-1" style={{ color: COLORS.warmGray }}>
                        or <span style={{ color: COLORS.gold }} className="font-semibold">click to browse</span> — .xlsx files only
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Preview */}
          {uploadState === "preview" && parsed !== null ? (
            <div className="space-y-4">
              {/* Success badge */}
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: "#4CAF5012", border: "1px solid #4CAF5030" }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
                <p className="text-sm font-semibold text-green-700">
                  Parsed {parsed.weeklyData.length} week{parsed.weeklyData.length !== 1 ? "s" : ""} of data
                  {parsed.kpiTargets !== undefined ? " + KPI targets" : ""}
                  {parsed.delegateCategories !== undefined ? " + Delegate data" : ""}
                  {parsed.exhibitorCategories !== undefined ? " + Exhibitor data" : ""}
                  {parsed.sponsorshipLevels !== undefined ? " + Sponsorship data" : ""}
                  {parsed.regionalData !== undefined ? " + Regional data" : ""}
                </p>
                <button
                  className="ml-auto"
                  onClick={resetState}
                  aria-label="Clear and upload again"
                >
                  <X className="w-4 h-4" style={{ color: COLORS.warmGray }} />
                </button>
              </div>

              {/* Warnings */}
              {parsed.warnings.length > 0 ? (
                <div
                  className="p-3 rounded-xl space-y-1"
                  style={{ background: "#FF980010", border: "1px solid #FF980030" }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700">
                      {parsed.warnings.length} warning{parsed.warnings.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {parsed.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700 pl-6">{w}</p>
                  ))}
                </div>
              ) : null}

              {/* KPI targets preview */}
              {parsed.kpiTargets !== undefined ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: COLORS.warmGray }}>
                    New KPI Targets
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Buyers", value: parsed.kpiTargets.buyers.toLocaleString() },
                      { label: "Delegates", value: parsed.kpiTargets.delegates.toLocaleString() },
                      { label: "Exhibitors", value: parsed.kpiTargets.exhibitors.toLocaleString() },
                      { label: "Sponsorship", value: "$" + (parsed.kpiTargets.sponsorship / 1000).toFixed(0) + "K" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl p-3 text-center"
                        style={{ background: COLORS.gold + "12", border: `1px solid ${COLORS.gold}30` }}
                      >
                        <p className="text-xs" style={{ color: COLORS.warmGray }}>{item.label}</p>
                        <p className="text-base font-bold mt-0.5" style={{ color: COLORS.coffeeDark }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Weekly data preview table */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: COLORS.warmGray }}>
                  Weekly Data Preview
                </p>
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: COLORS.coffeeBrown + "20" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: COLORS.coffeeBrown + "12" }}>
                          {["Wk", "Date", "Buyers", "Delegates", "Exhibitors", "Sponsorship", "Notes"].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                              style={{ color: COLORS.coffeeDark }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.weeklyData.map((row, i) => (
                          <tr
                            key={row.week}
                            style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.6)" : "transparent" }}
                          >
                            <td className="px-3 py-2 font-semibold" style={{ color: COLORS.coffeeDark }}>{row.week}</td>
                            <td className="px-3 py-2 whitespace-nowrap" style={{ color: COLORS.warmGray }}>{row.date}</td>
                            <td className="px-3 py-2 font-medium" style={{ color: COLORS.coffeeDark }}>{row.buyersReached}</td>
                            <td className="px-3 py-2 font-medium" style={{ color: COLORS.coffeeDark }}>{row.delegatesConfirmed.toLocaleString()}</td>
                            <td className="px-3 py-2 font-medium" style={{ color: COLORS.coffeeDark }}>{row.exhibitorsConfirmed}</td>
                            <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ color: COLORS.coffeeDark }}>
                              ${(row.sponsorshipSecured / 1000).toFixed(0)}K
                            </td>
                            <td
                              className="px-3 py-2 max-w-[140px] truncate"
                              style={{ color: COLORS.warmGray }}
                              title={row.notes}
                            >
                              {row.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t" style={{ borderColor: COLORS.coffeeBrown + "20" }}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleClose}
            >
              Cancel
            </Button>
            {uploadState === "preview" && parsed !== null ? (
              <Button
                size="sm"
                className="text-xs"
                style={{ background: COLORS.coffeeBrown, color: "white" }}
                onClick={handleApply}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Apply Data to Dashboard
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
