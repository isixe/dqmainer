import type { Metadata } from "next";
import { headers } from "next/headers";
import "../style/globals.css";
import ClientProviders from "@/components/ClientProviders";
import Script from "next/script";

export async function generateMetadata(): Promise<Metadata> {
	const headersList = await headers();
	const protocol = headersList.get("x-forwarded-proto") || "http";
	const host = headersList.get("host") || "localhost:3000";
	const url = `${protocol}://${host}`;

	return {
		title: "dqmainer - Domain WHOIS Lookup Tool",
		description:
			"Free online domain WHOIS lookup tool. Query domain registration details including registrar, expiration date, name servers, and more using RDAP/WHOIS protocols.",
		keywords: [
			"WHOIS lookup",
			"domain lookup",
			"domain checker",
			"RDAP",
			"whois",
			"domain check",
			"domain whios",
			"domain info",
			"whois查询",
			"域名查询",
			"域名注册信息",
			"域名到期时间",
			"域名工具",
			"拾域",
		],
		authors: [{ name: "isixe" }],
		openGraph: {
			title: "dqmainer - Domain WHOIS Lookup Tool",
			siteName: "dqmainer",
			images: `${url}/og-image.png`,
			description:
				"Free online domain WHOIS lookup tool. Query domain registration details using RDAP/WHOIS protocols.",
			type: "website",
			url: url,
		},
		alternates: {
			canonical: url,
		},
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const analyticsScript = process.env.ANALYTICS_SCRIPT || "";

	return (
		<html lang="en">
			<head>
				{analyticsScript ? <Script src={analyticsScript} id="analytics" data-website-id="dqmainer" defer /> : null}
			</head>
			<body className="antialiased min-h-screen flex flex-col">
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	);
}
