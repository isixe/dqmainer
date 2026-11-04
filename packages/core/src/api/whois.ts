import type { WhoisResults } from "../types/whois";

export const DEFAULT_API_BASE_URL = "https://dqmainer.itea.dev";

export interface QueryWhoisOptions {
  baseUrl?: string;
  signal?: AbortSignal;
}

export async function queryWhois(
  domains: string | string[],
  options: QueryWhoisOptions = {},
): Promise<WhoisResults> {
  const baseUrl = (options.baseUrl ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  const list = Array.isArray(domains) ? domains : [domains];
  const param = list
    .map((d) => d.trim())
    .filter(Boolean)
    .join(",");

  if (!param) {
    throw new Error("At least one domain is required");
  }

  const response = await fetch(
    `${baseUrl}/api/whois?domain=${encodeURIComponent(param)}`,
    { signal: options.signal },
  );

  if (!response.ok) {
    throw new Error(`WHOIS request failed with status ${response.status}`);
  }

  return (await response.json()) as WhoisResults;
}
