import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DISTRICTS } from "@/constants/districts";
import { useColors } from "@/hooks/useColors";

export function DistrictPicker({
  visible,
  onClose,
  onSelect,
  title = "Select district",
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  title?: string;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...DISTRICTS].sort((a, b) => a.name.localeCompare(b.name));
    if (!needle) return list;
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(needle) ||
        d.hq.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "formSheet" : "pageSheet"}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 16 : insets.top,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 17,
              color: colors.foreground,
            }}
          >
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.secondary,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: Platform.OS === "ios" ? 10 : 4,
            }}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search districts"
              placeholderTextColor={colors.mutedForeground}
              style={{
                flex: 1,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: colors.foreground,
              }}
              autoCorrect={false}
            />
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.border,
              }}
            />
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
              style={({ pressed }) => ({
                paddingVertical: 14,
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              })}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                    color: colors.foreground,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  HQ {item.hq} ·{" "}
                  {item.floodProneLevel === "high"
                    ? "Flood-prone"
                    : item.floodProneLevel === "medium"
                      ? "Moderate flood risk"
                      : "Low flood risk"}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}