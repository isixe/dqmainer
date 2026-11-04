export enum ViewMode {
  CARD = "card",
  LIST = "list",
}

export enum SortBy {
  EXPIRES_ASC = "expiresAsc",
  EXPIRES_DESC = "expiresDesc",
  DOMAIN = "domain",
}

export enum ExpirationStatusType {
  CRITICAL = "critical",
  WARNING = "warning",
  SAFE = "safe",
}

export const EXPIRATION_THRESHOLDS = {
  CRITICAL: 30,
  WARNING: 60,
} as const;

export const EXAMPLE_DOMAINS = ["google.com", "github.com", "cloudflare.com"];

export function getExpirationStatusType(days: number): ExpirationStatusType {
  if (days <= EXPIRATION_THRESHOLDS.CRITICAL) return ExpirationStatusType.CRITICAL;
  if (days <= EXPIRATION_THRESHOLDS.WARNING) return ExpirationStatusType.WARNING;
  return ExpirationStatusType.SAFE;
}

export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = new Date(isoDate).getTime();
  return Math.ceil((target - now.getTime()) / (1000 * 60 * 60 * 24));
}
