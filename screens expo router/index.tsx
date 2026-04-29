import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdvisoryCard } from "@/components/AdvisoryCard";
import { ChatAssistant } from "@/components/ChatAssistant";
import { DisasterTimeline } from "@/components/DisasterTimeline";
import { DistrictPicker } from "@/components/DistrictPicker";
import { EmergencyCard } from "@/components/EmergencyCard";
import { ProgressRing } from "@/components/Charts";
import { SmartSearch } from "@/components/SmartSearch";
import { StoryHero } from "@/components/StoryHero";
import {
  Card,
  EmptyState,
  MetricTile,
  PrimaryButton,
  RiskBadge,
  SectionHeader,
  StatRow,
} from "@/components/UI";
import { DISTRICTS, nearestDistrict } from "@/constants/districts";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { computeDistrictRisk, RiskLevel } from "@/lib/risk";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    user,
    ready,
    district,
    districtId,
    setDistrictId,
    reports,
    alerts,
    online,
    t,
  } = useApp();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user]);

  const snapshot = useMemo(
    () => computeDistrictRisk(district, reports),
    [district, reports],
  );

  const allSnapshots = useMemo(
    () => DISTRICTS.map((d) => computeDistrictRisk(d, reports)),
    [reports],
  );

  const totalReportsToday = useMemo(() => {
    const since = Date.now() - 24 * 3600_000;
    return reports.filter((r) => r.timestamp >= since).length;
  }, [reports]);

  const highRiskCount = useMemo(
    () => allSnapshots.filter((s) => s.riskLevel === "high").length,
    [allSnapshots],
  );

  const totalUsers = useMemo(() => {
    const set = new Set(reports.map((r) => r.userId));
    return set.size;
  }, [reports]);

  const peopleAffected = useMemo(() => {
    const since = Date.now() - 7 * 24 * 3600_000;
    const ids = new Set(
      reports.filter((r) => r.timestamp >= since).map((r) => r.userId),
    );
    return ids.size;
  }, [reports]);

  const outbreaksPredicted = useMemo(
    () => allSnapshots.filter((s) => s.outbreakInDays !== null).length,
    [allSnapshots],
  );

  const spikesCount = useMemo(
    () => allSnapshots.filter((s) => s.spike).length,
    [allSnapshots],
  );

  const recentAlerts = alerts
    .filter((a) => a.districtId === districtId || a.districtId === "all")
    .slice(0, 3);

  const detectLocation = async () => {
    try {
      if (Platform.OS === "web") {
        if (!("geolocation" in navigator)) {
          Alert.alert("Location not available");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const d = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
            setDistrictId(d.id);
          },
          () => {
            const fallback = nearestDistrict(26.18, 91.75);
            setDistrictId(fallback.id);
          },
          { timeout: 5000 },
        );
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const d = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
      setDistrictId(d.id);
    } catch {
      Alert.alert("Could not detect location");
    }
  };

  const riskColor =
    snapshot.riskLevel === "high"
      ? colors.danger
      : snapshot.riskLevel === "medium"
        ? colors.warning
        : colors.safe;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.surfaceDark]}
          style={{
            paddingTop: Platform.OS === "web" ? 26 : insets.top + 14,
            paddingBottom: 24,
            paddingHorizontal: 20,
          }}
        >
          {!online ? <OfflineBanner text={t("offline_banner")} /> : null}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 40, height: 40, borderRadius: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#E0F2F1",
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {t("hello")}
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  letterSpacing: -0.3,
                }}
              >
                {user?.name ?? "Guest"}
              </Text>
            </View>
            <Pressable
              onPress={() => setSearchOpen(true)}
              hitSlop={10}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                width: 36,
                height: 36,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="search" size={15} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={detectLocation}
              hitSlop={10}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Feather name="navigation" size={13} color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 11,
                }}
              >
                GPS
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => ({
              marginTop: 18,
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              opacity: pressed ? 0.85 : 1,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            })}
          >
            <Feather name="map-pin" size={18} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#B7E1DE",
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                {t("your_district")}
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 17,
                  marginTop: 2,
                }}
              >
                {district.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                }}
              >
                {t("change")}
              </Text>
              <Feather name="chevron-right" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
        </LinearGradient>

        <View style={{ padding: 16, gap: 16 }}>
          {/* Storytelling overview */}
          <StoryHero
            affected={peopleAffected}
            highRiskZones={highRiskCount}
            outbreaksPredicted={outbreaksPredicted}
            spikes={spikesCount}
          />

          {/* Risk overview */}
          <Card>
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
                    color: colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  {t("current_risk")}
                </Text>
                <View
                  style={{
                    marginTop: 6,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <RiskBadge
                    level={snapshot.riskLevel}
                    label={t(
                      snapshot.riskLevel === "high"
                        ? "high_risk"
                        : snapshot.riskLevel === "medium"
                          ? "medium_risk"
                          : "safe",
                    )}
                    size="md"
                  />
                  {snapshot.spike ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: colors.danger + "1A",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                      }}
                    >
                      <Feather
                        name="trending-up"
                        size={11}
                        color={colors.danger}
                      />
                      <Text
                        style={{
                          color: colors.danger,
                          fontFamily: "Inter_700Bold",
                          fontSize: 10,
                          letterSpacing: 0.3,
                        }}
                      >
                        {t("trend_up", {
                          n: Math.round((snapshot.trendRatio - 1) * 100),
                        })}
                      </Text>
                    </View>
                  ) : null}
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                    }}
                  >
                    {t("confidence", { n: snapshot.confidence })}
                  </Text>
                </View>
                {snapshot.outbreakInDays !== null ? (
                  <View
                    style={{
                      backgroundColor: colors.danger + "12",
                      borderRadius: 10,
                      padding: 10,
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <Feather
                      name="alert-triangle"
                      size={14}
                      color={colors.danger}
                      style={{ marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 12,
                          color: colors.danger,
                        }}
                      >
                        {t("predicted_outbreak")}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: colors.foreground,
                          marginTop: 2,
                        }}
                      >
                        {t("outbreak_window", { days: snapshot.outbreakInDays })}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: colors.mutedForeground,
                    }}
                  >
                    {t("no_outbreak")}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
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
                icon="wind"
                label={t("humidity")}
                value={`${snapshot.humidity}%`}
                tone={
                  snapshot.humidity > 85
                    ? colors.warning
                    : colors.mutedForeground
                }
              />
              <StatRow
                icon={
                  snapshot.weather === "storm"
                    ? "cloud-lightning"
                    : snapshot.weather === "rainy"
                      ? "cloud-rain"
                      : snapshot.weather === "cloudy"
                        ? "cloud"
                        : "sun"
                }
                label={t("weather")}
                value={t(`w_${snapshot.weather}`)}
                tone={colors.mutedForeground}
              />
            </View>

            <View style={{ marginTop: 14 }}>
              <PrimaryButton
                label={t("quick_report")}
                onPress={() => router.push("/report")}
                icon="plus-circle"
              />
            </View>
          </Card>

          {/* Daily AI advisory */}
          <AdvisoryCard snapshot={snapshot} />

          {/* Live disaster timeline */}
          <DisasterTimeline snapshot={snapshot} />

          {/* Emergency response */}
          <EmergencyCard district={district} />

          {/* Active diseases */}
          <Card>
            <SectionHeader title={t("active_diseases")} />
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {district.activeDiseases.map((d) => (
                <View
                  key={d}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: colors.secondary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Feather name="alert-circle" size={12} color={colors.danger} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: colors.foreground,
                    }}
                  >
                    {t(`disease_${d}`)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Community pulse */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <MetricTile
              label={t("reports_today")}
              value={totalReportsToday}
              icon="activity"
              tone="primary"
            />
            <MetricTile
              label={t("high_risk_zones")}
              value={highRiskCount}
              icon="alert-triangle"
              tone="danger"
            />
            <MetricTile
              label={t("total_users")}
              value={totalUsers}
              icon="users"
              tone="safe"
            />
          </View>

          {/* Alerts */}
          <Card>
            <SectionHeader
              title={t("recent_alerts")}
              action={
                <Pressable onPress={() => router.push("/admin")}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                    }}
                  >
                    {t("details")}
                  </Text>
                </Pressable>
              }
            />
            {recentAlerts.length === 0 ? (
              <EmptyState
                icon="bell-off"
                title={t("no_alerts")}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {recentAlerts.map((a) => (
                  <AlertRow key={a.id} alert={a} />
                ))}
              </View>
            )}
          </Card>

          {/* High risk districts shortcut */}
          <Card>
            <SectionHeader title={t("high_risk_zones")} />
            <View style={{ gap: 8 }}>
              {allSnapshots
                .filter((s) => s.riskLevel === "high")
                .slice(0, 5)
                .map((s) => (
                  <Pressable
                    key={s.district.id}
                    onPress={() => router.push(`/district/${s.district.id}`)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      gap: 10,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        backgroundColor: colors.danger + "1A",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="alert-octagon" size={16} color={colors.danger} />
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
                        }}
                      >
                        {s.recentReports} reports · {t(`disease_${s.topDisease ?? "diarrhea"}`)}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        color: colors.danger,
                        fontSize: 14,
                      }}
                    >
                      {s.riskScore}
                    </Text>
                  </Pressable>
                ))}
              {allSnapshots.filter((s) => s.riskLevel === "high").length === 0 ? (
                <EmptyState icon="check-circle" title="All zones safe" />
              ) : null}
            </View>
          </Card>
        </View>
      </ScrollView>

      <DistrictPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => setDistrictId(id)}
        title={t("select_district")}
      />

      <SmartSearch
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <ChatAssistant />
    </View>
  );
}

function AlertRow({
  alert,
}: {
  alert: { id: string; severity: RiskLevel | "low" | "medium" | "high"; message: string; districtId: string };
}) {
  const colors = useColors();
  const { t } = useApp();
  const sev = alert.severity;
  const tone =
    sev === "high" ? colors.danger : sev === "medium" ? colors.warning : colors.primary;
  const districtName =
    alert.districtId === "all"
      ? "All Assam"
      : DISTRICTS.find((d) => d.id === alert.districtId)?.name ?? alert.districtId;
  return (
    <View
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
      <View style={{ flex: 1 }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}
        >
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: colors.mutedForeground,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {districtName}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 13,
            color: colors.foreground,
            lineHeight: 18,
          }}
        >
          {alert.message}
        </Text>
      </View>
    </View>
  );
}

function OfflineBanner({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.25)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 14,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Feather name="wifi-off" size={13} color="#FFFFFF" />
      <Text
        style={{
          color: "#FFFFFF",
          fontFamily: "Inter_500Medium",
          fontSize: 12,
        }}
      >
        {text}
      </Text>
    </View>
  );
}