import { Ionicons } from "@expo/vector-icons";
import {
  EXAMPLE_DOMAINS,
  ExpirationStatusType,
  daysUntil,
  getExpirationStatusType,
  queryWhois,
  useFavorites,
  type WhoisData,
  type WhoisResults,
} from "core";
import { useFocusEffect, useRouter } from "expo-router";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
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
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { asyncStorageAdapter } from "@/lib/storage";
import { expirationStatusColor, expirationStatusContainer, theme } from "@/lib/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type Translate = ReturnType<typeof useTranslation>["t"];

interface LookupResult {
  domain: string;
  data: WhoisData;
}

interface StatusView {
  accent: string;
  background: string;
  icon: IoniconName;
  subtitle: string;
}

const STATUS_ICON: Record<ExpirationStatusType, IoniconName> = {
  [ExpirationStatusType.CRITICAL]: "alert-circle",
  [ExpirationStatusType.WARNING]: "warning",
  [ExpirationStatusType.SAFE]: "checkmark-circle",
};

function statusIcon(type: ExpirationStatusType | null): IoniconName {
  if (!type) return "help-circle";
  return STATUS_ICON[type];
}

function parseDomains(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/\s|,|;/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

function expirationStatus(daysLeft: number | null): ExpirationStatusType | null {
  if (daysLeft === null) return null;
  return getExpirationStatusType(daysLeft);
}

function daysLabel(t: Translate, found: boolean, daysLeft: number | null): string {
  if (!found) return t("home.notFound");
  if (daysLeft === null) return t("home.statusUnknown");
  if (daysLeft < 0) return t("result.expired", { days: Math.abs(daysLeft) });
  return t("result.daysLeft", { days: daysLeft });
}

function describe(data: WhoisData | undefined, t: Translate): StatusView {
  const found = data?.found ?? false;
  const expires = data?.ts?.expires;
  const daysLeft = expires ? daysUntil(expires) : null;
  const type = found ? expirationStatus(daysLeft) : null;
  return {
    accent: type ? expirationStatusColor[type] : theme.colors.mutedForeground,
    background: type ? expirationStatusContainer[type] : theme.colors.surfaceContainerHigh,
    icon: statusIcon(type),
    subtitle: daysLabel(t, found, daysLeft),
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

interface SummaryChipProps {
  icon: IoniconName;
  label: string;
  value: number;
  color: string;
  background: string;
}

function SummaryChip({ icon, label, value, color, background }: SummaryChipProps) {
  return (
    <View style={[styles.summaryChip, { backgroundColor: background }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

interface DomainRowProps {
  domain: string;
  data: WhoisData | undefined;
  favorited: boolean;
  expanded: boolean;
  onToggle: () => void;
  onToggleFavorite: () => void;
}

function DomainRow({
  domain,
  data,
  favorited,
  expanded,
  onToggle,
  onToggleFavorite,
}: DomainRowProps) {
  const { t } = useTranslation();
  const view = describe(data, t);
  const pending = data === undefined;

  return (
    <Animated.View style={styles.card} layout={LinearTransition.duration(200)}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.rowHeader, pressed && styles.pressed]}
      >
        <View style={[styles.avatar, { backgroundColor: view.background }]}>
          {pending ? (
            <ActivityIndicator size="small" color={view.accent} />
          ) : (
            <Ionicons name={view.icon} size={22} color={view.accent} />
          )}
        </View>
        <View style={styles.rowTitles}>
          <Text style={styles.domain} numberOfLines={1}>
            {domain}
          </Text>
          <Text style={[styles.domainSub, { color: view.accent }]} numberOfLines={1}>
            {view.subtitle}
          </Text>
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons
            name={favorited ? "star" : "star-outline"}
            size={22}
            color={favorited ? theme.colors.star : theme.colors.mutedForeground}
          />
        </Pressable>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.mutedForeground}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.detail}>
          {pending ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : data?.found ? (
            <>
              <DetailRow label={t("result.registrar")} value={data.registrar?.name ?? "-"} />
              {data.registrar?.email ? (
                <DetailRow label={t("result.registrarEmail")} value={data.registrar.email} />
              ) : null}
              {data.registrar?.reseller ? (
                <DetailRow label={t("result.reseller")} value={data.registrar.reseller} />
              ) : null}
              <DetailRow label={t("result.createdDate")} value={formatDate(data.ts?.created)} />
              <DetailRow label={t("result.updatedDate")} value={formatDate(data.ts?.updated)} />
              <DetailRow label={t("result.expiresDate")} value={formatDate(data.ts?.expires)} />
              {data.status && data.status.length > 0 ? (
                <DetailRow label={t("result.status")} value={data.status.join(", ")} />
              ) : null}
              {data.nameservers && data.nameservers.length > 0 ? (
                <DetailRow label={t("result.nameServers")} value={data.nameservers.join("\n")} />
              ) : null}
            </>
          ) : (
            <Text style={styles.notFound}>{t("home.notFound")}</Text>
          )}
          {data?.error ? <Text style={styles.detailError}>{data.error}</Text> : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, loaded, isFavorited, toggleFavorite } = useFavorites(asyncStorageAdapter);

  const [statusData, setStatusData] = useState<WhoisResults>({});
  const [checking, setChecking] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [lookupOpen, setLookupOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [results, setResults] = useState<LookupResult[]>([]);

  const favoritesKey = useMemo(
    () => favorites.map((item) => item.domain).join(","),
    [favorites],
  );
  const checkedKeyRef = useRef<string | null>(null);

  const checkFavorites = useCallback(async (domains: string[]) => {
    if (domains.length === 0) return;
    setChecking(true);
    setStatusError(null);
    try {
      const data = await queryWhois(domains);
      setStatusData(data);
    } catch (err) {
      setStatusData({});
      setStatusError(err instanceof Error ? err.message : String(err));
    } finally {
      setChecking(false);
    }
  }, []);

  const checkFavoritesKey = useCallback(
    (key: string) => {
      const domains = key ? key.split(",") : [];
      checkedKeyRef.current = key;
      void checkFavorites(domains);
    },
    [checkFavorites],
  );

  useFocusEffect(
    useCallback(() => {
      if (!loaded || favorites.length === 0) return;
      if (checkedKeyRef.current === favoritesKey) return;
      checkFavoritesKey(favoritesKey);
    }, [loaded, favorites.length, favoritesKey, checkFavoritesKey]),
  );

  const refresh = useCallback(() => {
    checkFavoritesKey(favoritesKey);
  }, [checkFavoritesKey, favoritesKey]);

  const summary = useMemo(() => {
    const counts: Record<ExpirationStatusType, number> & { unknown: number } = {
      [ExpirationStatusType.CRITICAL]: 0,
      [ExpirationStatusType.WARNING]: 0,
      [ExpirationStatusType.SAFE]: 0,
      unknown: 0,
    };
    for (const item of favorites) {
      const data = statusData[item.domain];
      const expires = data?.ts?.expires;
      const daysLeft = expires ? daysUntil(expires) : null;
      const type = data?.found ? expirationStatus(daysLeft) : null;
      if (!type) counts.unknown += 1;
      else counts[type] += 1;
    }
    return counts;
  }, [favorites, statusData]);

  const lookup = useCallback(async (raw: string) => {
    const domains = parseDomains(raw);
    if (domains.length === 0) return;
    setLoading(true);
    setLookupError(null);
    try {
      const data = await queryWhois(domains);
      setResults(domains.map((domain) => ({ domain, data: data[domain] ?? { found: false } })));
      setExpanded(domains.length === 1 ? domains[0] : null);
    } catch (err) {
      setResults([]);
      setLookupError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.hero}>{t("home.statusTitle")}</Text>
            <Text style={styles.subtitle}>{t("home.statusSubtitle")}</Text>
          </View>
          <Pressable
            onPress={refresh}
            disabled={checking || favorites.length === 0}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
          >
            {checking ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="refresh" size={22} color={theme.colors.primary} />
            )}
          </Pressable>
        </View>

        {statusError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
            <View style={styles.errorBody}>
              <Text style={styles.errorText}>{t("home.queryFailed")}</Text>
              <Text style={styles.errorDetail}>{statusError}</Text>
            </View>
          </View>
        ) : null}

        {loaded && favorites.length > 0 ? (
          <>
            <View style={styles.summaryRow}>
              <SummaryChip
                icon={STATUS_ICON[ExpirationStatusType.CRITICAL]}
                label={t("home.summaryCritical")}
                value={summary[ExpirationStatusType.CRITICAL]}
                color={expirationStatusColor[ExpirationStatusType.CRITICAL]}
                background={expirationStatusContainer[ExpirationStatusType.CRITICAL]}
              />
              <SummaryChip
                icon={STATUS_ICON[ExpirationStatusType.WARNING]}
                label={t("home.summaryWarning")}
                value={summary[ExpirationStatusType.WARNING]}
                color={expirationStatusColor[ExpirationStatusType.WARNING]}
                background={expirationStatusContainer[ExpirationStatusType.WARNING]}
              />
              <SummaryChip
                icon={STATUS_ICON[ExpirationStatusType.SAFE]}
                label={t("home.summarySafe")}
                value={summary[ExpirationStatusType.SAFE]}
                color={expirationStatusColor[ExpirationStatusType.SAFE]}
                background={expirationStatusContainer[ExpirationStatusType.SAFE]}
              />
              <SummaryChip
                icon="help-circle"
                label={t("home.summaryUnknown")}
                value={summary.unknown}
                color={theme.colors.mutedForeground}
                background={theme.colors.surfaceContainerHigh}
              />
            </View>

            <Text style={styles.total}>
              {checking ? t("home.checking") : t("home.total", { count: favorites.length })}
            </Text>

            {favorites.map((item, index) => (
              <Animated.View
                key={item.domain}
                entering={FadeInDown.delay(index * 40).duration(240)}
              >
                <DomainRow
                  domain={item.domain}
                  data={statusData[item.domain]}
                  favorited={isFavorited(item.domain)}
                  expanded={expanded === item.domain}
                  onToggle={() =>
                    setExpanded((prev) => (prev === item.domain ? null : item.domain))
                  }
                  onToggleFavorite={() => toggleFavorite(item.domain)}
                />
              </Animated.View>
            ))}
          </>
        ) : null}

        {!loaded ? (
          <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
        ) : null}

        {loaded && favorites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={40} color={theme.colors.mutedForeground} />
            <Text style={styles.emptyTitle}>{t("home.noFavoritesTitle")}</Text>
            <Text style={styles.emptyHint}>{t("home.noFavoritesHint")}</Text>
            <Pressable
              onPress={() => router.navigate("/favorites")}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Text style={styles.emptyButtonText}>{t("home.goFavorites")}</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={() => setLookupOpen((prev) => !prev)}
          style={({ pressed }) => [styles.sectionToggle, pressed && styles.pressed]}
        >
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionToggleText}>{t("home.sectionLookup")}</Text>
          <Ionicons
            name={lookupOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.mutedForeground}
          />
        </Pressable>

        {lookupOpen ? (
          <>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>{t("home.inputLabel")}</Text>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={t("home.inputPlaceholder")}
                placeholderTextColor={theme.colors.outline}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.examplesLabel}>{t("home.tryExamples")}</Text>
              <View style={styles.chipRow}>
                {EXAMPLE_DOMAINS.map((domain) => (
                  <Pressable
                    key={domain}
                    onPress={() => setInput(domain)}
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                  >
                    <Text style={styles.chipText}>{domain}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => void lookup(input)}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                loading && styles.buttonDisabled,
                pressed && !loading && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <>
                  <Ionicons name="search" size={20} color={theme.colors.onPrimary} />
                  <Text style={styles.buttonText}>{t("home.button")}</Text>
                </>
              )}
            </Pressable>

            {lookupError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                <View style={styles.errorBody}>
                  <Text style={styles.errorText}>{t("home.queryFailed")}</Text>
                  <Text style={styles.errorDetail}>{lookupError}</Text>
                </View>
              </View>
            ) : null}

            {results.length > 0 ? (
              <Text style={styles.sectionTitle}>{t("home.results")}</Text>
            ) : null}

            {results.map((item, index) => (
              <Animated.View
                key={item.domain}
                entering={FadeInDown.delay(index * 45).duration(260)}
              >
                <DomainRow
                  domain={item.domain}
                  data={item.data}
                  favorited={isFavorited(item.domain)}
                  expanded={expanded === item.domain}
                  onToggle={() =>
                    setExpanded((prev) => (prev === item.domain ? null : item.domain))
                  }
                  onToggleFavorite={() => toggleFavorite(item.domain)}
                />
              </Animated.View>
            ))}
          </>
        ) : null}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  headerText: { flex: 1 },
  hero: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  summaryChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.small,
  },
  summaryValue: {
    ...theme.typography.title,
  },
  summaryLabel: {
    ...theme.typography.labelSmall,
  },
  total: {
    ...theme.typography.bodySmall,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  loading: { marginTop: theme.spacing.xxl },
  emptyCard: {
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.card,
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.title,
    color: theme.colors.foreground,
    marginTop: theme.spacing.sm,
  },
  emptyHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    minHeight: 44,
    justifyContent: "center",
  },
  emptyButtonText: {
    ...theme.typography.label,
    color: theme.colors.onPrimaryContainer,
  },
  sectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
    minHeight: 44,
  },
  sectionToggleText: {
    ...theme.typography.title,
    flex: 1,
    color: theme.colors.foreground,
  },
  inputCard: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.label,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.sm,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radius.small,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 110,
    textAlignVertical: "top",
  },
  examplesLabel: {
    ...theme.typography.labelSmall,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.onSecondaryContainer,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.lg,
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    ...theme.typography.label,
    fontSize: 16,
    color: theme.colors.onPrimary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  errorBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.radius.small,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  errorBody: { flex: 1 },
  errorText: {
    ...theme.typography.label,
    color: theme.colors.onErrorContainer,
  },
  errorDetail: {
    ...theme.typography.bodySmall,
    color: theme.colors.onErrorContainer,
    marginTop: 2,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: theme.colors.foreground,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.sm,
    overflow: "hidden",
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 64,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitles: { flex: 1 },
  domain: {
    ...theme.typography.title,
    color: theme.colors.foreground,
  },
  domainSub: {
    ...theme.typography.bodySmall,
    marginTop: 2,
  },
  iconButton: { padding: theme.spacing.xs },
  detail: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  detailLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.mutedForeground,
  },
  detailValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.foreground,
    flexShrink: 1,
    textAlign: "right",
  },
  notFound: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  detailError: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
