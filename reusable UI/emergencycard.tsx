import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";

import { Card, SectionHeader } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  EMERGENCY_NUMBERS,
  Hospital,
  hospitalsFor,
} from "@/constants/hospitals";
import { DistrictProfile } from "@/constants/districts";

export function EmergencyCard({ district }: { district: DistrictProfile }) {
  const colors = useColors();
  const { t } = useApp();
  const hospitals = hospitalsFor(district.id);

  const call = (num: string) => {
    const sanitized = num.replace(/\s+/g, "");
    if (Platform.OS === "web") {
      Linking.openURL(`tel:${sanitized}`).catch(() => {});
    } else {
      Linking.openURL(`tel:${sanitized}`).catch(() => {});
    }
  };

  return (
    <Card>
      <SectionHeader title={t("emergency_response")} />
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <CallButton
          label="108"
          sub={t("ambulance")}
          color={colors.danger}
          onPress={() => call(EMERGENCY_NUMBERS.ambulance)}
        />
        <CallButton
          label="1077"
          sub={t("disaster_cell")}
          color={colors.warning}
          onPress={() => call(EMERGENCY_NUMBERS.disaster)}
        />
        <CallButton
          label="104"
          sub={t("health_helpline")}
          color={colors.primary}
          onPress={() => call(EMERGENCY_NUMBERS.health)}
        />
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          color: colors.mutedForeground,
          marginBottom: 8,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {t("nearest_hospitals")}
      </Text>
      <View style={{ gap: 8 }}>
        {hospitals.map((h) => (
          <HospitalRow key={h.name} hospital={h} onCall={() => call(h.phone)} />
        ))}
      </View>
      <Pressable
        onPress={() => router.push("/safety")}
        style={({ pressed }) => ({
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: 12,
          borderRadius: 12,
          backgroundColor: colors.primary + "12",
          borderWidth: 1,
          borderColor: colors.primary + "33",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="shield" size={15} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 13,
              color: colors.foreground,
            }}
          >
            {t("open_safety_hub")}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {t("safety_hub_sub")}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </Pressable>
    </Card>
  );
}

function CallButton({
  label,
  sub,
  color,
  onPress,
}: {
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: color,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: "center",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Feather name="phone-call" size={14} color="#FFFFFF" />
      <Text
        style={{
          color: "#FFFFFF",
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          marginTop: 4,
          letterSpacing: -0.3,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          color: "#FFFFFF",
          opacity: 0.92,
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginTop: 2,
        }}
      >
        {sub}
      </Text>
    </Pressable>
  );
}

function HospitalRow({
  hospital,
  onCall,
}: {
  hospital: Hospital;
  onCall: () => void;
}) {
  const colors = useColors();
  const tone =
    hospital.type === "relief_camp"
      ? colors.warning
      : hospital.type === "private"
        ? colors.primary
        : colors.safe;
  const label =
    hospital.type === "relief_camp"
      ? "Relief Camp"
      : hospital.type === "phc"
        ? "PHC"
        : hospital.type === "government"
          ? "Govt."
          : "Private";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
      }}
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
        <Feather name="plus" size={14} color={tone} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            color: colors.foreground,
          }}
        >
          {hospital.name}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            color: colors.mutedForeground,
            marginTop: 2,
          }}
        >
          {label} · {hospital.phone}
        </Text>
      </View>
      <Pressable
        onPress={onCall}
        hitSlop={6}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          opacity: pressed ? 0.85 : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        })}
      >
        <Feather name="phone" size={12} color={colors.primaryForeground} />
        <Text
          style={{
            color: colors.primaryForeground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 12,
          }}
        >
          Call
        </Text>
      </Pressable>
    </View>
  );
}