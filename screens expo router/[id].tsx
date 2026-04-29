import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LineChart, ProgressRing } from "@/components/Charts";
import {
  Card,
  EmptyState,
  RiskBadge,
  SectionHeader,
  StatRow,
} from "@/components/UI";
import { DISTRICT_BY_ID } from "@/constants/districts";
import { DISEASES } from "@/constants/diseases";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { computeDistrictRisk } from "@/lib/risk";

export default function DistrictDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, alerts, t } = useApp();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const district = useMemo(() => DISTRICT_BY_ID[id ?? ""] ?? null, [id]);

  if (!district) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <EmptyState icon="alert-circle" title="District not found" />
      </View>
    );
  }

  const snapshot = computeDistrictRisk(district, reports);

  const timeline = useMemo(() => {
    const days: { x: string; y: number }[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const start = now - (i + 1) * 24 * 3600_000;
      const end = now - i * 24 * 3600_000;
      const count = reports.filter(
        (r) =>
          r.districtId === district.id &&
          r.timestamp >= start &&
          r.timestamp < end,
      ).length;
      const date = new Date(start);
      days.push({ x: `${date.getMonth() + 1}/${date.getDate()}`, y: count });
    }
    return days;
  }, [reports, district.id]);

  const districtAlerts = alerts.filter(
    (a) => a.districtId === district.id || a.districtId === "all",
  );

  const riskColor =
    snapshot.riskLevel === "high"
      ? colors.danger
      : snapshot.riskLevel === "medium"
        ? colors.warning
        : colors.safe;

  const chartWidth = Math.min(width - 64, 720);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerTitle: district.name,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontFamily: "Inter_700Bold",
            fontSize: 17,
          },
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
        }}
      >
        <LinearGradient
          colors={[colors.primary, colors.surfaceDark]}
          style={{ padding: 20, paddingBottom: 24 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <ProgressRing
              value={snapshot.riskScore}
              color={riskColor}
              label={`${snapshot.riskScore}`}
              sublabel="risk score"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#E0F2F1",
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                HQ {district.hq}
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 22,
                  letterSpacing: -0.4,
                  marginTop: 4,
                }}
              >
                {district.name}
              </Text>
              <View style={{ marginTop: 10 }}>
                <RiskBadge
                  level={snapshot.riskLevel}
                  size="md"
                  label={t(
                    snapshot.riskLevel === "high"
                      ? "high_risk"
                      : snapshot.riskLevel === "medium"
                        ? "medium_risk"
                        : "safe",
                  )}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 16, gap: 16 }}>
          <Card>
            <SectionHeader title={t("symptoms_over_time")} />
            <LineChart data={timeline} width={chartWidth} height={160} />
          </Card>

          <Card>
            <SectionHeader title="Environmental signals" />
            <StatRow
              icon="droplet"
              label={t("water_quality")}
              value={`${snapshot.waterQuality}/100`}
              tone={
                snapshot.waterQuality < 40
                  ? colors.danger
                  : snapshot.waterQuality < 60
                    ? colors.warning
                    : colors.safe
              }
            />
            <StatRow
              icon="cloud-rain"
              label={t("rainfall_24h")}
              value={`${snapshot.rainfall} mm`}
              tone={colors.waterBlue}
            />
            <StatRow
              icon="thermometer"
              label={t("temperature")}
              value={`${snapshot.temperature}°C`}
              tone={colors.primary}
            />
            <StatRow
              icon="users"
              label={t("population")}
              value={`${district.population}k`}
              tone={colors.mutedForeground}
            />
            <StatRow
              icon="activity"
              label={t("cases_recent")}
              value={`${snapshot.recentReports}`}
              tone={
                snapshot.recentReports > 20
                  ? colors.danger
                  : snapshot.recentReports > 10
                    ? colors.warning
                    : colors.safe
              }
            />
          </Card>

          <Card>
            <SectionHeader title={t("active_diseases")} />
            <View style={{ gap: 12 }}>
              {district.activeDiseases.map((id) => {
                const meta = DISEASES[id as keyof typeof DISEASES];
                if (!meta) return null;
                return (
                  <View key={id}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Feather
                        name={
                          meta.family === "vector"
                            ? "wind"
                            : meta.family === "skin"
                              ? "circle"
                              : "droplet"
                        }
                        size={14}
                        color={colors.danger}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 14,
                          color: colors.foreground,
                        }}
                      >
                        {t(`disease_${meta.id}`)}
                      </Text>
                    </View>
                    {meta.prevention.map((p, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          paddingLeft: 22,
                          paddingVertical: 3,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.primary,
                            fontFamily: "Inter_700Bold",
                          }}
                        >
                          ·
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            color: colors.mutedForeground,
                            lineHeight: 18,
                          }}
                        >
                          {p}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </Card>

          <Card>
            <SectionHeader title={t("recent_alerts")} />
            {districtAlerts.length === 0 ? (
              <EmptyState icon="bell-off" title={t("no_alerts")} />
            ) : (
              <View style={{ gap: 10 }}>
                {districtAlerts.slice(0, 5).map((a) => {
                  const tone =
                    a.severity === "high"
                      ? colors.danger
                      : a.severity === "medium"
                        ? colors.warning
                        : colors.primary;
                  return (
                    <View
                      key={a.id}
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        paddingVertical: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 4,
                          borderRadius: 999,
                          backgroundColor: tone,
                        }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontFamily: "Inter_500Medium",
                          fontSize: 13,
                          color: colors.foreground,
                          lineHeight: 18,
                        }}
                      >
                        {a.message}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
      {Platform.OS === "ios" ? null : null}
    </View>
  );
}