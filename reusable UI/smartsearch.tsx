import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DISTRICTS } from "@/constants/districts";
import { DISEASE_LIST } from "@/constants/diseases";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Hit = {
  id: string;
  group: "districts" | "diseases" | "safety";
  label: string;
  sub?: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
};

const SAFETY_TOPICS: { id: string; label: string }[] = [
  { id: "flood", label: "Flood safety" },
  { id: "earthquake", label: "Earthquake safety" },
  { id: "animal", label: "Livestock & pets" },
  { id: "disease", label: "Post-flood diseases" },
  { id: "firstaid", label: "First aid kit" },
  { id: "water", label: "Drinking water" },
];

const POPULAR = ["cholera", "kamrup", "flood", "first aid", "dengue"];

export function SmartSearch({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, setDistrictId } = useApp();
  const [q, setQ] = useState("");

  const close = () => {
    setQ("");
    onClose();
  };

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out: Hit[] = [];

    for (const d of DISTRICTS) {
      if (d.name.toLowerCase().includes(query)) {
        out.push({
          id: `d-${d.id}`,
          group: "districts",
          label: d.name,
          sub: `${d.population.toLocaleString()} pop`,
          icon: "map-pin",
          onPress: () => {
            setDistrictId(d.id);
            router.push(`/district/${d.id}`);
            close();
          },
        });
      }
    }

    for (const dis of DISEASE_LIST) {
      const label = t(`disease_${dis.id}`);
      if (
        label.toLowerCase().includes(query) ||
        dis.id.toLowerCase().includes(query)
      ) {
        out.push({
          id: `dx-${dis.id}`,
          group: "diseases",
          label,
          sub: t("safety_disease"),
          icon: "activity",
          onPress: () => {
            router.push(`/safety?topic=disease`);
            close();
          },
        });
      }
    }

    for (const s of SAFETY_TOPICS) {
      if (s.label.toLowerCase().includes(query) || s.id.includes(query)) {
        out.push({
          id: `s-${s.id}`,
          group: "safety",
          label: s.label,
          icon:
            s.id === "flood"
              ? "cloud-rain"
              : s.id === "earthquake"
                ? "alert-octagon"
                : s.id === "animal"
                  ? "feather"
                  : s.id === "firstaid"
                    ? "plus-square"
                    : s.id === "water"
                      ? "droplet"
                      : "shield",
          onPress: () => {
            router.push(`/safety?topic=${s.id}`);
            close();
          },
        });
      }
    }

    return out.slice(0, 30);
  }, [q, t, setDistrictId]);

  const grouped = useMemo(() => {
    const byGroup: Record<Hit["group"], Hit[]> = {
      districts: [],
      diseases: [],
      safety: [],
    };
    for (const h of hits) byGroup[h.group].push(h);
    return byGroup;
  }, [hits]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={close}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 14,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.secondary,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: Platform.OS === "ios" ? 12 : 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              autoFocus
              value={q}
              onChangeText={setQ}
              placeholder={t("search_placeholder")}
              placeholderTextColor={colors.mutedForeground}
              style={{
                flex: 1,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.foreground,
                ...(Platform.OS === "web"
                  ? ({ outlineStyle: "none" } as Record<string, unknown>)
                  : {}),
              }}
            />
            {q.length > 0 ? (
              <Pressable onPress={() => setQ("")} hitSlop={8}>
                <Feather name="x" size={15} color={colors.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
          <Pressable onPress={close} hitSlop={8}>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              {t("close")}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {q.trim().length === 0 ? (
            <View>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 12,
                  letterSpacing: 0.4,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                {t("popular_searches")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {POPULAR.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setQ(p)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: colors.secondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 13,
                        color: colors.foreground,
                      }}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => {
                  router.push("/safety");
                  close();
                }}
                style={({ pressed }) => ({
                  marginTop: 22,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: colors.primary + "12",
                  borderWidth: 1,
                  borderColor: colors.primary + "33",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="shield" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                      color: colors.foreground,
                    }}
                  >
                    {t("open_safety_hub")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: colors.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {t("safety_hub_sub")}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          ) : hits.length === 0 ? (
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: colors.mutedForeground,
                textAlign: "center",
                marginTop: 40,
              }}
            >
              {t("search_no_results")}
            </Text>
          ) : (
            (Object.keys(grouped) as Hit["group"][]).map((g) =>
              grouped[g].length === 0 ? null : (
                <View key={g} style={{ marginBottom: 18 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 11,
                      letterSpacing: 0.5,
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    {t(`search_${g}`)}
                  </Text>
                  {grouped[g].map((h) => (
                    <Pressable
                      key={h.id}
                      onPress={h.onPress}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        backgroundColor: pressed
                          ? colors.secondary
                          : "transparent",
                      })}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: colors.primary + "15",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Feather
                          name={h.icon}
                          size={15}
                          color={colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 14,
                            color: colors.foreground,
                          }}
                        >
                          {h.label}
                        </Text>
                        {h.sub ? (
                          <Text
                            style={{
                              fontFamily: "Inter_500Medium",
                              fontSize: 12,
                              color: colors.mutedForeground,
                              marginTop: 2,
                            }}
                          >
                            {h.sub}
                          </Text>
                        ) : null}
                      </View>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  ))}
                </View>
              ),
            )
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}