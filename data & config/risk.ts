import {
  BRAHMAPUTRA_PATH,
  DISTRICTS,
  DistrictProfile,
} from "@/constants/districts";
import { DISEASE_LIST, DiseaseId, SymptomId } from "@/constants/diseases";
import type { Report } from "@/contexts/AppContext";

export type RiskLevel = "safe" | "medium" | "high";

export type RiskBreakdown = {
  reports: number;
  water: number;
  rainfall: number;
  baseline: number;
  trend: number;
};

export type DistrictRiskSnapshot = {
  district: DistrictProfile;
  recentReports: number; // 7-day window
  reportsToday: number;
  reportsYesterday: number;
  trendRatio: number; // today / max(yesterday,1)
  spike: boolean; // trendRatio > 1.5 with at least 3 today
  symptomCount: Record<SymptomId, number>;
  waterQuality: number;
  rainfall: number;
  temperature: number;
  humidity: number;
  weather: DistrictProfile["weather"];
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  breakdown: RiskBreakdown;
  topDisease: DiseaseId | null;
  outbreakInDays: number | null;
  /** Hours until predicted peak when an outbreak is forecast, else null. */
  peakHours: number | null;
};

const SEVERE_WEIGHT: Record<"mild" | "moderate" | "severe", number> = {
  mild: 1,
  moderate: 2,
  severe: 3,
};

function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const SESSION_SEED = Math.floor(Date.now() / (1000 * 60 * 60));

export function simulateWaterQuality(d: DistrictProfile): number {
  const noise = (seededRand(SESSION_SEED + d.reportSeed) - 0.5) * 18;
  return clamp(d.baseWaterQuality + noise, 5, 95);
}

export function simulateRainfall(d: DistrictProfile): number {
  const noise = (seededRand(SESSION_SEED + d.reportSeed * 3) - 0.5) * 30;
  return clamp(d.baseRainfall + noise, 0, 220);
}

export function simulateTemperature(d: DistrictProfile): number {
  const noise = (seededRand(SESSION_SEED + d.reportSeed * 7) - 0.5) * 4;
  return Math.round((d.baseTemperature + noise) * 10) / 10;
}

export function simulateHumidity(d: DistrictProfile): number {
  const base =
    d.weather === "storm"
      ? 92
      : d.weather === "rainy"
        ? 84
        : d.weather === "cloudy"
          ? 72
          : 58;
  const noise = (seededRand(SESSION_SEED + d.reportSeed * 11) - 0.5) * 10;
  return Math.round(clamp(base + noise, 35, 99));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function generateSeedReports(now: number = Date.now()): Report[] {
  const reports: Report[] = [];
  for (const d of DISTRICTS) {
    const count = Math.round(
      d.reportSeed * (d.floodProneLevel === "high" ? 1.4 : 1) +
        seededRand(d.reportSeed) * 4,
    );
    for (let i = 0; i < count; i++) {
      const r = seededRand(d.reportSeed * 100 + i);
      const ageHours = Math.floor(r * 24 * 7);
      const symptoms: SymptomId[] = pickSymptomsForDistrict(d, i);
      const severity =
        r > 0.85 ? "severe" : r > 0.55 ? "moderate" : "mild";
      reports.push({
        id: `seed-${d.id}-${i}`,
        userId: `seed-user-${d.id}-${i % 5}`,
        userName: pseudoName(d.id, i),
        districtId: d.id,
        symptoms,
        severity,
        timestamp: now - ageHours * 3600_000,
        seed: true,
      });
    }
  }
  return reports;
}

function pickSymptomsForDistrict(
  d: DistrictProfile,
  i: number,
): SymptomId[] {
  const pool: SymptomId[] = [];
  for (const dis of d.activeDiseases) {
    const meta = DISEASE_LIST.find((x) => x.id === (dis as DiseaseId));
    if (meta) pool.push(...meta.symptoms);
  }
  if (pool.length === 0) pool.push("fever");
  const r = seededRand(d.reportSeed * 31 + i * 7);
  const n = 1 + Math.floor(r * Math.min(3, pool.length));
  const out = new Set<SymptomId>();
  for (let k = 0; k < n; k++) {
    const idx = Math.floor(seededRand(d.reportSeed + i + k) * pool.length);
    const s = pool[idx];
    if (s) out.add(s);
  }
  return Array.from(out);
}

const FIRST_NAMES = [
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
  "Kamala",
  "Lakhi",
  "Manash",
  "Niharika",
  "Pranab",
  "Rupali",
];
function pseudoName(districtId: string, i: number): string {
  const idx = (districtId.length + i) % FIRST_NAMES.length;
  return FIRST_NAMES[idx]!;
}

/**
 * Hybrid risk engine: rule-based weighting + trend detection +
 * confidence scoring based on data volume.
 */
export function computeDistrictRisk(
  district: DistrictProfile,
  reports: Report[],
  now: number = Date.now(),
): DistrictRiskSnapshot {
  const sevenDays = 7 * 24 * 3600_000;
  const oneDay = 24 * 3600_000;
  const recent = reports.filter(
    (r) => r.districtId === district.id && now - r.timestamp <= sevenDays,
  );
  const reportsToday = recent.filter((r) => now - r.timestamp <= oneDay).length;
  const reportsYesterday = recent.filter(
    (r) => now - r.timestamp > oneDay && now - r.timestamp <= 2 * oneDay,
  ).length;
  const trendRatio = reportsToday / Math.max(1, reportsYesterday);

  const symptomCount: Record<SymptomId, number> = {
    fever: 0,
    vomiting: 0,
    diarrhea: 0,
    fatigue: 0,
    headache: 0,
    body_ache: 0,
    abdominal_pain: 0,
    dehydration: 0,
    jaundice: 0,
    chills: 0,
    rash: 0,
    cough: 0,
  };
  let weighted = 0;
  for (const r of recent) {
    const w = SEVERE_WEIGHT[r.severity];
    for (const s of r.symptoms) {
      symptomCount[s] += w;
      weighted += w;
    }
  }

  const wq = simulateWaterQuality(district);
  const rainfall = simulateRainfall(district);
  const temperature = simulateTemperature(district);
  const humidity = simulateHumidity(district);

  const reportFactor = Math.min(45, weighted * 1.4);
  const waterFactor = (100 - wq) * 0.3;
  const rainFactor = Math.min(18, rainfall / 6);
  const baselineFactor =
    district.floodProneLevel === "high"
      ? 12
      : district.floodProneLevel === "medium"
        ? 6
        : 2;
  const trendFactor =
    reportsToday >= 3 && trendRatio > 1.5
      ? Math.min(12, (trendRatio - 1) * 4)
      : 0;

  let score = clamp(
    reportFactor + waterFactor + rainFactor + baselineFactor + trendFactor,
    0,
    100,
  );

  const riskLevel: RiskLevel =
    score >= 60 ? "high" : score >= 32 ? "medium" : "safe";

  const topDisease = findTopDisease(symptomCount, district);

  let outbreakInDays: number | null = null;
  let peakHours: number | null = null;
  if (riskLevel === "high") {
    outbreakInDays = wq < 35 ? 1 : 2;
    peakHours = Math.max(12, Math.round(48 - score * 0.4));
  } else if (riskLevel === "medium" && weighted > 10) {
    outbreakInDays = 4;
    peakHours = 96;
  }

  // Confidence: more recent reports + nonzero environmental signal -> more confident.
  const confidence = Math.round(
    clamp(45 + recent.length * 2 + (humidity > 70 ? 5 : 0), 35, 96),
  );

  return {
    district,
    recentReports: recent.length,
    reportsToday,
    reportsYesterday,
    trendRatio: Math.round(trendRatio * 10) / 10,
    spike: reportsToday >= 3 && trendRatio > 1.5,
    symptomCount,
    waterQuality: Math.round(wq),
    rainfall: Math.round(rainfall),
    temperature,
    humidity,
    weather: district.weather,
    riskScore: Math.round(score),
    riskLevel,
    confidence,
    breakdown: {
      reports: Math.round(reportFactor),
      water: Math.round(waterFactor),
      rainfall: Math.round(rainFactor),
      baseline: baselineFactor,
      trend: Math.round(trendFactor),
    },
    topDisease,
    outbreakInDays,
    peakHours,
  };
}

function findTopDisease(
  symptomCount: Record<SymptomId, number>,
  district: DistrictProfile,
): DiseaseId | null {
  let best: { id: DiseaseId; score: number } | null = null;
  for (const id of district.activeDiseases) {
    const meta = DISEASE_LIST.find((x) => x.id === (id as DiseaseId));
    if (!meta) continue;
    let score = 0;
    for (const s of meta.symptoms) score += symptomCount[s];
    if (score > 0 && (!best || score > best.score)) {
      best = { id: meta.id, score };
    }
  }
  if (best) return best.id;
  return (district.activeDiseases[0] as DiseaseId) ?? null;
}

export function recommendForReport(
  symptoms: SymptomId[],
  district: DistrictProfile,
  severity: "mild" | "moderate" | "severe",
): { disease: DiseaseId | null; tips: string[] } {
  let bestDisease: DiseaseId | null = null;
  let bestOverlap = 0;
  for (const meta of DISEASE_LIST) {
    if (!district.activeDiseases.includes(meta.id)) continue;
    const overlap = meta.symptoms.filter((s) => symptoms.includes(s)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestDisease = meta.id;
    }
  }
  if (!bestDisease) {
    for (const meta of DISEASE_LIST) {
      const overlap = meta.symptoms.filter((s) => symptoms.includes(s))
        .length;
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestDisease = meta.id;
      }
    }
  }
  const tips: string[] = [];
  if (bestDisease) {
    const meta = DISEASE_LIST.find((x) => x.id === bestDisease)!;
    tips.push(...meta.prevention);
  }
  if (severity === "severe") {
    tips.unshift("Visit the nearest PHC or relief camp immediately.");
  } else if (severity === "moderate") {
    tips.unshift("Start ORS and monitor symptoms for 24 hours.");
  }
  return { disease: bestDisease, tips };
}

/**
 * Daily, context-aware health advisory tailored to the snapshot:
 * weather, water quality, active diseases, and trend signals.
 */
export function generateAdvisory(
  snapshot: DistrictRiskSnapshot,
): { headline: string; tips: string[] } {
  const tips: string[] = [];
  if (snapshot.waterQuality < 45) {
    tips.push("Boil drinking water for at least 1 minute before use.");
  }
  if (snapshot.rainfall > 60 || snapshot.weather === "storm") {
    tips.push("Avoid wading through flood water — use boots if unavoidable.");
  }
  if (snapshot.humidity > 80) {
    tips.push("Cover stored water and empty containers to stop mosquito breeding.");
  }
  if (snapshot.district.activeDiseases.includes("cholera")) {
    tips.push("Keep ORS sachets at home. Diarrhea + vomiting needs care within 4 hours.");
  }
  if (
    snapshot.district.activeDiseases.includes("dengue") ||
    snapshot.district.activeDiseases.includes("chikungunya")
  ) {
    tips.push("Wear long sleeves at dawn and dusk. Use mosquito repellent.");
  }
  if (snapshot.district.activeDiseases.includes("japanese_encephalitis")) {
    tips.push("JE vaccination is open for children 1–15 at the nearest PHC.");
  }
  if (snapshot.spike) {
    tips.push("Cases are spiking today — limit travel to crowded relief camps if possible.");
  }
  if (tips.length === 0) {
    tips.push("Wash hands with soap before meals and after using the toilet.");
    tips.push("Keep your phone charged and contacts updated for emergencies.");
  }

  let headline = "Daily safety brief";
  if (snapshot.riskLevel === "high") headline = "Take action today";
  else if (snapshot.spike) headline = "Cases rising — stay alert";
  else if (snapshot.riskLevel === "medium") headline = "Stay cautious";

  return { headline, tips: tips.slice(0, 4) };
}

/** Suggestions surfaced in the admin AI panel. */
export function generateAdminSuggestions(
  snapshots: DistrictRiskSnapshot[],
): { id: string; text: string; districtId?: string; tone: "info" | "warn" | "danger" }[] {
  const out: {
    id: string;
    text: string;
    districtId?: string;
    tone: "info" | "warn" | "danger";
  }[] = [];
  const spikes = snapshots.filter((s) => s.spike).slice(0, 3);
  for (const s of spikes) {
    out.push({
      id: `sp-${s.district.id}`,
      text: `Cases up ${Math.round((s.trendRatio - 1) * 100)}% in ${s.district.name} — recommend an alert.`,
      districtId: s.district.id,
      tone: "danger",
    });
  }
  const lowWater = snapshots
    .filter((s) => s.waterQuality < 35)
    .sort((a, b) => a.waterQuality - b.waterQuality)
    .slice(0, 2);
  for (const s of lowWater) {
    out.push({
      id: `lw-${s.district.id}`,
      text: `Water quality critical (${s.waterQuality}/100) in ${s.district.name} — dispatch ORS.`,
      districtId: s.district.id,
      tone: "warn",
    });
  }
  const highRisk = snapshots.filter(
    (s) => s.riskLevel === "high" && !spikes.some((x) => x.district.id === s.district.id),
  );
  if (highRisk.length > 0) {
    out.push({
      id: `hr-summary`,
      text: `${highRisk.length} districts are at HIGH risk — open Map view for triage.`,
      tone: "warn",
    });
  }
  if (out.length === 0) {
    out.push({
      id: `ok`,
      text: "All zones are stable. Keep monitoring twice daily.",
      tone: "info",
    });
  }
  return out;
}

/** Build CSV content from reports for export. */
export function reportsToCSV(reports: Report[]): string {
  const header = [
    "id",
    "user",
    "district",
    "severity",
    "symptoms",
    "timestamp_iso",
  ].join(",");
  const rows = reports.map((r) =>
    [
      r.id,
      JSON.stringify(r.userName),
      r.districtId,
      r.severity,
      JSON.stringify(r.symptoms.join("|")),
      new Date(r.timestamp).toISOString(),
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function projectAssam(
  lat: number,
  lon: number,
  width: number,
  height: number,
  padding = 28,
): { x: number; y: number } {
  const minLon = 89.5;
  const maxLon = 96.2;
  const minLat = 24.0;
  const maxLat = 28.0;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const x = padding + ((lon - minLon) / (maxLon - minLon)) * innerW;
  const y = padding + ((maxLat - lat) / (maxLat - minLat)) * innerH;
  return { x, y };
}

export function brahmaputraSvgPoints(
  width: number,
  height: number,
): { x: number; y: number }[] {
  return BRAHMAPUTRA_PATH.map((p) => projectAssam(p.lat, p.lon, width, height));
}

/** Haversine-ish distance in km between two lat/lon (good enough for ~Assam scale). */
export function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}