import { Ionicons } from "@expo/vector-icons";
import {
  daysUntil,
  getExpirationStatusType,
  queryWhois,
  useFavorites,
  type WhoisResults,
} from "core";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { asyncStorageAdapter } from "@/lib/storage";
import { expirationStatusColor, expirationStatusContainer, theme } from "@/lib/theme";

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { favorites, loaded, reload, removeBatchFavorites, updateNote } =
    useFavorites(asyncStorageAdapter);
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<WhoisResults>({});

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return favorites;
    return favorites.filter((item) => item.domain.includes(keyword));
  }, [favorites, query]);

  const checkAll = useCallback(async () => {
    if (favorites.length === 0) return;
    setChecking(true);
    setError(null);
    try {
      const results = await queryWhois(favorites.map((item) => item.domain));
      setChecked(results);
    } catch (err) {
      setChecked({});
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setChecking(false);
    }
  }, [favorites]);

  const disabled = checking || favorites.length === 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("favorites.title")}</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t("favorites.searchPlaceholder")}
            placeholderTextColor={theme.colors.outline}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.count}>
            {visible.length} {t("favorites.domains")}
          </Text>
          <Pressable
            onPress={() => void checkAll()}
            disabled={disabled}
            style={({ pressed }) => [
              styles.checkButton,
              disabled && styles.buttonDisabled,
              pressed && !disabled && styles.pressed,
            ]}
          >
            {checking ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="refresh" size={16} color={theme.colors.primary} />
            )}
            <Text style={styles.checkButtonText}>{t("favorites.oneClickCheck")}</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loaded ? (
          <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
        ) : null}

        {loaded && visible.length === 0 ? (
          <Text style={styles.empty}>{t("favorites.empty")}</Text>
        ) : null}

        {visible.map((item, index) => {
          const data = checked[item.domain];
          const expires = data?.ts?.expires;
          const daysLeft = expires ? daysUntil(expires) : null;
          const statusType = daysLeft !== null ? getExpirationStatusType(daysLeft) : null;
          const accent = statusType
            ? expirationStatusColor[statusType]
            : theme.colors.mutedForeground;
          const accentBg = statusType
            ? expirationStatusContainer[statusType]
            : theme.colors.surfaceContainerHigh;

          return (
            <Animated.View
              key={item.domain}
              entering={FadeInDown.delay(index * 40).duration(240)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: accentBg }]}>
                  <Text style={[styles.avatarInitial, { color: accent }]}>
                    {item.domain.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardTitles}>
                  <Text style={styles.domain} numberOfLines={1}>
                    {item.domain}
                  </Text>
                  {daysLeft !== null ? (
                    <Text style={[styles.daysLeft, { color: accent }]}>
                      {t("result.daysLeft", { days: daysLeft })}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => removeBatchFavorites([item.domain])}
                  hitSlop={10}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </Pressable>
              </View>
              <TextInput
                style={styles.note}
                defaultValue={item.note}
                placeholder={t("favorites.notePlaceholder")}
                placeholderTextColor={theme.colors.outline}
                onEndEditing={(event) => updateNote(item.domain, event.nativeEvent.text)}
              />
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  searchInput: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.foreground,
    padding: 0,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  count: {
    ...theme.typography.label,
    color: theme.colors.mutedForeground,
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  buttonDisabled: { opacity: 0.6 },
  checkButtonText: {
    ...theme.typography.label,
    color: theme.colors.onPrimaryContainer,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.radius.small,
    padding: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.bodySmall,
    flex: 1,
    color: theme.colors.onErrorContainer,
  },
  loading: { marginTop: theme.spacing.xl },
  empty: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    ...theme.typography.title,
  },
  cardTitles: { flex: 1 },
  domain: {
    ...theme.typography.title,
    color: theme.colors.foreground,
  },
  daysLeft: {
    ...theme.typography.bodySmall,
    marginTop: 2,
  },
  iconButton: { padding: theme.spacing.xs },
  note: {
    ...theme.typography.bodySmall,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.small,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
});
