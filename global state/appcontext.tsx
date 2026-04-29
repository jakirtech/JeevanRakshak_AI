import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DISTRICTS, DISTRICT_BY_ID, DistrictProfile } from "@/constants/districts";
import { SymptomId } from "@/constants/diseases";
import { Language, translate } from "@/constants/translations";
import { generateSeedReports } from "@/lib/risk";

const STORAGE_KEYS = {
  user: "jr.user.v1",
  language: "jr.language.v1",
  reports: "jr.reports.v1",
  alerts: "jr.alerts.v1",
  districtId: "jr.districtId.v1",
  themeMode: "jr.themeMode.v1",
  waterReports: "jr.waterReports.v1",
};

export type User = {
  id: string;
  name: string;
  phone: string;
  districtId: string;
  language: Language;
  createdAt: number;
};

export type Severity = "mild" | "moderate" | "severe";

export type Report = {
  id: string;
  userId: string;
  userName: string;
  districtId: string;
  symptoms: SymptomId[];
  severity: Severity;
  timestamp: number;
  seed: boolean;
};

export type AlertSeverity = "low" | "medium" | "high";

export type Alert = {
  id: string;
  districtId: string | "all";
  message: string;
  disease?: string;
  severity: AlertSeverity;
  createdAt: number;
};

export type WaterReport = {
  id: string;
  userId: string;
  districtId: string;
  note: string;
  timestamp: number;
};

export type ThemeMode = "system" | "light" | "dark";

type AppContextValue = {
  ready: boolean;
  user: User | null;
  language: Language;
  districtId: string;
  district: DistrictProfile;
  reports: Report[];
  userReports: Report[];
  liveReports: Report[];
  alerts: Alert[];
  waterReports: WaterReport[];
  online: boolean;
  themeMode: ThemeMode;
  liveSimulation: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  signIn: (input: {
    name: string;
    phone: string;
    districtId: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setDistrictId: (id: string) => Promise<void>;
  setThemeMode: (m: ThemeMode) => Promise<void>;
  setLiveSimulation: (on: boolean) => void;
  submitReport: (input: {
    symptoms: SymptomId[];
    severity: Severity;
    districtId?: string;
  }) => Promise<Report>;
  reportUnsafeWater: (input: {
    districtId: string;
    note: string;
  }) => Promise<WaterReport>;
  sendAlert: (input: {
    districtId: string | "all";
    message: string;
    severity: AlertSeverity;
    disease?: string;
  }) => Promise<Alert>;
  loadSampleData: () => Promise<void>;
  resetUserData: () => Promise<void>;
  toggleOffline: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_DISTRICT_ID = "kamrup_metro";

function defaultSeedAlerts(now: number): Alert[] {
  return [
    {
      id: `seed-alert-1`,
      districtId: "majuli",
      message:
        "High cholera risk in Majuli. Boil drinking water and report any diarrhea cases at the relief camp.",
      disease: "cholera",
      severity: "high",
      createdAt: now - 2 * 3600_000,
    },
    {
      id: `seed-alert-2`,
      districtId: "dhubri",
      message:
        "Outbreak of diarrhea suspected in Dhubri. ORS distribution active at all PHCs.",
      disease: "diarrhea",
      severity: "high",
      createdAt: now - 5 * 3600_000,
    },
    {
      id: `seed-alert-3`,
      districtId: "cachar",
      message:
        "Leptospirosis risk in Cachar after Barak overflow. Avoid wading in flood water without protection.",
      disease: "leptospirosis",
      severity: "medium",
      createdAt: now - 9 * 3600_000,
    },
    {
      id: `seed-alert-4`,
      districtId: "lakhimpur",
      message:
        "JE vaccination drive in North Lakhimpur tomorrow 9am-4pm.",
      disease: "japanese_encephalitis",
      severity: "low",
      createdAt: now - 18 * 3600_000,
    },
  ];
}

const SIM_NAMES = [
  "Anita",
  "Biju",
  "Chayanika",
  "Deep",
  "Eshani",
  "Farhan",
  "Geet",
  "Hiren",
  "Indrani",
  "Jayanta",
];

function makeSimReport(): Report {
  const d = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)]!;
  const symPool: SymptomId[] = [
    "fever",
    "diarrhea",
    "vomiting",
    "headache",
    "body_ache",
    "dehydration",
  ];
  const picks: SymptomId[] = [];
  const n = 1 + Math.floor(Math.random() * 3);
  for (let k = 0; k < n; k++) {
    const v = symPool[Math.floor(Math.random() * symPool.length)];
    if (v && !picks.includes(v)) picks.push(v);
  }
  const r = Math.random();
  return {
    id:
      Date.now().toString() + Math.random().toString(36).substring(2, 8),
    userId: `sim-${Math.floor(Math.random() * 100)}`,
    userName: SIM_NAMES[Math.floor(Math.random() * SIM_NAMES.length)]!,
    districtId: d.id,
    symptoms: picks.length > 0 ? picks : ["fever"],
    severity: r > 0.85 ? "severe" : r > 0.55 ? "moderate" : "mild",
    timestamp: Date.now(),
    seed: false,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>("en");
  const [districtId, setDistrictIdState] = useState<string>(DEFAULT_DISTRICT_ID);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [liveReports, setLiveReports] = useState<Report[]>([]);
  const [adminAlerts, setAdminAlerts] = useState<Alert[]>([]);
  const [waterReports, setWaterReports] = useState<WaterReport[]>([]);
  const [online, setOnline] = useState(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [liveSimulation, setLiveSimulationState] = useState(false);

  const seedReports = useMemo(() => generateSeedReports(), []);
  const seedAlerts = useMemo(() => defaultSeedAlerts(Date.now()), []);

  // Hydrate from AsyncStorage once.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [u, lang, r, a, did, theme, wr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.reports),
          AsyncStorage.getItem(STORAGE_KEYS.alerts),
          AsyncStorage.getItem(STORAGE_KEYS.districtId),
          AsyncStorage.getItem(STORAGE_KEYS.themeMode),
          AsyncStorage.getItem(STORAGE_KEYS.waterReports),
        ]);
        if (!alive) return;
        if (u) {
          const parsed = JSON.parse(u) as User;
          setUser(parsed);
          if (parsed.districtId) setDistrictIdState(parsed.districtId);
          if (parsed.language) setLanguageState(parsed.language);
        }
        if (lang) setLanguageState(lang as Language);
        if (did) setDistrictIdState(did);
        if (r) setUserReports(JSON.parse(r));
        if (a) setAdminAlerts(JSON.parse(a));
        if (wr) setWaterReports(JSON.parse(wr));
        if (theme === "light" || theme === "dark" || theme === "system") {
          setThemeModeState(theme);
        }
      } catch {
        // ignore corrupt cache
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Live simulation tick — appends one in-memory report every 8 seconds
  // while the toggle is on. Lives only for the session.
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (liveSimulation) {
      simRef.current = setInterval(() => {
        setLiveReports((prev) => {
          const next = [makeSimReport(), ...prev];
          return next.slice(0, 80);
        });
      }, 8000);
    } else if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, [liveSimulation]);

  const reports = useMemo(
    () => [...liveReports, ...seedReports, ...userReports],
    [liveReports, seedReports, userReports],
  );

  const alerts = useMemo(
    () =>
      [...seedAlerts, ...adminAlerts].sort(
        (a, b) => b.createdAt - a.createdAt,
      ),
    [seedAlerts, adminAlerts],
  );

  const district = useMemo(
    () => DISTRICT_BY_ID[districtId] ?? DISTRICTS[0]!,
    [districtId],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language],
  );

  const signIn = useCallback<AppContextValue["signIn"]>(
    async ({ name, phone, districtId: did }) => {
      const newUser: User = {
        id:
          Date.now().toString() +
          Math.random().toString(36).substring(2, 8),
        name: name.trim() || "Guest",
        phone: phone.trim(),
        districtId: did,
        language,
        createdAt: Date.now(),
      };
      setUser(newUser);
      setDistrictIdState(did);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(newUser)),
        AsyncStorage.setItem(STORAGE_KEYS.districtId, did),
      ]);
    },
    [language],
  );

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  const setLanguage = useCallback<AppContextValue["setLanguage"]>(
    async (lang) => {
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
      if (user) {
        const next = { ...user, language: lang };
        setUser(next);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      }
    },
    [user],
  );

  const setDistrictId = useCallback<AppContextValue["setDistrictId"]>(
    async (id) => {
      setDistrictIdState(id);
      await AsyncStorage.setItem(STORAGE_KEYS.districtId, id);
      if (user) {
        const next = { ...user, districtId: id };
        setUser(next);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      }
    },
    [user],
  );

  const setThemeMode = useCallback<AppContextValue["setThemeMode"]>(
    async (mode) => {
      setThemeModeState(mode);
      await AsyncStorage.setItem(STORAGE_KEYS.themeMode, mode);
    },
    [],
  );

  const setLiveSimulation = useCallback<AppContextValue["setLiveSimulation"]>(
    (on) => {
      setLiveSimulationState(on);
      if (!on) setLiveReports([]);
    },
    [],
  );

  const submitReport = useCallback<AppContextValue["submitReport"]>(
    async ({ symptoms, severity, districtId: did }) => {
      const targetDistrict = did ?? districtId;
      const report: Report = {
        id:
          Date.now().toString() +
          Math.random().toString(36).substring(2, 8),
        userId: user?.id ?? "guest",
        userName: user?.name ?? "Guest",
        districtId: targetDistrict,
        symptoms,
        severity,
        timestamp: Date.now(),
        seed: false,
      };
      const next = [report, ...userReports];
      setUserReports(next);
      await AsyncStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(next));
      return report;
    },
    [districtId, user, userReports],
  );

  const reportUnsafeWater = useCallback<AppContextValue["reportUnsafeWater"]>(
    async ({ districtId: did, note }) => {
      const w: WaterReport = {
        id:
          Date.now().toString() +
          Math.random().toString(36).substring(2, 8),
        userId: user?.id ?? "guest",
        districtId: did,
        note,
        timestamp: Date.now(),
      };
      const next = [w, ...waterReports];
      setWaterReports(next);
      await AsyncStorage.setItem(
        STORAGE_KEYS.waterReports,
        JSON.stringify(next),
      );
      return w;
    },
    [user, waterReports],
  );

  const sendAlert = useCallback<AppContextValue["sendAlert"]>(
    async ({ districtId: did, message, severity, disease }) => {
      const alert: Alert = {
        id:
          Date.now().toString() +
          Math.random().toString(36).substring(2, 8),
        districtId: did,
        message,
        severity,
        disease,
        createdAt: Date.now(),
      };
      const next = [alert, ...adminAlerts];
      setAdminAlerts(next);
      await AsyncStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(next));
      return alert;
    },
    [adminAlerts],
  );

  const loadSampleData = useCallback(async () => {
    const now = Date.now();
    const samples: Report[] = [];
    for (let i = 0; i < 24; i++) {
      const d = DISTRICTS[(i * 5) % DISTRICTS.length]!;
      const sympPool: SymptomId[] = ["fever", "diarrhea", "vomiting", "headache"];
      const picks: SymptomId[] = [];
      for (let k = 0; k < 1 + (i % 3); k++) {
        const v = sympPool[(i + k) % sympPool.length];
        if (v && !picks.includes(v)) picks.push(v);
      }
      samples.push({
        id: `sample-${now}-${i}`,
        userId: `sample-user-${i}`,
        userName: ["Anita", "Biju", "Chayanika", "Deep", "Eshani"][i % 5]!,
        districtId: d.id,
        symptoms: picks,
        severity: i % 5 === 0 ? "severe" : i % 3 === 0 ? "moderate" : "mild",
        timestamp: now - i * 1800_000,
        seed: false,
      });
    }
    const next = [...samples, ...userReports];
    setUserReports(next);
    await AsyncStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(next));
  }, [userReports]);

  const resetUserData = useCallback(async () => {
    setUserReports([]);
    setWaterReports([]);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.reports),
      AsyncStorage.removeItem(STORAGE_KEYS.waterReports),
    ]);
  }, []);

  const toggleOffline = useCallback(() => setOnline((v) => !v), []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      user,
      language,
      districtId,
      district,
      reports,
      userReports,
      liveReports,
      alerts,
      waterReports,
      online,
      themeMode,
      liveSimulation,
      t,
      signIn,
      signOut,
      setLanguage,
      setDistrictId,
      setThemeMode,
      setLiveSimulation,
      submitReport,
      reportUnsafeWater,
      sendAlert,
      loadSampleData,
      resetUserData,
      toggleOffline,
    }),
    [
      ready,
      user,
      language,
      districtId,
      district,
      reports,
      userReports,
      liveReports,
      alerts,
      waterReports,
      online,
      themeMode,
      liveSimulation,
      t,
      signIn,
      signOut,
      setLanguage,
      setDistrictId,
      setThemeMode,
      setLiveSimulation,
      submitReport,
      reportUnsafeWater,
      sendAlert,
      loadSampleData,
      resetUserData,
      toggleOffline,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/** Same as useApp but returns null instead of throwing — for low-level hooks
 *  like useColors that are also used in places where a provider may not exist. */
export function useAppOptional(): AppContextValue | null {
  return useContext(AppContext);
}