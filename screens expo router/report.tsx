import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DistrictPicker } from "@/components/DistrictPicker";
import {
  Card,
  PrimaryButton,
  SectionHeader,
} from "@/components/UI";
import { DISTRICT_BY_ID } from "@/constants/districts";
import { SYMPTOMS, SymptomId } from "@/constants/diseases";
import { useApp, type Severity } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { recommendForReport } from "@/lib/risk";

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { districtId, submitReport, reportUnsafeWater, t } = useApp();

  const [picked, setPicked] = useState(districtId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [severity, setSeverity] = useState<Severity>("mild");
  const [waterFlagged, setWaterFlagged] = useState(false);
  const [submitted, setSubmitted] = useState<{
    disease: string | null;
    tips: string[];
  } | null>(null);

  const flagWater = async () => {
    await reportUnsafeWater({
      districtId: picked,
      note: "Quick-flagged from report screen",
    });
    setWaterFlagged(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    setTimeout(() => setWaterFlagged(false), 3000);
  };

  const district = DISTRICT_BY_ID[picked];

  const toggleSymptom = (id: SymptomId) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const onSubmit = async () => {
    if (symptoms.length === 0) return;
    await submitReport({ symptoms, severity, districtId: picked });
    const rec = recommendForReport(symptoms, district, severity);
    setSubmitted({
      disease: rec.disease ? t(`disease_${rec.disease}`) : null,
      tips: rec.tips,
    });
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  };

  const reset = () => {
    setSymptoms([]);
    setSeverity("mild");
    setSubmitted(null);
  };

  const severityOptions: {
    id: Severity;
    label: string;
    color: string;
  }[] = useMemo(
    () => [
      { id: "mild", label: t("mild"), color: colors.safe },
      { id: "moderate", label: t("moderate"), color: colors.warning },
      { id: "severe", label: t("severe"), color: colors.danger },
    ],
    [t, colors],
  );

  if (submitted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 100,
          }}
        >
          <Card padding={20} style={{ alignItems: "center" }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                backgroundColor: colors.safe + "1A",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Feather name="check-circle" size={36} color={colors.safe} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 20,
                color: colors.foreground,
                letterSpacing: -0.4,
              }}
            >
              {t("report_sent")}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: colors.mutedForeground,
                textAlign: "center",
                marginTop: 6,
                lineHeight: 19,
              }}
            >
              {t("report_thanks")}
            </Text>
          </Card>

          {submitted.disease ? (
            <Card style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {t("recommendation")}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: colors.foreground,
                  marginTop: 4,
                  marginBottom: 10,
                }}
              >
                {submitted.disease}
              </Text>
              {submitted.tips.map((tip, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Feather
                    name="check"
                    size={15}
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
            </Card>
          ) : null}

          <View style={{ marginTop: 16, gap: 10 }}>
            <PrimaryButton
              label="View district risk"
              onPress={() => router.push(`/district/${picked}`)}
              icon="map"
            />
            <PrimaryButton
              label="Submit another"
              onPress={reset}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              color: colors.foreground,
              letterSpacing: -0.5,
            }}
          >
            {t("report_title")}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: colors.mutedForeground,
              marginTop: 4,
            }}
          >
            {t("report_subtitle")}
          </Text>
        </View>

        <Card>
          <SectionHeader title={t("select_district")} />
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 12,
              paddingHorizontal: 14,
              backgroundColor: colors.secondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text
              style={{
                flex: 1,
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: colors.foreground,
              }}
            >
              {district?.name}
            </Text>
            <Feather
              name="chevron-down"
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <SectionHeader title={t("select_symptoms")} />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {SYMPTOMS.map((s) => {
              const selected = symptoms.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => toggleSymptom(s.id)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 999,
                    backgroundColor: selected ? colors.primary : colors.secondary,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Feather
                    name={s.icon as keyof typeof Feather.glyphMap}
                    size={14}
                    color={selected ? "#FFFFFF" : colors.foreground}
                  />
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                    }}
                  >
                    {t(`sym_${s.id}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <SectionHeader title={t("severity")} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {severityOptions.map((opt) => {
              const selected = opt.id === severity;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSeverity(opt.id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: selected ? opt.color : colors.secondary,
                    borderWidth: 1,
                    borderColor: selected ? opt.color : colors.border,
                    alignItems: "center",
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : colors.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 13,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Pressable
            onPress={flagWater}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: waterFlagged
                  ? colors.safe + "1A"
                  : colors.warning + "1A",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                name={waterFlagged ? "check-circle" : "droplet"}
                size={20}
                color={waterFlagged ? colors.safe : colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                {waterFlagged ? t("water_reported") : t("unsafe_water")}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: colors.mutedForeground,
                  marginTop: 2,
                }}
              >
                {t("unsafe_water_sub")}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </Card>

        <View style={{ marginTop: 18 }}>
          <PrimaryButton
            label={t("submit_report")}
            onPress={onSubmit}
            icon="send"
            size="lg"
            disabled={symptoms.length === 0}
          />
          {symptoms.length === 0 ? (
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                color: colors.mutedForeground,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {t("pick_at_least_one")}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <DistrictPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setPicked}
        title={t("select_district")}
      />
    </View>
  );
}