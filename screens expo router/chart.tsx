import React from "react";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

export type LinePoint = { x: string; y: number };

export function LineChart({
  data,
  width,
  height = 180,
  yMax,
}: {
  data: LinePoint[];
  width: number;
  height?: number;
  yMax?: number;
}) {
  const colors = useColors();
  const padding = { top: 12, right: 12, bottom: 28, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(yMax ?? 0, ...data.map((d) => d.y), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + innerH - (d.y / max) * innerH;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1]!.x.toFixed(1)},${
          padding.top + innerH
        } L${points[0]!.x.toFixed(1)},${padding.top + innerH} Z`
      : "";

  const yTicks = 4;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.28" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = padding.top + (innerH / yTicks) * i;
          const value = Math.round(max - (max / yTicks) * i);
          return (
            <React.Fragment key={`y-${i}`}>
              <Path
                d={`M${padding.left},${y} L${padding.left + innerW},${y}`}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray={i === yTicks ? undefined : "3 3"}
              />
              <SvgText
                x={padding.left - 6}
                y={y + 3}
                fontSize={9}
                fill={colors.mutedForeground}
                textAnchor="end"
                fontFamily="Inter_500Medium"
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
        {areaPath ? <Path d={areaPath} fill="url(#lineFill)" /> : null}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {points.map((p, i) => (
          <React.Fragment key={`pt-${i}`}>
            <Rect
              x={p.x - 3}
              y={p.y - 3}
              width={6}
              height={6}
              fill={colors.card}
              stroke={colors.primary}
              strokeWidth={1.5}
              rx={2}
            />
          </React.Fragment>
        ))}
        {data.map((d, i) => {
          if (data.length > 8 && i % 2 === 1) return null;
          const x = padding.left + i * stepX;
          return (
            <SvgText
              key={`xl-${i}`}
              x={x}
              y={height - 8}
              fontSize={9}
              fill={colors.mutedForeground}
              textAnchor="middle"
              fontFamily="Inter_500Medium"
            >
              {d.x}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

export type BarPoint = { label: string; value: number; color?: string };

export function BarChart({
  data,
  width,
  height = 220,
  maxBars = 10,
}: {
  data: BarPoint[];
  width: number;
  height?: number;
  maxBars?: number;
}) {
  const colors = useColors();
  const visible = data.slice(0, maxBars);
  const padding = { top: 8, right: 8, bottom: 56, left: 28 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...visible.map((d) => d.value));
  const gap = 8;
  const barW = visible.length > 0 ? (innerW - gap * (visible.length - 1)) / visible.length : 0;

  return (
    <Svg width={width} height={height}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = padding.top + innerH * (1 - f);
        return (
          <Path
            key={`grid-${i}`}
            d={`M${padding.left},${y} L${padding.left + innerW},${y}`}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray={f === 0 ? undefined : "3 3"}
          />
        );
      })}
      {visible.map((d, i) => {
        const x = padding.left + i * (barW + gap);
        const h = (d.value / max) * innerH;
        const y = padding.top + innerH - h;
        return (
          <React.Fragment key={`bar-${i}`}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(2, h)}
              rx={4}
              fill={d.color ?? colors.primary}
              opacity={0.95}
            />
            <SvgText
              x={x + barW / 2}
              y={y - 4}
              fontSize={9}
              fill={colors.foreground}
              textAnchor="middle"
              fontFamily="Inter_600SemiBold"
            >
              {d.value}
            </SvgText>
            <SvgText
              x={x + barW / 2}
              y={padding.top + innerH + 14}
              fontSize={9}
              fill={colors.mutedForeground}
              textAnchor="middle"
              fontFamily="Inter_500Medium"
              transform={`rotate(-30 ${x + barW / 2} ${
                padding.top + innerH + 14
              })`}
            >
              {d.label.length > 12 ? d.label.slice(0, 11) + "…" : d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export function ProgressRing({
  value,
  max = 100,
  size = 96,
  strokeWidth = 10,
  color,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  sublabel?: string;
}) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const dash = circ * pct;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Path
          d={describeArc(size / 2, size / 2, radius, 0, 359.999)}
          stroke={colors.secondary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={describeArc(size / 2, size / 2, radius, 0, 359.999 * pct)}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
            fontSize: 22,
            letterSpacing: -0.5,
          }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              color: colors.mutedForeground,
              fontSize: 10,
              marginTop: 2,
            }}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}