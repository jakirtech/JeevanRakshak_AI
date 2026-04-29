import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { Card } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export function StoryHero({
  affected,
  highRiskZones,
  outbreaksPredicted,
  spikes,
}: {
  affected: number;
  highRiskZones: number;
  outbreaksPredicted: number;
  spikes: number;
}) {
  const colors = useColors();
  const { t } = useApp();
  const items: {
    icon: keyof typeof Feather.glyphMap;
    color: string;
    value: number;
    label: string;
  }[] = [
    {
      icon: "users",
      color: colors.primary,
      value: affected,
      label: t("people_affected"),
    },
    {
      icon: "alert-triangle",
      color: colors.danger,
      value: highRiskZones,
      label: t("high_risk_zones"),
    },
    {
      icon: "trending-up",
      color: colors.warning,
      value: spikes,
      label: t("spikes_today"),
    },
    {
      icon: "activity",
      color: colors.waterBlue,
      value: outbreaksPredicted,
      label: t("outbreaks_predicted"),
    },
  ];
  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Feather name="bar-chart-2" size={16} color={colors.primary} />
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 14,
            color: colors.foreground,
            letterSpacing: -0.2,
          }}
        >
          {t("today_in_assam")}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          rowGap: 12,
        }}
      >
        {items.map((it) => (
          <View
            key={it.label}
            style={{ width: "50%", flexDirection: "row", gap: 10, alignItems: "center" }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: it.color + "1A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name={it.icon} size={16} color={it.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: colors.foreground,
                  letterSpacing: -0.4,
                }}
              >
                {it.value}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  color: colors.mutedForeground,
                }}
              >
                {it.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}