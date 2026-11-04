import { NextRequest, NextResponse } from "next/server";
import { whois } from "@cleandns/whois-rdap";

const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

function isValidDomain(domain: string): boolean {
  return domainRegex.test(domain);
}

function parseDomains(param: string): string[] {
  return param
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d);
}

async function queryWhois(domain: string) {
  const result = await whois(domain);
  return {
    found: result.found,
    registrar: result.registrar,
    status: result.status,
    nameservers: result.nameservers,
    ts: {
      created: result.ts?.created?.toISOString(),
      updated: result.ts?.updated?.toISOString(),
      expires: result.ts?.expires?.toISOString(),
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domainParam = searchParams.get("domain");

  if (!domainParam) {
    return NextResponse.json(
      { error: "Domain parameter is required" },
      { status: 400 },
    );
  }

  const domains = parseDomains(domainParam);

  if (domains.length === 0) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 },
    );
  }

  const invalidDomains = domains.filter((d) => !isValidDomain(d));
  if (invalidDomains.length > 0) {
    return NextResponse.json(
      { error: `Invalid domain format: ${invalidDomains.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const results: Record<string, unknown> = {};

    await Promise.all(
      domains.map(async (domain) => {
        try {
          results[domain] = await queryWhois(domain);
        } catch {
          results[domain] = { error: "查询失败" };
        }
      }),
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("WHOIS query error:", error);
    return NextResponse.json(
      { error: "Query failed, please try again later" },
      { status: 500 },
    );
  }
}
