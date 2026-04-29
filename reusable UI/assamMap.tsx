import React from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { DISTRICTS } from "@/constants/districts";
import { useColors } from "@/hooks/useColors";
import {
  brahmaputraSvgPoints,
  DistrictRiskSnapshot,
  projectAssam,
  RiskLevel,
} from "@/lib/risk";

const VB_W = 720;
const VB_H = 420;

export function AssamMap({
  snapshots,
  width,
  selectedId,
  onSelect,
  filter = "all",
  showHeatmap = false,
}: {
  snapshots: DistrictRiskSnapshot[];
  width: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  filter?: "all" | RiskLevel;
  showHeatmap?: boolean;
}) {
  const colors = useColors();
  const height = (width / VB_W) * VB_H;
  const aspect = width / VB_W;

  const riverPts = brahmaputraSvgPoints(VB_W, VB_H);
  const riverPath = riverPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const barakPts: { x: number; y: number }[] = [
    { x: 92.2, y: 24.55 },
    { x: 92.5, y: 24.7 },
    { x: 92.8, y: 24.85 },
    { x: 93.0, y: 25.05 },
  ].map((p) => projectAssam(p.y, p.x, VB_W, VB_H));
  const barakPath = barakPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Approximate Assam outline polygon — stylised, not survey-grade.
  const outline: { lat: number; lon: number }[] = [
    { lat: 27.95, lon: 95.95 },
    { lat: 27.6, lon: 96.15 },
    { lat: 27.0, lon: 95.6 },
    { lat: 26.6, lon: 95.5 },
    { lat: 26.2, lon: 95.05 },
    { lat: 25.4, lon: 93.8 },
    { lat: 24.6, lon: 93.45 },
    { lat: 24.5, lon: 92.8 },
    { lat: 24.55, lon: 92.2 },
    { lat: 25.0, lon: 91.6 },
    { lat: 25.55, lon: 90.4 },
    { lat: 25.85, lon: 89.85 },
    { lat: 26.3, lon: 89.7 },
    { lat: 26.7, lon: 90.1 },
    { lat: 26.85, lon: 90.55 },
    { lat: 27.05, lon: 91.4 },
    { lat: 27.3, lon: 92.5 },
    { lat: 27.7, lon: 94.0 },
    { lat: 27.95, lon: 95.0 },
  ];
  const outlinePath =
    outline
      .map((p, i) => {
        const { x, y } = projectAssam(p.lat, p.lon, VB_W, VB_H);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  const colorFor = (level: RiskLevel) => {
    if (level === "high") return colors.danger;
    if (level === "medium") return colors.warning;
    return colors.safe;
  };

  // Draw labels only for a few key districts to avoid clutter.
  const labeledIds = new Set([
    "kamrup_metro",
    "dibrugarh",
    "tinsukia",
    "jorhat",
    "tezpur",
    "majuli",
    "dhubri",
    "silchar",
    "cachar",
    "nagaon",
    "bongaigaon",
    "lakhimpur",
  ]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.surface} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.background} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E6F0EF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D9E7E5" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#bg)" />
        <Path
          d={outlinePath}
          fill="url(#land)"
          stroke={colors.primary}
          strokeWidth={1.2}
          strokeOpacity={0.35}
        />
        <Path
          d={riverPath}
          stroke={colors.riverBlue}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55}
        />
        <Path
          d={riverPath}
          stroke={colors.waterBlue}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        <Path
          d={barakPath}
          stroke={colors.waterBlue}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />
        {/* River labels */}
        <SvgText
          x={projectAssam(26.6, 92.2, VB_W, VB_H).x}
          y={projectAssam(26.6, 92.2, VB_W, VB_H).y - 8}
          fontSize={11}
          fill={colors.waterBlue}
          fontFamily="Inter_600SemiBold"
          textAnchor="middle"
        >
          Brahmaputra
        </SvgText>
        <SvgText
          x={projectAssam(24.7, 92.5, VB_W, VB_H).x}
          y={projectAssam(24.7, 92.5, VB_W, VB_H).y + 14}
          fontSize={10}
          fill={colors.waterBlue}
          fontFamily="Inter_500Medium"
          textAnchor="middle"
        >
          Barak
        </SvgText>
        {showHeatmap
          ? snapshots.map((s) => {
              const { x, y } = projectAssam(
                s.district.lat,
                s.district.lon,
                VB_W,
                VB_H,
              );
              const intensity = Math.min(1, s.recentReports / 14);
              if (intensity <= 0.05) return null;
              const radius = 22 + intensity * 38;
              const fill =
                s.riskLevel === "high"
                  ? colors.danger
                  : s.riskLevel === "medium"
                    ? colors.warning
                    : colors.safe;
              return (
                <Circle
                  key={`heat-${s.district.id}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={fill}
                  opacity={0.18 + intensity * 0.22}
                />
              );
            })
          : null}
        {DISTRICTS.map((d) => {
          const snap = snapshots.find((s) => s.district.id === d.id);
          const lvl: RiskLevel = snap?.riskLevel ?? "safe";
          const visible =
            filter === "all" || filter === lvl;
          const { x, y } = projectAssam(d.lat, d.lon, VB_W, VB_H);
          const r = lvl === "high" ? 11 : lvl === "medium" ? 9 : 7;
          const fill = colorFor(lvl);
          const isSelected = d.id === selectedId;
          return (
            <G key={d.id} opacity={visible ? 1 : 0.18}>
              {isSelected ? (
                <Circle
                  cx={x}
                  cy={y}
                  r={r + 6}
                  fill="none"
                  stroke={fill}
                  strokeWidth={2}
                  opacity={0.5}
                />
              ) : null}
              <Circle cx={x} cy={y} r={r + 2} fill="#FFFFFF" opacity={0.9} />
              <Circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                opacity={lvl === "safe" ? 0.85 : 0.95}
                onPress={onSelect ? () => onSelect(d.id) : undefined}
              />
              {labeledIds.has(d.id) ? (
                <SvgText
                  x={x}
                  y={y - r - 4}
                  fontSize={10}
                  fill={colors.foreground}
                  fontFamily="Inter_600SemiBold"
                  textAnchor="middle"
                >
                  {d.name.length > 12 ? d.name.slice(0, 11) + "…" : d.name}
                </SvgText>
              ) : null}
            </G>
          );
        })}
        {/* Legend */}
        <G transform={`translate(${VB_W - 168}, ${VB_H - 78})`}>
          <Rect
            x={0}
            y={0}
            width={156}
            height={68}
            rx={10}
            fill="#FFFFFF"
            opacity={0.92}
            stroke={colors.border}
          />
          <Circle cx={14} cy={18} r={5} fill={colors.danger} />
          <SvgText
            x={26}
            y={22}
            fontSize={11}
            fill={colors.foreground}
            fontFamily="Inter_500Medium"
          >
            High risk
          </SvgText>
          <Circle cx={14} cy={36} r={5} fill={colors.warning} />
          <SvgText
            x={26}
            y={40}
            fontSize={11}
            fill={colors.foreground}
            fontFamily="Inter_500Medium"
          >
            Medium risk
          </SvgText>
          <Circle cx={14} cy={54} r={5} fill={colors.safe} />
          <SvgText
            x={26}
            y={58}
            fontSize={11}
            fill={colors.foreground}
            fontFamily="Inter_500Medium"
          >
            Safe
          </SvgText>
        </G>
      </Svg>
      {/* Invisible aspect placeholder so layout is correct */}
      <View pointerEvents="none" style={{ position: "absolute", width, height }} />
      <Aspect aspect={aspect} />
    </View>
  );
}

function Aspect({ aspect }: { aspect: number }) {
  // Layout helper — only present for type/lint clarity.
  void aspect;
  return null;
}