import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BarChart, LineChart } from "@/components/Charts";
import { DistrictPicker } from "@/components/DistrictPicker";
import {
  Card,
  EmptyState,
  MetricTile,
  Pill,
  PrimaryButton,
  RiskBadge,
  SectionHeader,
} from "@/components/UI";
import { DISTRICTS, DISTRICT_BY_ID } from "@/constants/districts";
import { SymptomId } from "@/constants/diseases";
import { useApp, type AlertSeverity } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  computeDistrictRisk,
  generateAdminSuggestions,
  reportsToCSV,
} from "@/lib/risk";

type TimeFilter = "24h" | "7d";

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    reports,
    alerts,
    sendAlert,
    liveSimulation,
    setLiveSimulation,
    t,
  } = useApp();
  const { width } = useWindowDimensions();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertDistrict, setAlertDistrict] = useState<string | "all">("all");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertSev, setAlertSev] = useState<AlertSeverity>("medium");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");

  const filteredReports = useMemo(() => {
    const cutoff =
      Date.now() - (timeFilter === "24h" ? 24 : 7 * 24) * 3600_000;
    return reports.filter((r) => r.timestamp >= cutoff);
  }, [reports, timeFilter]);

  const snapshots = useMemo(
    () => DISTRICTS.map((d) => computeDistrictRisk(d, reports)),
    [reports],
  );

  const aiSuggestions = useMemo(
    () => generateAdminSuggestions(snapshots),
    [snapshots],
  );

  const totalReports = filteredReports.length;
  const highZones = snapshots.filter((s) => s.riskLevel === "high").length;
  const usersCount = useMemo(
    () => new Set(filteredReports.map((r) => r.userId)).size,
    [filteredReports],
  );

  const symptomTimeline = useMemo(() => {
    const days: { x: string; y: number }[] = [];
    const now = Date.now();
    const buckets = timeFilter === "24h" ? 24 : 7;
    const stepMs = timeFilter === "24h" ? 3600_000 : 24 * 3600_000;
    for (let i = buckets - 1; i >= 0; i--) {
      const start = now - (i + 1) * stepMs;
      const end = now - i * stepMs;
      const count = reports.filter(
        (r) => r.timestamp >= start && r.timestamp < end,
      ).length;
      const date = new Date(start);
      const label =
        timeFilter === "24h"
          ? `${date.getHours()}:00`
          : `${date.getMonth() + 1}/${date.getDate()}`;
      days.push({ x: label, y: count });
    }
    return days;
  }, [reports, timeFilter]);

  const casesByDistrict = useMemo(() => {
    return snapshots
      .map((s) => ({
        label: s.district.name,
        value: s.recentReports,
        color:
          s.riskLevel === "high"
            ? colors.danger
            : s.riskLevel === "medium"
              ? colors.warning
              : colors.safe,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [snapshots, colors]);

  const recentReports = useMemo(
    () => [...reports].sort((a, b) => b.timestamp - a.timestamp).slice(0, 12),
    [reports],
  );

  const submitAlert = async () => {
    if (!alertMsg.trim()) return;
    await sendAlert({
      districtId: alertDistrict,
      message: alertMsg.trim(),
      severity: alertSev,
    });
    setAlertOpen(false);
    setAlertMsg("");
    setAlertDistrict("all");
    setAlertSev("medium");
  };

  const onExportCSV = async () => {
    const csv = reportsToCSV(filteredReports);
    if (Platform.OS === "web") {
      try {
        const w = globalThis as unknown as {
          document?: Document;
          URL?: typeof URL;
          Blob?: typeof Blob;
          navigator?: { clipboard?: { writeText: (s: string) => Promise<void> } };
        };
        if (w.document && w.URL && w.Blob) {
          const blob = new w.Blob([csv], { type: "text/csv;charset=utf-8" });
          const url = w.URL.createObjectURL(blob);
          const a = w.document.createElement("a");
          a.href = url;
          a.download = `jeevanrakshak-reports-${Date.now()}.csv`;
          w.document.body.appendChild(a);
          a.click();
          w.document.body.removeChild(a);
          w.URL.revokeObjectURL(url);
        } else if (w.navigator?.clipboard) {
          await w.navigator.clipboard.writeText(csv);
        }
      } catch {
        // ignore
      }
    } else {
      try {
        await Share.share({ message: csv, title: "JeevanRakshak reports" });
      } catch {
        Alert.alert("Export", t("csv_exported"));
      }
    }
  };

  const chartWidth = Math.min(width - 64, 720);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 24,
                color: colors.foreground,
                letterSpacing: -0.5,
              }}
            >
              {t("admin_title")}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: colors.mutedForeground,
                marginTop: 4,
              }}
            >
              {t("demo_mode")}
            </Text>
          </View>
          <Pressable
            onPress={() => setAlertOpen((v) => !v)}
            style={({ pressed }) => ({
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              backgroundColor: alertOpen ? colors.secondary : colors.danger,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Feather
              name={alertOpen ? "x" : "alert-triangle"}
              size={14}
              color={alertOpen ? colors.foreground : "#FFFFFF"}
            />
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 13,
                color: alertOpen ? colors.foreground : "#FFFFFF",
              }}
            >
              {alertOpen ? t("cancel") : t("send_alert")}
            </Text>
          </Pressable>
        </View>

        {alertOpen ? (
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader title={t("send_alert")} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: colors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                marginBottom: 6,
              }}
            >
              {t("target_district")}
            </Text>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.secondary,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text
                style={{
                  flex: 1,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                {alertDistrict === "all"
                  ? "All Assam"
                  : DISTRICT_BY_ID[alertDistrict]?.name}
              </Text>
              <Pressable
                onPress={() => setAlertDistrict("all")}
                hitSlop={8}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                  }}
                >
                  All
                </Text>
              </Pressable>
            </Pressable>

            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: colors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              {t("severity")}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["low", "medium", "high"] as AlertSeverity[]).map((sv) => {
                const tone =
                  sv === "high"
                    ? colors.danger
                    : sv === "medium"
                      ? colors.warning
                      : colors.primary;
                const selected = sv === alertSev;
                return (
                  <Pressable
                    key={sv}
                    onPress={() => setAlertSev(sv)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: selected ? tone : colors.secondary,
                      borderWidth: 1,
                      borderColor: selected ? tone : colors.border,
                      alignItems: "center",
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: selected ? "#FFFFFF" : colors.foreground,
                        fontFamily: "Inter_700Bold",
                        fontSize: 12,
                        textTransform: "uppercase",
                      }}
                    >
                      {sv}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                color: colors.mutedForeground,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              {t("alert_message")}
            </Text>
            <TextInput
              value={alertMsg}
              onChangeText={setAlertMsg}
              placeholder="ORS distribution active at Majuli relief camp..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.foreground,
                backgroundColor: colors.card,
                textAlignVertical: "top",
                ...(Platform.OS === "web"
                  ? ({ outlineStyle: "none" } as Record<string, unknown>)
                  : {}),
              }}
            />
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label={t("send_alert")}
                onPress={submitAlert}
                icon="send"
                disabled={!alertMsg.trim()}
              />
            </View>
          </Card>
        ) : null}

        {/* Controls */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          style={{ marginBottom: 12 }}
        >
          <Pill
            label={t("filter_24h")}
            selected={timeFilter === "24h"}
            onPress={() => setTimeFilter("24h")}
            icon="clock"
          />
          <Pill
            label={t("filter_7d")}
            selected={timeFilter === "7d"}
            onPress={() => setTimeFilter("7d")}
            icon="calendar"
          />
          <Pill
            label={liveSimulation ? t("live_on") : t("live_off")}
            selected={liveSimulation}
            onPress={() => setLiveSimulation(!liveSimulation)}
            icon={liveSimulation ? "radio" : "play-circle"}
          />
          <Pill
            label={t("export_csv")}
            selected={false}
            onPress={onExportCSV}
            icon="download"
          />
        </ScrollView>

        {/* Metrics */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 6 }}>
          <MetricTile
            label={t("metric_reports")}
            value={totalReports}
            icon="clipboard"
            tone="primary"
          />
          <MetricTile
            label={t("metric_alerts")}
            value={alerts.length}
            icon="bell"
            tone="warning"
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <MetricTile
            label={t("metric_high_zones")}
            value={highZones}
            icon="alert-triangle"
            tone="danger"
          />
          <MetricTile
            label={t("metric_users")}
            value={usersCount}
            icon="users"
            tone="safe"
          />
        </View>

        <Card style={{ marginBottom: 12 }}>
          <SectionHeader title={t("symptoms_over_time")} />
          <LineChart data={symptomTimeline} width={chartWidth} height={180} />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <SectionHeader title={t("cases_by_district")} />
          <BarChart data={casesByDistrict} width={chartWidth} height={220} />
        </Card>

        {aiSuggestions.length > 0 ? (
          <Card style={{ marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: colors.primary + "1A",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="cpu" size={15} color={colors.primary} />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  color: colors.foreground,
                }}
              >
                {t("ai_suggestions")}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "Inter_700Bold",
                    fontSize: 9,
                    letterSpacing: 0.5,
                  }}
                >
                  {t("new_badge")}
                </Text>
              </View>
            </View>
            {aiSuggestions.map((s, i) => {
              const tone =
                s.tone === "danger"
                  ? colors.danger
                  : s.tone === "warn"
                    ? colors.warning
                    : colors.primary;
              return (
                <Pressable
                  key={s.id}
                  onPress={() =>
                    s.districtId
                      ? router.push(`/district/${s.districtId}`)
                      : undefined
                  }
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    backgroundColor: tone + "10",
                    borderRadius: 10,
                    marginTop: i === 0 ? 0 : 8,
                    borderLeftWidth: 3,
                    borderLeftColor: tone,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Feather
                    name="zap"
                    size={14}
                    color={tone}
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
                    {s.text}
                  </Text>
                  {s.districtId ? (
                    <Feather name="chevron-right" size={16} color={tone} />
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        ) : null}

        <Card>
          <SectionHeader title={t("recent_reports")} />
          {recentReports.length === 0 ? (
            <EmptyState icon="inbox" title={t("no_reports")} />
          ) : (
            recentReports.map((r) => {
              const dist = DISTRICT_BY_ID[r.districtId];
              const ageMin = Math.max(1, Math.round((Date.now() - r.timestamp) / 60000));
              const timeText =
                ageMin < 60
                  ? t("minutes_ago", { n: ageMin })
                  : t("hours_ago", { n: Math.round(ageMin / 60) });
              return (
                <View
                  key={r.id}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      backgroundColor:
                        r.severity === "severe"
                          ? colors.danger + "1A"
                          : r.severity === "moderate"
                            ? colors.warning + "1A"
                            : colors.primary + "1A",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather
                      name="user"
                      size={16}
                      color={
                        r.severity === "severe"
                          ? colors.danger
                          : r.severity === "moderate"
                            ? colors.warning
                            : colors.primary
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 13,
                          color: colors.foreground,
                        }}
                      >
                        {r.userName}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 11,
                          color: colors.mutedForeground,
                        }}
                      >
                        · {dist?.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: colors.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      {r.symptoms.map((s: SymptomId) => t(`sym_${s}`)).join(", ")}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <RiskBadge
                      level={
                        r.severity === "severe"
                          ? "high"
                          : r.severity === "moderate"
                            ? "medium"
                            : "safe"
                      }
                      size="sm"
                      label={t(r.severity)}
                    />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 10,
                        color: colors.mutedForeground,
                      }}
                    >
                      {timeText}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>

      <DistrictPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => setAlertDistrict(id)}
        title={t("target_district")}
      />
    </View>
  );
}