import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/UI";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type TopicId =
  | "flood"
  | "earthquake"
  | "animal"
  | "disease"
  | "firstaid"
  | "water";

type Topic = {
  id: TopicId;
  icon: keyof typeof Feather.glyphMap;
  color: (c: ReturnType<typeof useColors>) => string;
  titleKey: string;
  before: string[];
  during: string[];
  after: string[];
};

const TOPICS_BUILDER = (): Topic[] => [
  {
    id: "flood",
    icon: "cloud-rain",
    color: (c) => c.waterBlue,
    titleKey: "safety_flood",
    before: [
      "Keep important documents in a waterproof bag.",
      "Charge phones, torches, and powerbanks.",
      "Stock 3 days of drinking water and dry food.",
      "Identify the nearest relief shelter and route.",
    ],
    during: [
      "Move to higher ground immediately if water enters.",
      "Never walk or drive through flowing flood water.",
      "Switch off electricity at the main breaker.",
      "Avoid contact with snakes, leeches, and live wires.",
    ],
    after: [
      "Drink only boiled or chlorine-treated water.",
      "Wash hands before food and after toilet.",
      "Report symptoms in the app to alert neighbors.",
      "Do not re-enter damaged buildings without inspection.",
    ],
  },
  {
    id: "earthquake",
    icon: "alert-octagon",
    color: (c) => c.warning,
    titleKey: "safety_earthquake",
    before: [
      "Secure heavy furniture and water heaters to the wall.",
      "Identify safe spots: under sturdy tables, away from glass.",
      "Practice DROP, COVER and HOLD with your family.",
      "Keep an emergency kit near the exit.",
    ],
    during: [
      "DROP to the ground, take COVER, HOLD on.",
      "Stay away from windows, mirrors, and tall furniture.",
      "If outside, move to an open area away from buildings.",
      "If in a vehicle, stop in a clear spot and wait.",
    ],
    after: [
      "Expect aftershocks. Stay alert for 24–72 hours.",
      "Check for gas leaks before lighting a flame.",
      "Help injured neighbors and call 108 if serious.",
      "Listen to official radio for instructions.",
    ],
  },
  {
    id: "animal",
    icon: "feather",
    color: (c) => c.safe,
    titleKey: "safety_animal",
    before: [
      "Tag livestock with owner name and village.",
      "Stockpile dry fodder on raised platforms.",
      "Vaccinate cattle against haemorrhagic septicaemia.",
      "Identify a higher-ground community shelter for animals.",
    ],
    during: [
      "Move animals to elevated ground early — do not wait.",
      "Untie tethered animals so they can swim if needed.",
      "Keep poultry in raised, ventilated cages.",
      "Do not let pets drink standing flood water.",
    ],
    after: [
      "Disinfect sheds with bleach + water (1:9).",
      "Isolate sick animals — call the vet helpline 1962.",
      "Burn or bury carcasses away from water sources.",
      "Spray for mosquitoes around animal shelters.",
    ],
  },
  {
    id: "disease",
    icon: "activity",
    color: (c) => c.danger,
    titleKey: "safety_disease",
    before: [
      "Boil drinking water for at least 1 minute.",
      "Use ORS at the first sign of diarrhea or vomiting.",
      "Use mosquito nets, especially for children.",
      "Keep a first-aid kit with paracetamol and ORS.",
    ],
    during: [
      "Watch for fever, jaundice, severe diarrhea, vomiting.",
      "Isolate sick family members in a separate room.",
      "Hydrate continuously — small sips of ORS or rice water.",
      "Visit the nearest PHC for fever lasting > 48 hours.",
    ],
    after: [
      "Complete any prescribed antibiotic course.",
      "Disinfect kitchen surfaces and water containers.",
      "Cover all stagnant water to break mosquito breeding.",
      "Report new cases on the app to help your community.",
    ],
  },
  {
    id: "firstaid",
    icon: "plus-square",
    color: (c) => c.danger,
    titleKey: "safety_firstaid",
    before: [
      "ORS sachets (4–6 packets per family).",
      "Paracetamol, antiseptic cream, bandages, gauze.",
      "Chlorine tablets for water purification.",
      "Mosquito repellent and a sturdy torch.",
    ],
    during: [
      "Cuts: wash with clean water, apply antiseptic, bandage.",
      "Snake bite: keep limb still, do NOT cut or suck the wound.",
      "Burns: cool with running water for 10 minutes.",
      "Drowning: clear airway, give CPR, call 108 immediately.",
    ],
    after: [
      "Watch wound sites for redness, pus, or fever.",
      "Replace anything you used — keep the kit ready.",
      "Note who needs follow-up care at the next health camp.",
      "Document injuries with photos for medical records.",
    ],
  },
  {
    id: "water",
    icon: "droplet",
    color: (c) => c.waterBlue,
    titleKey: "safety_water",
    before: [
      "Store water in covered, food-grade containers.",
      "Identify two backup sources (handpump, bottled).",
      "Keep chlorine tablets or boiling fuel handy.",
      "Test the well or borewell before the monsoon.",
    ],
    during: [
      "Boil all drinking water for at least 1 minute.",
      "Or treat with 1 chlorine tablet per 20 litres (wait 30 min).",
      "Do not use river or pond water — even for cooking.",
      "Cover containers tightly to prevent contamination.",
    ],
    after: [
      "Disinfect wells: 25 g bleaching powder per 1000 litres.",
      "Replace handpump platforms damaged by flood.",
      "Flag any unsafe source on the app — protect your village.",
      "Have water tested at the nearest PHE office.",
    ],
  },
];

export default function SafetyHubScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const params = useLocalSearchParams<{ topic?: string }>();
  const topics = useMemo(TOPICS_BUILDER, []);

  const initial =
    (topics.find((tt) => tt.id === params.topic)?.id as TopicId) ?? "flood";
  const [active, setActive] = useState<TopicId>(initial);

  const topic = topics.find((tt) => tt.id === active) ?? topics[0];
  const tone = topic.color(colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 14,
          paddingBottom: 12,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.secondary,
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 18,
              color: colors.foreground,
              letterSpacing: -0.3,
            }}
          >
            {t("safety_hub")}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 1,
            }}
          >
            {t("safety_hub_sub")}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingVertical: 12,
          gap: 8,
        }}
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {topics.map((tt) => {
          const selected = tt.id === active;
          const ttone = tt.color(colors);
          return (
            <Pressable
              key={tt.id}
              onPress={() => setActive(tt.id)}
              style={({ pressed }) => ({
                flexDirection: "row",
                gap: 6,
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: selected ? ttone : colors.secondary,
                borderWidth: 1,
                borderColor: selected ? ttone : colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Feather
                name={tt.icon}
                size={14}
                color={selected ? "#FFFFFF" : ttone}
              />
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 12,
                  color: selected ? "#FFFFFF" : colors.foreground,
                }}
              >
                {t(tt.titleKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 32,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: tone + "12",
            padding: 14,
            borderRadius: 14,
            borderLeftWidth: 4,
            borderLeftColor: tone,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: tone,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name={topic.icon} size={20} color="#FFFFFF" />
          </View>
          <Text
            style={{
              flex: 1,
              fontFamily: "Inter_700Bold",
              fontSize: 16,
              color: colors.foreground,
              letterSpacing: -0.2,
            }}
          >
            {t(topic.titleKey)}
          </Text>
        </View>

        <SafetySection title="Before" items={topic.before} tone={tone} icon="check-circle" />
        <SafetySection title="During" items={topic.during} tone={colors.warning} icon="alert-triangle" />
        <SafetySection title="After" items={topic.after} tone={colors.safe} icon="shield" />

        <View
          style={{
            backgroundColor: colors.danger + "12",
            borderLeftWidth: 4,
            borderLeftColor: colors.danger,
            padding: 12,
            borderRadius: 10,
            flexDirection: "row",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <Feather
            name="alert-circle"
            size={16}
            color={colors.danger}
            style={{ marginTop: 1 }}
          />
          <Text
            style={{
              flex: 1,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: colors.foreground,
              lineHeight: 18,
            }}
          >
            {t("safety_disclaimer")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SafetySection({
  title,
  items,
  tone,
  icon,
}: {
  title: string;
  items: string[];
  tone: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <Card>
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
            width: 26,
            height: 26,
            borderRadius: 8,
            backgroundColor: tone + "1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={icon} size={14} color={tone} />
        </View>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 13,
            color: colors.foreground,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      </View>
      {items.map((line, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 10,
            paddingVertical: 6,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              backgroundColor: tone + "1A",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 10,
                color: tone,
              }}
            >
              {i + 1}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: colors.foreground,
              lineHeight: 19,
            }}
          >
            {line}
          </Text>
        </View>
      ))}
    </Card>
  );
}