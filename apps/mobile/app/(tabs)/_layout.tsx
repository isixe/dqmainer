import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/js-tabs";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { theme } from "@/lib/theme";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.onSecondaryContainer,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceContainer,
          borderTopColor: theme.colors.outlineVariant,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("common.home"),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={size}
              color={focused ? theme.colors.onSecondaryContainer : theme.colors.mutedForeground}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t("common.favorites"),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              size={size}
              color={focused ? theme.colors.onSecondaryContainer : theme.colors.mutedForeground}
            />
          ),
        }}
      />
    </Tabs>
  );
}
