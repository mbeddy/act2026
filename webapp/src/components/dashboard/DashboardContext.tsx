import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  MOCK_WEEKLY_DATA,
  KPI_TARGETS,
  DELEGATE_CATEGORIES,
  EXHIBITOR_CATEGORIES,
  SPONSORSHIP_LEVELS,
  REGIONAL_BUYER_DATA,
} from "./data";
import type {
  WeeklyData,
  DelegateCategory,
  ExhibitorCategory,
  SponsorshipLevel,
  RegionBuyerData,
} from "./data";
import type { TrackerSection } from "./trackerTypes";
import { DEFAULT_PROGRAM_SECTIONS, DEFAULT_OPERATIONS_SECTIONS } from "./trackerData";

export interface KpiTargets {
  buyers: number;
  delegates: number;
  exhibitors: number;
  sponsorship: number;
}

export interface DashboardContextValue {
  weeklyData: WeeklyData[];
  kpiTargets: KpiTargets;
  delegateCategories: DelegateCategory[];
  exhibitorCategories: ExhibitorCategory[];
  sponsorshipLevels: SponsorshipLevel[];
  regionalData: RegionBuyerData[];
  programSections: TrackerSection[];
  operationsSections: TrackerSection[];
  isSyncing: boolean;
  lastSynced: string | null;
  isReadOnly: boolean;
  setWeeklyData: (data: WeeklyData[]) => void;
  setKpiTargets: (targets: KpiTargets) => void;
  setDelegateCategories: (data: DelegateCategory[]) => void;
  setExhibitorCategories: (data: ExhibitorCategory[]) => void;
  setSponsorshipLevels: (data: SponsorshipLevel[]) => void;
  setRegionalData: (data: RegionBuyerData[]) => void;
  setProgramSections: (data: TrackerSection[]) => void;
  setOperationsSections: (data: TrackerSection[]) => void;
  saveToServer: () => Promise<void>;
}

interface DashboardState {
  weeklyData: WeeklyData[];
  kpiTargets: KpiTargets;
  delegateCategories: DelegateCategory[];
  exhibitorCategories: ExhibitorCategory[];
  sponsorshipLevels: SponsorshipLevel[];
  regionalData: RegionBuyerData[];
  programSections: TrackerSection[];
  operationsSections: TrackerSection[];
  lastUpdated: string;
  lastUpdatedBy: string;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
const LOCAL_BACKUP_KEY = "act2026-dashboard-local-backup";

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>(MOCK_WEEKLY_DATA);
  const [kpiTargets, setKpiTargets] = useState<KpiTargets>(KPI_TARGETS);
  const [delegateCategories, setDelegateCategories] = useState<DelegateCategory[]>(DELEGATE_CATEGORIES);
  const [exhibitorCategories, setExhibitorCategories] = useState<ExhibitorCategory[]>(EXHIBITOR_CATEGORIES);
  const [sponsorshipLevels, setSponsorshipLevels] = useState<SponsorshipLevel[]>(SPONSORSHIP_LEVELS);
  const [regionalData, setRegionalData] = useState<RegionBuyerData[]>(REGIONAL_BUYER_DATA);
  const [programSections, setProgramSections] = useState<TrackerSection[]>(DEFAULT_PROGRAM_SECTIONS);
  const [operationsSections, setOperationsSections] = useState<TrackerSection[]>(DEFAULT_OPERATIONS_SECTIONS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isReadOnly] = useState<boolean>(
    new URLSearchParams(window.location.search).get('readonly') === 'true'
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHydratedRef = useRef<boolean>(false);

  const currentStateRef = useRef<DashboardState>({
    weeklyData,
    kpiTargets,
    delegateCategories,
    exhibitorCategories,
    sponsorshipLevels,
    regionalData,
    programSections,
    operationsSections,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: 'dashboard',
  });

  useEffect(() => {
    currentStateRef.current = {
      weeklyData,
      kpiTargets,
      delegateCategories,
      exhibitorCategories,
      sponsorshipLevels,
      regionalData,
      programSections,
      operationsSections,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'dashboard',
    };
  }, [weeklyData, kpiTargets, delegateCategories, exhibitorCategories, sponsorshipLevels, regionalData, programSections, operationsSections]);

  const saveToServer = useCallback(async (): Promise<void> => {
    setIsSyncing(true);
    try {
      await fetch(`${BASE_URL}/api/dashboard/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: currentStateRef.current }),
      });
      setLastSynced(new Date().toISOString());
    } catch {
      // Silent failure — local backup still protects data.
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const loadFromLocalBackup = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (raw === null) return false;
      const parsed = JSON.parse(raw) as DashboardState;
      if (parsed.weeklyData) setWeeklyData(parsed.weeklyData);
      if (parsed.kpiTargets) setKpiTargets(parsed.kpiTargets);
      if (parsed.delegateCategories) setDelegateCategories(parsed.delegateCategories);
      if (parsed.exhibitorCategories) setExhibitorCategories(parsed.exhibitorCategories);
      if (parsed.sponsorshipLevels) setSponsorshipLevels(parsed.sponsorshipLevels);
      if (parsed.regionalData) setRegionalData(parsed.regionalData);
      if (parsed.programSections) setProgramSections(parsed.programSections);
      if (parsed.operationsSections) setOperationsSections(parsed.operationsSections);
      setLastSynced(parsed.lastUpdated ?? new Date().toISOString());
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadFromServer = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/api/dashboard/state`);
      if (!res.ok) {
        void loadFromLocalBackup();
        return;
      }
      const json = await res.json() as { data: DashboardState | null };
      const serverState = json.data;
      if (serverState !== null && serverState !== undefined) {
        if (serverState.weeklyData) setWeeklyData(serverState.weeklyData);
        if (serverState.kpiTargets) setKpiTargets(serverState.kpiTargets);
        if (serverState.delegateCategories) setDelegateCategories(serverState.delegateCategories);
        if (serverState.exhibitorCategories) setExhibitorCategories(serverState.exhibitorCategories);
        if (serverState.sponsorshipLevels) setSponsorshipLevels(serverState.sponsorshipLevels);
        if (serverState.regionalData) setRegionalData(serverState.regionalData);
        if (serverState.programSections) setProgramSections(serverState.programSections);
        if (serverState.operationsSections) setOperationsSections(serverState.operationsSections);
        setLastSynced(new Date().toISOString());
      } else {
        void loadFromLocalBackup();
      }
    } catch {
      void loadFromLocalBackup();
    } finally {
      hasHydratedRef.current = true;
    }
  }, [loadFromLocalBackup]);

  // Load from server on mount
  useEffect(() => {
    void loadFromServer();
  }, [loadFromServer]);

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void loadFromServer();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadFromServer]);

  // Local backup for fast recovery from browser or network issues.
  useEffect(() => {
    const snapshot: DashboardState = {
      weeklyData,
      kpiTargets,
      delegateCategories,
      exhibitorCategories,
      sponsorshipLevels,
      regionalData,
      programSections,
      operationsSections,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: "dashboard-local-backup",
    };
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(snapshot));
  }, [weeklyData, kpiTargets, delegateCategories, exhibitorCategories, sponsorshipLevels, regionalData, programSections, operationsSections]);

  // Auto-save with 2-second debounce when any dashboard data changes.
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void saveToServer();
    }, 2000);
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [weeklyData, kpiTargets, delegateCategories, exhibitorCategories, sponsorshipLevels, regionalData, programSections, operationsSections, saveToServer]);

  return (
    <DashboardContext.Provider
      value={{
        weeklyData,
        kpiTargets,
        delegateCategories,
        exhibitorCategories,
        sponsorshipLevels,
        regionalData,
        programSections,
        operationsSections,
        isSyncing,
        lastSynced,
        isReadOnly,
        setWeeklyData,
        setKpiTargets,
        setDelegateCategories,
        setExhibitorCategories,
        setSponsorshipLevels,
        setRegionalData,
        setProgramSections,
        setOperationsSections,
        saveToServer,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
