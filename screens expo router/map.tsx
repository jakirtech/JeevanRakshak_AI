import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AssamMap } from "@/components/AssamMap";
import { Card, Pill, RiskBadge, SectionHeader } from "@/components/UI";
import { DISTRICTS } from "@/constants/districts";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { computeDistrictRisk, RiskLevel } from "@/lib/risk";

type Filter = "all" | RiskLevel;

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, districtId, setDistrictId, liveSimulation, t } = useApp();
  const { width } = useWindowDimensions();

  const [filter, setFilter] = useState<Filter>("all");
  const [heatmap, setHeatmap] = useState(false);

  const snapshots = useMemo(
    () => DISTRICTS.map((d) => computeDistrictRisk(d, reports)),
    [reports],
  );

  const counts = useMemo(() => {
    const c = { all: snapshots.length, high: 0, medium: 0, safe: 0 };
    for (const s of snapshots) {
      c[s.riskLevel]++;
    }
    return c;
  }, [snapshots]);

  const visible = useMemo(() => {
    const list = filter === "all" ? snapshots : snapshots.filter((s) => s.riskLevel === filter);
    return list.sort((a, b) => b.riskScore - a.riskScore);
  }, [snapshots, filter]);

  const mapWidth = Math.min(width - 32, 720);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              color: colors.foreground,
              letterSpacing: -0.5,
            }}
          >
            {t("map_title")}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: colors.mutedForeground,
              marginTop: 4,
            }}
          >
            {t("map_subtitle", { n: DISTRICTS.length })}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          style={{ marginBottom: 12 }}
        >
          <Pill
            label={`${t("filter_all")} (${counts.all})`}
            selected={filter === "all"}
            onPress={() => setFilter("all")}
          />
          <Pill
            label={`${t("filter_high")} (${counts.high})`}
            selected={filter === "high"}
            onPress={() => setFilter("high")}
            icon="alert-triangle"
          />
          <Pill
            label={`${t("filter_medium")} (${counts.medium})`}
            selected={filter === "medium"}
            onPress={() => setFilter("medium")}
          />
          <Pill
            label={`${t("filter_safe")} (${counts.safe})`}
            selected={filter === "safe"}
            onPress={() => setFilter("safe")}
          />
          <Pill
            label={heatmap ? t("hide_heatmap") : t("show_heatmap")}
            selected={heatmap}
            onPress={() => setHeatmap(!heatmap)}
            icon="layers"
          />
        </ScrollView>

        {liveSimulation ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.danger + "1A",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              alignSelf: "flex-start",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: colors.danger,
              }}
            />
            <Text
              style={{
                color: colors.danger,
                fontFamily: "Inter_700Bold",
                fontSize: 11,
                letterSpacing: 0.4,
              }}
            >
              {t("live_on")}
            </Text>
          </View>
        ) : null}

        <Card padding={12} style={{ alignItems: "center" }}>
          <AssamMap
            snapshots={snapshots}
            width={mapWidth}
            selectedId={districtId}
            onSelect={(id) => setDistrictId(id)}
            filter={filter}
            showHeatmap={heatmap}
          />
          <Text
            style={{
              marginTop: 8,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            {t("tap_district")}
          </Text>
        </Card>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("cases_by_district")} />
          <Card padding={0}>
            {visible.slice(0, 20).map((s, i) => (
              <Pressable
                key={s.district.id}
                onPress={() => router.push(`/district/${s.district.id}`)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                  gap: 10,
                })}
              >
                <View
                  style={{
                    width: 28,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 13,
                      color: colors.mutedForeground,
                    }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.foreground,
                    }}
                  >
                    {s.district.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {s.recentReports} reports · WQI {s.waterQuality}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <RiskBadge
                    level={s.riskLevel}
                    label={`${s.riskScore}`}
                    size="sm"
                  />
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}