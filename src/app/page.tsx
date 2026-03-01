"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/locales/i18n";
import { Globe, Zap, CheckCircle, BarChart3, ArrowLeft, LayoutGrid, List } from "lucide-react";
import {
	ViewMode,
	SortBy,
	ExpirationStatusType,
	FEATURES,
	WHY_CHOOSE_US,
	TESTIMONIALS,
	EXAMPLE_DOMAINS,
	EXPIRATION_THRESHOLDS,
	EXPIRATION_STATUS_CONFIG,
	STATS_DATA,
	PRO_FEATURES,
} from "@/types/enums";

interface WhoisData {
	found: boolean;
	registrar?: {
		id: string;
		name: string;
		email?: string;
		reseller?: string;
	};
	status?: string[];
	nameservers?: string[];
	ts?: {
		created?: string;
		updated?: string;
		expires?: string;
	};
	error?: string;
}

type Results = Record<string, WhoisData>;

function getExpirationStatus(
	expiresDate?: string,
	t?: (key: string, options?: Record<string, string | number>) => string,
): {
	color: string;
	icon: React.ReactNode;
	label: string;
	days: number;
} | null {
	if (!expiresDate) return null;
	const now = new Date();
	const expires = new Date(expiresDate);
	const diffTime = expires.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	const label = t ? t("result.daysLeft", { days: diffDays }) : `${diffDays} days left`;

	let statusType: ExpirationStatusType;
	if (diffDays <= EXPIRATION_THRESHOLDS.CRITICAL) {
		statusType = ExpirationStatusType.CRITICAL;
	} else if (diffDays <= EXPIRATION_THRESHOLDS.WARNING) {
		statusType = ExpirationStatusType.WARNING;
	} else {
		statusType = ExpirationStatusType.SAFE;
	}

	const config = EXPIRATION_STATUS_CONFIG[statusType];
	const IconComponent = config.icon;

	return {
		color: config.color,
		icon: <IconComponent className="w-4 h-4" />,
		label: `(${label})`,
		days: diffDays,
	};
}

export default function Home() {
	const { t, i18n } = useTranslation();
	const searchParams = useSearchParams();
	const [domains, setDomains] = useState("");
	const [results, setResults] = useState<Results | null>(null);
	const [loading, setLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CARD);
	const [sortBy, setSortBy] = useState<SortBy>(SortBy.EXPIRES_ASC);
	const hasProcessedUrl = useRef(false);

	const handleLookup = useCallback(
		async (domainOverride?: string) => {
			const domainInput = domainOverride ?? domains;
			if (!domainInput.trim()) return;
			const domainList = domainInput
				.split(/[\n,]/)
				.map((d) => d.trim())
				.filter((d) => d);
			if (domainList.length === 0) return;

			setLoading(true);
			setResults(null);
			try {
				const domainParam = domainList.join(",");
				const res = await fetch(`/api/whois?domain=${encodeURIComponent(domainParam)}`);
				const data = await res.json();
				setResults(data);
				setShowResults(true);
			} catch {
				setResults({ error: { found: false, error: t("home.queryFailed") } });
				setShowResults(true);
			}
			setLoading(false);
		},
		[domains, t],
	);

	useEffect(() => {
		if (hasProcessedUrl.current) return;
		const urlParam = searchParams.get("url");
		if (urlParam) {
			hasProcessedUrl.current = true;
			let domainToCheck = urlParam.trim();
			try {
				const urlObj = new URL(domainToCheck);
				domainToCheck = urlObj.hostname;
			} catch {
				domainToCheck = domainToCheck.replace(/^https?:\/\//, "").split("/")[0];
			}
			if (domainToCheck) {
				setDomains(domainToCheck);
				setTimeout(() => {
					handleLookup(domainToCheck);
				}, 100);
			}
		}
	}, [searchParams, handleLookup]);

	const handleBack = () => {
		setShowResults(false);
		setResults(null);
	};

	const formatDate = (date?: string | Date) => {
		if (!date) return "-";
		const d = new Date(date);
		return d.toLocaleDateString(i18n.language === "zh" ? "zh-CN" : "en-US");
	};

	// Results View
	if (showResults) {
		return (
			<div className="min-h-screen">
				<section className="pt-8">
					<div className="container mx-auto px-4 max-w-4xl">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-4">
								<Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
									<ArrowLeft className="w-4 h-4" />
									{t("home.back")}
								</Button>
							</div>
							<div className="flex items-center gap-2 p-1 rounded-lg">
								<Button
									variant={viewMode === ViewMode.CARD ? "secondary" : "ghost"}
									size="sm"
									onClick={() => setViewMode(ViewMode.CARD)}
									className="gap-2">
									<LayoutGrid className="w-4 h-4" />
									{t("result.viewCard")}
								</Button>
								<Button
									variant={viewMode === ViewMode.LIST ? "secondary" : "ghost"}
									size="sm"
									onClick={() => setViewMode(ViewMode.LIST)}
									className="gap-2">
									<List className="w-4 h-4" />
									{t("result.viewList")}
								</Button>
							</div>
						</div>

						<Card className="mb-6 border-black/10">
							<CardContent className="pt-6 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="domains" className="text-black font-medium">
										{t("home.inputLabel")}
									</Label>
									<Textarea
										id="domains"
										placeholder={t("home.inputPlaceholder")}
										value={domains}
										onChange={(e) => setDomains(e.target.value)}
										rows={3}
										className="font-mono focus:outline-none focus-visible:ring-0 focus-visible:border-input focus-visible:shadow-none focus:ring-0 outline-none border-black/20 focus:border-black outline-none"
									/>
								</div>
								<Button
									onClick={handleLookup}
									disabled={loading}
									className="w-full bg-black hover:bg-black/80 text-white">
									{loading ? t("home.loading") : t("home.button")}
								</Button>
							</CardContent>
						</Card>
					</div>
				</section>

				<section className="pb-8">
					<div className="container mx-auto px-4 max-w-4xl">
						{results && Object.keys(results).length > 0 && (
							<>
								<div className="flex md:items-center items-start justify-between mb-4 md:flex-row flex-col gap-3">
									<span className="text-sm text-black/60">{t("result.sortBy")}</span>
									<div className="flex items-center gap-2 flex-wrap">
										<Button
											variant={sortBy === SortBy.EXPIRES_ASC ? "secondary" : "ghost"}
											size="sm"
											onClick={() => setSortBy(SortBy.EXPIRES_ASC)}>
											{t("result.sortByExpiresAsc")}
										</Button>
										<Button
											variant={sortBy === SortBy.EXPIRES_DESC ? "secondary" : "ghost"}
											size="sm"
											onClick={() => setSortBy(SortBy.EXPIRES_DESC)}>
											{t("result.sortByExpiresDesc")}
										</Button>
										<Button
											variant={sortBy === SortBy.DOMAIN ? "secondary" : "ghost"}
											size="sm"
											onClick={() => setSortBy(SortBy.DOMAIN)}>
											{t("result.sortByDomain")}
										</Button>
									</div>
								</div>
								<div className={viewMode === ViewMode.CARD ? "space-y-4" : "space-y-2"}>
									{Object.entries(results)
										.sort((a, b) => {
											const [, dataA] = a;
											const [, dataB] = b;
											if (sortBy === SortBy.DOMAIN) {
												return a[0].localeCompare(b[0]);
											}
											const expiresA = dataA.ts?.expires ? new Date(dataA.ts.expires).getTime() : 0;
											const expiresB = dataB.ts?.expires ? new Date(dataB.ts.expires).getTime() : 0;
											if (sortBy === SortBy.EXPIRES_ASC) {
												return expiresA - expiresB;
											}
											return expiresB - expiresA;
										})
										.map(([domain, data]) =>
											viewMode === ViewMode.CARD ? (
												<Card key={domain} className="border-black/10 shadow-sm">
													<CardHeader className="pb-2 border-b border-black/5">
														<CardTitle className="text-lg font-mono text-black">{domain}</CardTitle>
													</CardHeader>
													<CardContent className="pt-4">
														{data.error ? (
															<p className="text-red-600 font-medium">{data.error}</p>
														) : data.found ? (
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
																<div>
																	<p className="text-black/50 font-medium">{t("result.registrar")}</p>
																	<p className="font-semibold text-black">{data.registrar?.name || "-"}</p>
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.registrarId")}</p>
																	<p className="font-semibold text-black">{data.registrar?.id || "-"}</p>
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.registrarEmail")}</p>
																	<p className="font-semibold text-black">{data.registrar?.email || "-"}</p>
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.reseller")}</p>
																	<p className="font-semibold text-black">{data.registrar?.reseller || "-"}</p>
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.createdDate")}</p>
																	<p className="font-semibold text-black">{formatDate(data.ts?.created)}</p>
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.updatedDate")}</p>
																	<p className="font-semibold text-black">{formatDate(data.ts?.updated)}</p>
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.expiresDate")}</p>
																	{(() => {
																		const status = getExpirationStatus(data.ts?.expires, t);
																		return (
																			<div className="flex items-center flex-row">
																				<div
																					className={`flex items-center gap-1 font-semibold ${status?.color || "text-black"}`}>
																					<span>{status?.icon}</span>
																					<span>{formatDate(data.ts?.expires)}</span>
																				</div>
																				{status && (
																					<span
																						className={`inline-flex items-center gap-1 text-sm font-medium ${status.color}`}>
																						{status.label}
																					</span>
																				)}
																			</div>
																		);
																	})()}
																</div>
																<div>
																	<p className="text-black/50 font-medium">{t("result.status")}</p>
																	<p className="font-semibold text-black">{data.status?.join(", ") || "-"}</p>
																</div>
																<div className="md:col-span-2">
																	<p className="text-black/50 font-medium">{t("result.nameServers")}</p>
																	<p className="font-semibold text-black">{data.nameservers?.join(", ") || "-"}</p>
																</div>
															</div>
														) : (
															<p className="text-black/60 font-medium">{t("home.notFound")}</p>
														)}
													</CardContent>
												</Card>
											) : (
												<div
													key={domain}
													className="flex items-center justify-between p-4 bg-white border border-black/10 rounded-lg hover:shadow-sm transition-shadow">
													<span className="font-mono text-black font-medium">{domain}</span>
													{data.error ? (
														<span className="text-red-600 text-sm">{data.error}</span>
													) : data.found ? (
														(() => {
															const status = getExpirationStatus(data.ts?.expires, t);
															return (
																<div className="flex items-center gap-3">
																	<div
																		className={`flex items-center gap-1.5 font-medium ${status?.color || "text-black"}`}>
																		{status?.icon}
																		<span>{formatDate(data.ts?.expires)}</span>
																	</div>
																	{status && <span className={`text-sm ${status.color}`}>{status.label}</span>}
																</div>
															);
														})()
													) : (
														<span className="text-black/60 text-sm">{t("home.notFound")}</span>
													)}
												</div>
											),
										)}
								</div>
							</>
						)}
					</div>
				</section>
			</div>
		);
	}

	// Landing Page View
	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="py-16 md:py-18 text-center bg-gradient-to-b from-white to-gray-50">
				<div className="container mx-auto px-4 max-w-4xl">
					<h1 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tight">{t("home.heroTitle")}</h1>
					<p className="text-lg md:text-xl text-black/60 mb-6 max-w-2xl mx-auto">{t("home.heroSubtitle")}</p>

					{/* Quick Tips */}
					<div className="flex flex-wrap justify-center gap-2 mb-8">
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
							<Zap className="w-3.5 h-3.5" />
							{t("home.tip1")}
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
							<CheckCircle className="w-3.5 h-3.5" />
							{t("home.tip2")}
						</span>
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
							<Globe className="w-3.5 h-3.5" />
							{t("home.tip3")}
						</span>
					</div>

					{/* Example Domains */}
					<div className="mb-6">
						<p className="text-sm text-black/40 mb-3">{t("home.tryExamples")}</p>
						<div className="flex flex-wrap justify-center gap-2">
							{EXAMPLE_DOMAINS.map((domain) => (
								<button
									key={domain}
									onClick={() => setDomains(domain)}
									className="px-3 py-1.5 text-sm bg-white border border-black/10 rounded-lg text-black/60 hover:border-black/30 hover:text-black transition-colors">
									{domain}
								</button>
							))}
						</div>
					</div>

					<div className="mb-8 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="domains" className="text-black font-semibold">
								{t("home.inputLabel")}
							</Label>
							<Textarea
								id="domains"
								placeholder={t("home.inputPlaceholder")}
								value={domains}
								onChange={(e) => setDomains(e.target.value)}
								rows={6}
								className="font-mono border-black/20 focus:outline-none focus-visible:ring-0 focus-visible:border-input focus-visible:shadow-none focus:ring-0 outline-none min-h-[160px]"
							/>
						</div>
						<Button
							onClick={handleLookup}
							disabled={loading}
							className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold">
							{loading ? t("home.loading") : t("home.button")}
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-black text-black mb-2">{t("home.featuresTitle")}</h2>
						<p className="text-black/60">{t("home.featuresSubtitle")}</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{FEATURES.map((feature) => (
							<Card
								key={feature.key}
								className="hover:shadow-xl transition-all duration-300 border-black/5 hover:border-black/20">
								<CardContent className="pt-6">
									<feature.icon className="w-12 h-12 text-black mb-4" strokeWidth={1.5} />
									<h3 className="font-bold text-black text-lg mb-2">{t(`home.${feature.key}Title`)}</h3>
									<p className="text-sm text-black/60">{t(`home.${feature.key}Desc`)}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Why Choose Us Section */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl font-black text-black mb-6">{t("home.whyTitle")}</h2>
							<div className="space-y-5">
								{WHY_CHOOSE_US.map((item) => (
									<div key={item.key} className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
											<item.icon className="w-5 h-5 text-white" strokeWidth={2} />
										</div>
										<div>
											<h4 className="font-bold text-black text-lg">{t(`home.${item.key}Title`)}</h4>
											<p className="text-black/60">{t(`home.${item.key}Desc`)}</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<Card className="bg-white border border-black/10 shadow-xl">
							<CardContent className="pt-6">
								<div className="text-center mb-6">
									<div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center mx-auto mb-3">
										<BarChart3 className="w-7 h-7 text-white" strokeWidth={1.5} />
									</div>
									<h3 className="font-bold text-xl text-black">{t("home.statsTitle")}</h3>
								</div>
								<div className="grid grid-cols-2 gap-4">
									{STATS_DATA.map((stat) => (
										<div key={stat.key} className="text-center p-4 bg-gray-50 rounded-lg border border-black/5">
											<div className="text-3xl font-black text-black">{stat.value}</div>
											<div className="text-sm text-black/50">{t(`home.${stat.key}`)}</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Professional Features */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-black text-black mb-2">{t("home.proTitle")}</h2>
						<p className="text-black/60">{t("home.proSubtitle")}</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{PRO_FEATURES.map((item) => (
							<Card key={item.key} className="border-black/5 hover:border-black/20 transition-all">
								<CardContent className="pt-6 flex items-start gap-4">
									<div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
										<item.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
									</div>
									<div>
										<h3 className="font-bold text-black text-lg mb-1">{t(`home.${item.key}Title`)}</h3>
										<p className="text-black/60">{t(`home.${item.key}Desc`)}</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-black text-black mb-2">{t("home.testimonialsTitle")}</h2>
						<p className="text-black/60">{t("home.testimonialsSubtitle")}</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{TESTIMONIALS.map((item) => (
							<Card key={item.key} className="bg-white border-black/5">
								<CardContent className="pt-6">
									<p className="text-black/70 mb-6 italic leading-relaxed">&ldquo;{t(`home.${item.key}Text`)}&rdquo;</p>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
											{item.name.charAt(0)}
										</div>
										<div>
											<div className="font-bold text-black">{item.name}</div>
											<div className="text-sm text-black/50">{item.role}</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
