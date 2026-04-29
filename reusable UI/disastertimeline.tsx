import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

import { Card, SectionHeader } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { DistrictRiskSnapshot } from "@/lib/risk";

type Event = {
  id: string;
  ts: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  text: string;
};

export function DisasterTimeline({
  snapshot,
}: {
  snapshot: DistrictRiskSnapshot;
}) {
  const colors = useColors();
  const { t, alerts, reports, districtId } = useApp();

  const events = useMemo<Event[]>(() => {
    const out: Event[] = [];
    const now = Date.now();
    const districtName = snapshot.district.name;

    if (snapshot.rainfall > 30) {
      out.push({
        id: "rain",
        ts: now - 9 * 3600_000,
        icon: "cloud-rain",
        color: colors.waterBlue,
        text: t("timeline_event_rain", {
          n: snapshot.rainfall,
          district: districtName,
        }),
      });
    }
    if (snapshot.waterQuality < 65) {
      out.push({
        id: "water",
        ts: now - 6 * 3600_000,
        icon: "droplet",
        color: colors.warning,
        text: t("timeline_event_water", {
          n: snapshot.waterQuality,
          district: districtName,
        }),
      });
    }
    if (snapshot.recentReports > 0) {
      out.push({
        id: "spike",
        ts: now - 3 * 3600_000,
        icon: "trending-up",
        color: snapshot.spike ? colors.danger : colors.primary,
        text: t("timeline_event_spike", {
          n: snapshot.recentReports,
          district: districtName,
        }),
      });
    }
    if (snapshot.outbreakInDays !== null && snapshot.topDisease) {
      out.push({
        id: "outbreak",
        ts: now - 1 * 3600_000,
        icon: "alert-triangle",
        color: colors.danger,
        text: t("timeline_event_outbreak", {
          disease: t(`disease_${snapshot.topDisease}`),
          district: districtName,
        }),
      });
    }
    const a = alerts.find(
      (x) => x.districtId === districtId || x.districtId === "all",
    );
    if (a) {
      out.push({
        id: `alert-${a.id}`,
        ts: a.createdAt ?? now - 30 * 60_000,
        icon: "bell",
        color: colors.primary,
        text: t("timeline_event_alert", { msg: a.message }),
      });
    }
    if (out.length === 0 && reports.length > 0) {
      out.push({
        id: "first-report",
        ts: reports[0].timestamp,
        icon: "file-text",
        color: colors.primary,
        text: t("timeline_event_spike", {
          n: 1,
          district: districtName,
        }),
      });
    }
    return out.sort((a, b) => a.ts - b.ts);
  }, [snapshot, t, colors, alerts, reports, districtId]);

  if (events.length === 0) {
    return (
      <Card>
        <SectionHeader title={t("disaster_timeline")} />
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 13,
            color: colors.mutedForeground,
            paddingVertical: 12,
            textAlign: "center",
          }}
        >
          {t("timeline_empty")}
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title={t("disaster_timeline")} />
      <View style={{ paddingLeft: 4 }}>
        {events.map((e, i) => {
          const ageMin = Math.max(1, Math.round((Date.now() - e.ts) / 60_000));
          const timeText =
            ageMin < 60
              ? t("minutes_ago", { n: ageMin })
              : t("hours_ago", { n: Math.round(ageMin / 60) });
          const isLast = i === events.length - 1;
          return (
            <View
              key={e.id}
              style={{ flexDirection: "row", gap: 12, paddingBottom: 14 }}
            >
              <View style={{ alignItems: "center", width: 28 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    backgroundColor: e.color + "1F",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name={e.icon} size={13} color={e.color} />
                </View>
                {!isLast ? (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      marginTop: 4,
                      backgroundColor: colors.border,
                    }}
                  />
                ) : null}
              </View>
              <View style={{ flex: 1, paddingTop: 2 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: colors.foreground,
                    lineHeight: 18,
                  }}
                >
                  {e.text}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    marginTop: 4,
                  }}
                >
                  {isLast ? t("timeline_now") : timeText}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}