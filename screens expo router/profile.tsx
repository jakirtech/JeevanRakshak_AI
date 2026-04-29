import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DistrictPicker } from "@/components/DistrictPicker";
import { Card, PrimaryButton, SectionHeader } from "@/components/UI";
import { DISTRICTS } from "@/constants/districts";
import { LANGUAGE_LABELS, Language } from "@/constants/translations";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    user,
    district,
    setDistrictId,
    language,
    setLanguage,
    signOut,
    loadSampleData,
    resetUserData,
    online,
    toggleOffline,
    userReports,
    themeMode,
    setThemeMode,
    liveSimulation,
    setLiveSimulation,
    t,
  } = useApp();

  const [pickerOpen, setPickerOpen] = useState(false);

  const onLoadSample = async () => {
    await loadSampleData();
    Alert.alert(t("load_sample_done"));
  };
  const onReset = async () => {
    await resetUserData();
    Alert.alert(t("reset_done"));
  };
  const onSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
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
            {t("profile")}
          </Text>
        </View>

        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Inter_700Bold",
                  fontSize: 22,
                }}
              >
                {(user?.name ?? "G").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: colors.foreground,
                  letterSpacing: -0.3,
                }}
              >
                {user?.name ?? "Guest"}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: colors.mutedForeground,
                  marginTop: 2,
                }}
              >
                {user?.phone ? `+91 ${user.phone}` : "Demo session"}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: colors.mutedForeground,
                  marginTop: 2,
                }}
              >
                {userReports.length} reports submitted
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("health_history")} />
          <Card>
            {userReports.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 18,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: colors.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name="file-text"
                    size={18}
                    color={colors.mutedForeground}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: colors.mutedForeground,
                  }}
                >
                  {t("no_history")}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                {userReports
                  .slice()
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 5)
                  .map((r, i) => {
                    const tone =
                      r.severity === "severe"
                        ? colors.danger
                        : r.severity === "moderate"
                          ? colors.warning
                          : colors.safe;
                    const ageH = Math.max(
                      1,
                      Math.round((Date.now() - r.timestamp) / 3600_000),
                    );
                    const when =
                      ageH < 24
                        ? `${ageH}h ago`
                        : `${Math.round(ageH / 24)}d ago`;
                    const districtName =
                      DISTRICTS.find((d) => d.id === r.districtId)?.name ?? "—";
                    return (
                      <View
                        key={r.id}
                        style={{
                          flexDirection: "row",
                          gap: 12,
                          paddingVertical: 10,
                          borderTopWidth:
                            i === 0 ? 0 : StyleSheet.hairlineWidth,
                          borderTopColor: colors.border,
                          alignItems: "flex-start",
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
                          <Feather name="activity" size={15} color={tone} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: "Inter_700Bold",
                              fontSize: 13,
                              color: colors.foreground,
                            }}
                          >
                            {r.symptoms
                              .slice(0, 3)
                              .map((s) => t(`sym_${s}`))
                              .join(" · ")}
                            {r.symptoms.length > 3
                              ? ` +${r.symptoms.length - 3}`
                              : ""}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: "Inter_500Medium",
                              fontSize: 11,
                              color: colors.mutedForeground,
                              marginTop: 2,
                            }}
                          >
                            {districtName} · {when}
                          </Text>
                        </View>
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor: tone + "1A",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Inter_700Bold",
                              fontSize: 10,
                              color: tone,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                            }}
                          >
                            {r.severity}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}
          </Card>
        </View>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("language_setting")} />
          <Card padding={6}>
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lng, i) => {
              const selected = lng === language;
              return (
                <Pressable
                  key={lng}
                  onPress={() => setLanguage(lng)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    gap: 10,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: colors.secondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name="globe" size={15} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.foreground,
                    }}
                  >
                    {LANGUAGE_LABELS[lng]}
                  </Text>
                  {selected ? (
                    <Feather name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        </View>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("appearance")} />
          <Card padding={6}>
            {(["system", "light", "dark"] as const).map((m, i) => {
              const selected = themeMode === m;
              const labels: Record<typeof m, string> = {
                system: t("theme_system"),
                light: t("theme_light"),
                dark: t("theme_dark"),
              };
              const icons: Record<typeof m, keyof typeof Feather.glyphMap> = {
                system: "smartphone",
                light: "sun",
                dark: "moon",
              };
              return (
                <Pressable
                  key={m}
                  onPress={() => setThemeMode(m)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    gap: 10,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: colors.secondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name={icons[m]} size={15} color={colors.primary} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.foreground,
                    }}
                  >
                    {labels[m]}
                  </Text>
                  {selected ? (
                    <Feather name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        </View>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("account")} />
          <Card padding={6}>
            <RowAction
              icon="map-pin"
              label={t("district")}
              value={district.name}
              onPress={() => setPickerOpen(true)}
            />
            <RowAction
              icon={online ? "wifi" : "wifi-off"}
              label={t("demo_mode")}
              value={online ? "Online" : "Offline"}
              onPress={toggleOffline}
            />
            <RowAction
              icon={liveSimulation ? "radio" : "play-circle"}
              label={t("live_simulation")}
              value={liveSimulation ? t("live_on") : t("live_off")}
              onPress={() => setLiveSimulation(!liveSimulation)}
            />
          </Card>
        </View>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("data")} />
          <Card padding={6}>
            <RowAction
              icon="database"
              label={t("load_sample")}
              onPress={onLoadSample}
            />
            <RowAction
              icon="trash-2"
              label={t("reset_data")}
              onPress={onReset}
              danger
            />
          </Card>
        </View>

        <View style={{ marginTop: 16 }}>
          <SectionHeader title={t("about")} />
          <Card>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: colors.mutedForeground,
                lineHeight: 19,
              }}
            >
              {t("about_text")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <Tag label="Assam · 35 districts" />
              <Tag label="3 languages" />
              <Tag label="On-device AI" />
              <Tag label="Demo build" />
            </View>
          </Card>
        </View>

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label={t("logout")}
            onPress={onSignOut}
            variant="danger"
            icon="log-out"
          />
        </View>
      </ScrollView>

      <DistrictPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => setDistrictId(id)}
      />
    </View>
  );
}

function RowAction({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  const tone = danger ? colors.danger : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        gap: 10,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: tone + "1A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={15} color={tone} />
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
          color: danger ? colors.danger : colors.foreground,
        }}
      >
        {label}
      </Text>
      {value ? (
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 13,
            color: colors.mutedForeground,
            marginRight: 4,
          }}
        >
          {value}
        </Text>
      ) : null}
      <Feather
        name="chevron-right"
        size={16}
        color={colors.mutedForeground}
      />
    </Pressable>
  );
}

function Tag({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          color: colors.foreground,
        }}
      >
        {label}
      </Text>
    </View>
  );
}