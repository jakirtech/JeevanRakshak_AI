import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DistrictPicker } from "@/components/DistrictPicker";
import { PrimaryButton } from "@/components/UI";
import { DISTRICT_BY_ID } from "@/constants/districts";
import { LANGUAGE_LABELS, Language } from "@/constants/translations";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn, language, setLanguage, t, districtId } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [picked, setPicked] = useState(districtId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const district = DISTRICT_BY_ID[picked];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t("please_enter_name"));
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      Alert.alert(t("please_enter_phone"));
      return;
    }
    await signIn({ name: name.trim(), phone: digits, districtId: picked });
    router.replace("/");
  };

  const handleGuest = async () => {
    await signIn({ name: "Guest", phone: "0000000000", districtId: picked });
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.primary, colors.surfaceDark]}
        style={{
          paddingTop: Platform.OS === "web" ? 28 : insets.top + 18,
          paddingBottom: 36,
          paddingHorizontal: 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 56, height: 56, borderRadius: 14 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "Inter_700Bold",
                fontSize: 22,
                letterSpacing: -0.5,
              }}
            >
              {t("app_name")}
            </Text>
            <Text
              style={{
                color: "#E0F2F1",
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {t("tagline")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 36,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 22,
            color: colors.foreground,
            letterSpacing: -0.5,
          }}
        >
          {t("welcome")}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: colors.mutedForeground,
            marginTop: 6,
            lineHeight: 20,
          }}
        >
          {t("login_subtitle")}
        </Text>

        <View style={{ marginTop: 24, gap: 14 }}>
          <Field
            label={t("full_name")}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Aruna Hazarika"
            icon="user"
          />
          <Field
            label={t("phone_number")}
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            icon="phone"
            keyboardType="number-pad"
          />

          <View>
            <Label text={t("district")} />
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Feather name="map-pin" size={16} color={colors.primary} />
              <Text
                style={{
                  flex: 1,
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                }}
              >
                {district?.name ?? t("select_district")}
              </Text>
              <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View>
            <Label text={t("language")} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lng) => {
                const selected = lng === language;
                return (
                  <Pressable
                    key={lng}
                    onPress={() => setLanguage(lng)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: selected ? colors.primary : colors.secondary,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      alignItems: "center",
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: selected ? "#FFFFFF" : colors.foreground,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 13,
                      }}
                    >
                      {LANGUAGE_LABELS[lng]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ marginTop: 28, gap: 10 }}>
          <PrimaryButton
            label={t("continue")}
            onPress={handleSubmit}
            icon="arrow-right"
            size="lg"
          />
          <PrimaryButton
            label={t("continue_guest")}
            onPress={handleGuest}
            variant="ghost"
          />
        </View>

        <View
          style={{
            marginTop: 28,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Feather name="info" size={16} color={colors.primary} />
          <Text
            style={{
              flex: 1,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.mutedForeground,
              lineHeight: 18,
            }}
          >
            JeevanRakshak runs fully on your device. No personal data leaves
            your phone in this demo build.
          </Text>
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

function Label({ text }: { text: string }) {
  const colors = useColors();
  return (
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
      {text}
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  icon: keyof typeof Feather.glyphMap;
  keyboardType?: "default" | "number-pad";
}) {
  const colors = useColors();
  return (
    <View>
      <Label text={label} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === "ios" ? 14 : 6,
        }}
      >
        <Feather name={icon} size={16} color={colors.primary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType ?? "default"}
          style={{
            flex: 1,
            color: colors.foreground,
            fontFamily: "Inter_500Medium",
            fontSize: 15,
            ...(Platform.OS === "web"
              ? ({ outlineStyle: "none" } as Record<string, unknown>)
              : {}),
          }}
          autoCorrect={false}
          autoCapitalize={icon === "user" ? "words" : "none"}
        />
      </View>
    </View>
  );
}

const _styles = StyleSheet.create({});