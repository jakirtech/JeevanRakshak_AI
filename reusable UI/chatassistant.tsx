import { Feather } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
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

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Msg = { id: string; from: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "What should I do for diarrhea?",
  "How to prevent dengue?",
  "Is the water safe to drink?",
  "Where is the nearest hospital?",
  "Symptoms of cholera?",
];

function answerFor(question: string): string {
  const q = question.toLowerCase();
  if (/diarr|loose|stool|stomach/.test(q)) {
    return "Start ORS sips every 5 minutes. Avoid solid food for 4 hours. If blood in stool, weakness or no urine for 6+ hours — go to the nearest PHC or call 108 immediately.";
  }
  if (/dengue|mosquito|mosq/.test(q)) {
    return "Empty all standing water around home weekly. Wear long sleeves at dawn/dusk. For high fever + body ache + rash — get a dengue NS1 test within 3 days.";
  }
  if (/water|drink|safe/.test(q)) {
    return "Boil water for 1 full minute (longer if cloudy) or use chlorine tablets. Avoid roadside ice and cut fruits during floods.";
  }
  if (/hospital|clinic|phc|emergency|108|107|104/.test(q)) {
    return "Open the Home tab → Emergency card to see nearby hospitals and call 108 (ambulance), 1077 (disaster), or 104 (health helpline).";
  }
  if (/cholera/.test(q)) {
    return "Cholera = sudden watery diarrhea + vomiting + dehydration. ORS at home, then go to a PHC within 4 hours. Boil all drinking water in your area.";
  }
  if (/fever/.test(q)) {
    return "Paracetamol 500mg every 6 hours for adults, hydrate. If fever > 102°F for 3 days, severe headache or rash — visit a clinic and report your symptoms in this app.";
  }
  if (/jaundice/.test(q)) {
    return "Yellow eyes/urine = possible Hepatitis A or E (common after floods). Avoid fatty food, no alcohol, see a doctor for liver function tests.";
  }
  if (/typhoid/.test(q)) {
    return "Typhoid: prolonged fever + abdominal pain. Needs antibiotics — get a Widal/blood culture. Eat freshly cooked food only.";
  }
  if (/snake|leech|bite/.test(q)) {
    return "For snakebite, keep the limb still and below the heart. Do NOT cut or suck. Reach the nearest hospital within 30 minutes.";
  }
  if (/report/.test(q)) {
    return "Tap the Report tab, choose your symptoms and severity, and submit. Your report helps the AI flag outbreaks early.";
  }
  if (/risk|score/.test(q)) {
    return "The risk score combines reports, water quality, rainfall, baseline flood risk and trend detection. 60+ is HIGH, 32–59 is MEDIUM, below 32 is SAFE.";
  }
  return "I can help with symptoms, water safety, mosquito/dengue prevention, and finding emergency contacts. Try one of the suggestions below.";
}

export function ChatAssistant() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      from: "bot",
      text: "Hi, I'm RakshakBot. Ask me about symptoms, prevention, or what to do in a flood emergency.",
    },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const u: Msg = { id: `u-${Date.now()}`, from: "user", text };
    const b: Msg = { id: `b-${Date.now()}`, from: "bot", text: answerFor(text) };
    setMessages((m) => [...m, u, b]);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          position: "absolute",
          right: 16,
          bottom: insets.bottom + 90,
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 6,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Feather name="message-circle" size={24} color={colors.primaryForeground} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              maxHeight: "90%",
              minHeight: "70%",
              paddingBottom: insets.bottom,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingBottom: 10,
                gap: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  backgroundColor: colors.primary + "1A",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="message-circle" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 15,
                    color: colors.foreground,
                  }}
                >
                  RakshakBot
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    color: colors.mutedForeground,
                  }}
                >
                  {t("ai_assistant_sub")}
                </Text>
              </View>
              <Pressable hitSlop={12} onPress={() => setOpen(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{
                padding: 16,
                gap: 10,
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}

              <View style={{ marginTop: 12, gap: 8 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    color: colors.mutedForeground,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  {t("try_asking")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => send(s)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: colors.secondary,
                        borderWidth: 1,
                        borderColor: colors.border,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: colors.foreground,
                        }}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingHorizontal: 12,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={t("ask_anything")}
                placeholderTextColor={colors.mutedForeground}
                onSubmitEditing={() => send(input)}
                returnKeyType="send"
                style={{
                  flex: 1,
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 14,
                  paddingVertical: Platform.OS === "ios" ? 12 : 10,
                  borderRadius: 12,
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
              <Pressable
                onPress={() => send(input)}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  width: 46,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Feather name="send" size={18} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const colors = useColors();
  const isUser = msg.from === "user";
  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
        backgroundColor: isUser ? colors.primary : colors.card,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        borderTopRightRadius: isUser ? 4 : 16,
        borderTopLeftRadius: isUser ? 16 : 4,
        borderWidth: isUser ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: isUser ? colors.primaryForeground : colors.foreground,
          fontFamily: "Inter_500Medium",
          fontSize: 13,
          lineHeight: 19,
        }}
      >
        {msg.text}
      </Text>
    </View>
  );
}