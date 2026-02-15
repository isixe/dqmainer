import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "dqmainer - Domain WHOIS Lookup Tool",
  description:
    "Free online domain WHOIS lookup tool. Query domain registration details including registrar, expiration date, name servers, and more using RDAP/WHOIS protocols.",
  keywords: [
    "WHOIS lookup",
    "domain lookup",
    "domain checker",
    "RDAP",
    "domain registration",
    "domain info",
    "whois查询",
    "域名查询",
  ],
  authors: [{ name: "dqmainer" }],
  openGraph: {
    title: "dqmainer - Domain WHOIS Lookup Tool",
    description:
      "Free online domain WHOIS lookup tool. Query domain registration details using RDAP/WHOIS protocols.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
