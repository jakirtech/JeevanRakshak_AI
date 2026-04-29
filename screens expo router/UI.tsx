import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import type { RiskLevel } from "@/lib/risk";

export function RiskBadge({
  level,
  size = "md",
  label,
}: {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  label: string;
}) {
  const colors = useColors();
  const map = {
    safe: { bg: colors.safe, fg: "#FFFFFF" },
    medium: { bg: colors.warning, fg: "#1a1a1a" },
    high: { bg: colors.danger, fg: "#FFFFFF" },
  };
  const tone = map[level];
  const sizes = {
    sm: { padV: 4, padH: 8, fs: 11, dot: 6 },
    md: { padV: 6, padH: 10, fs: 12, dot: 7 },
    lg: { padV: 8, padH: 14, fs: 14, dot: 9 },
  }[size];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: tone.bg,
        paddingVertical: sizes.padV,
        paddingHorizontal: sizes.padH,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <View
        style={{
          width: sizes.dot,
          height: sizes.dot,
          borderRadius: 999,
          backgroundColor: tone.fg,
          opacity: 0.95,
        }}
      />
      <Text
        style={{
          color: tone.fg,
          fontFamily: "Inter_600SemiBold",
          fontSize: sizes.fs,
          letterSpacing: 0.2,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export function Card({
  children,
  style,
  padding = 16,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          padding,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === "ios" ? 0.04 : 0.08,
          shadowRadius: 6,
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 17,
          color: colors.foreground,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {action}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading,
  disabled,
  variant = "primary",
  size = "md",
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const colors = useColors();
  const styles = {
    primary: { bg: colors.primary, fg: colors.primaryForeground },
    secondary: { bg: colors.secondary, fg: colors.foreground },
    danger: { bg: colors.danger, fg: "#FFFFFF" },
    ghost: { bg: "transparent", fg: colors.primary },
  }[variant];
  const sz = {
    sm: { padV: 8, padH: 14, fs: 13, ic: 14 },
    md: { padV: 12, padH: 18, fs: 15, ic: 16 },
    lg: { padV: 16, padH: 22, fs: 17, ic: 18 },
  }[size];
  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {},
          );
        }
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: styles.bg,
        paddingVertical: sz.padV,
        paddingHorizontal: sz.padH,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: colors.border,
      })}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={styles.fg} size="small" />
      ) : (
        <>
          {icon ? (
            <Feather name={icon} size={sz.ic} color={styles.fg} />
          ) : null}
          <Text
            style={{
              color: styles.fg,
              fontFamily: "Inter_600SemiBold",
              fontSize: sz.fs,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function MetricTile({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  tone?: "primary" | "danger" | "warning" | "safe";
}) {
  const colors = useColors();
  const toneColor = {
    primary: colors.primary,
    danger: colors.danger,
    warning: colors.warning,
    safe: colors.safe,
  }[tone];
  return (
    <Card style={{ flex: 1, minWidth: 0 }} padding={14}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: toneColor + "1A",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Feather name={icon} size={18} color={toneColor} />
      </View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 22,
          color: colors.foreground,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 12,
          color: colors.mutedForeground,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Card>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const colors = useColors();
  return (
    <View
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

export function StatRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tone?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: (tone ?? colors.primary) + "1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={icon} size={15} color={tone ?? colors.primary} />
        </View>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            color: colors.mutedForeground,
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          color: colors.foreground,
          fontSize: 15,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 32,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: colors.secondary,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Feather name={icon} size={24} color={colors.mutedForeground} />
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 15,
          color: colors.foreground,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: colors.mutedForeground,
            textAlign: "center",
            marginTop: 6,
            maxWidth: 280,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: selected ? colors.primary : colors.secondary,
        opacity: pressed ? 0.85 : 1,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
      })}
    >
      {icon ? (
        <Feather
          name={icon}
          size={13}
          color={selected ? colors.primaryForeground : colors.foreground}
        />
      ) : null}
      <Text
        style={{
          color: selected ? colors.primaryForeground : colors.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}