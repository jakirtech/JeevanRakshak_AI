import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { Card, SectionHeader } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  DistrictRiskSnapshot,
  generateAdvisory,
} from "@/lib/risk";

export function AdvisoryCard({
  snapshot,
}: {
  snapshot: DistrictRiskSnapshot;
}) {
  const colors = useColors();
  const { t } = useApp();
  const advisory = generateAdvisory(snapshot);
  const tone =
    snapshot.riskLevel === "high"
      ? colors.danger
      : snapshot.riskLevel === "medium"
        ? colors.warning
        : colors.safe;
  return (
    <Card>
      <SectionHeader title={t("daily_advisory")} />
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: tone + "1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="shield" size={18} color={tone} />
        </View>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 15,
            color: colors.foreground,
            flex: 1,
          }}
        >
          {advisory.headline}
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        {advisory.tips.map((tip, idx) => (
          <View
            key={idx}
            style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}
          >
            <Feather
              name="check-circle"
              size={14}
              color={colors.primary}
              style={{ marginTop: 2 }}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: colors.foreground,
                lineHeight: 19,
              }}
            >
              {tip}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: "row",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <Feather
          name="alert-circle"
          size={13}
          color={colors.mutedForeground}
          style={{ marginTop: 2 }}
        />
        <Text
          style={{
            flex: 1,
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            color: colors.mutedForeground,
            lineHeight: 16,
          }}
        >
          {t("safety_disclaimer")}
        </Text>
      </View>
    </Card>
  );
}