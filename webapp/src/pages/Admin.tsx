import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isAdminAuthenticated, clearAdminToken } from "@/lib/adminApi";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { DashboardHistory } from "@/components/admin/DashboardHistory";
import { TaskManagement } from "@/components/admin/TaskManagement";
import { ReportExport } from "@/components/admin/ReportExport";
import { DashboardEditor } from "@/components/admin/DashboardEditor";
import { DataImportExport } from "@/components/admin/DataImportExport";
import { Button } from "@/components/ui/button";
import {
  History,
  CheckSquare,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Coffee,
  ShieldCheck,
  Menu,
  DatabaseZap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "data" | "tasks" | "history" | "reports";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
  }, []);

  const handleLogin = () => setAuthenticated(true);

  const handleLogout = () => {
    clearAdminToken();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "data", label: "Data", icon: DatabaseZap },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
  ];

  const tabTitle =
    activeTab === "dashboard" ? "Dashboard Editor" :
    activeTab === "data" ? "Data Import & Export" :
    activeTab === "tasks" ? "Task Management" :
    activeTab === "history" ? "Dashboard History" :
    "Report Export";

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 border-b" style={{ borderColor: "#5A4738" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "#8DB53C" }}
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Admin Panel</p>
            <p className="text-xs" style={{ color: "#C8A42A" }}>
              Expo 2026
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
              style={activeTab === tab.id ? { background: "#8DB53C" } : {}}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: "#5A4738" }}>
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white text-sm h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-400 hover:text-red-400 text-sm h-9"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#FAF7F2" }}>
      {/* Desktop Sidebar */}
      <div
        className="hidden md:flex w-64 flex-shrink-0 flex-col"
        style={{ background: "#4A3728" }}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{ background: "#4A3728" }}
          >
            <SidebarContent />
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <div
          className="border-b bg-white px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20"
          style={{ borderColor: "#E8E0D8" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold" style={{ color: "#4A3728" }}>
                {tabTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Africa Coffee &amp; Tea Expo 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Coffee className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Authorized Admin Access</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-8">
          {activeTab === "dashboard" ? <DashboardEditor /> : null}
          {activeTab === "data" ? <DataImportExport /> : null}
          {activeTab === "tasks" ? <TaskManagement /> : null}
          {activeTab === "history" ? <DashboardHistory /> : null}
          {activeTab === "reports" ? <ReportExport /> : null}
        </div>
      </div>
    </div>
  );
}
