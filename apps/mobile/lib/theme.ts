import { ExpirationStatusType } from "core";

export const theme = {
  colors: {
    background: "#FFFBFE",
    surface: "#FFFBFE",
    surfaceContainerLow: "#F7F2FA",
    surfaceContainer: "#F3EDF7",
    surfaceContainerHigh: "#ECE6F0",
    surfaceVariant: "#E7E0EC",
    card: "#F7F2FA",
    foreground: "#1C1B1F",
    mutedForeground: "#49454F",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
    primary: "#6750A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#EADDFF",
    onPrimaryContainer: "#21005D",
    secondaryContainer: "#E8DEF8",
    onSecondaryContainer: "#1D192B",
    tertiaryContainer: "#FFD8E4",
    onTertiaryContainer: "#31111D",
    error: "#B3261E",
    onError: "#FFFFFF",
    errorContainer: "#F9DEDC",
    onErrorContainer: "#410E0B",
    star: "#C77700",
    scrim: "rgba(0, 0, 0, 0.32)",
  },
  radius: {
    chip: 8,
    small: 12,
    card: 16,
    large: 24,
    dialog: 28,
    hero: 32,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "400" },
    headline: { fontSize: 24, lineHeight: 32, fontWeight: "500" },
    title: { fontSize: 20, lineHeight: 28, fontWeight: "500" },
    body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
    bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
    label: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
    labelSmall: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  },
} as const;

export const expirationStatusColor: Record<ExpirationStatusType, string> = {
  [ExpirationStatusType.CRITICAL]: "#B3261E",
  [ExpirationStatusType.WARNING]: "#7A5900",
  [ExpirationStatusType.SAFE]: "#146C2E",
};

export const expirationStatusContainer: Record<ExpirationStatusType, string> = {
  [ExpirationStatusType.CRITICAL]: "#F9DEDC",
  [ExpirationStatusType.WARNING]: "#F7E1A8",
  [ExpirationStatusType.SAFE]: "#D7F0DC",
};
