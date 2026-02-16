"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/locales/i18n";
import { Globe, FileText } from "lucide-react";

export default function Footer() {
	const { t } = useTranslation();

	const quickLinks = [{ label: t("footer.linkApiDocs"), href: "/api-docs", icon: FileText, external: false }];

	const socialLinks = [
		{ label: "Lab", href: "https://itea.dev" },
		{ label: "GitHub", href: "https://github.com/isixe/dqmainer" },
		{ label: "Twitter", href: "https://x.com/isixe_e" },
	];

	return (
		<footer className="border-t border-border bg-card mt-auto">
			<div className="container mx-auto md:mx-24 py-10">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Brand */}
					<div>
						<div className="flex items-center gap-2 mb-3">
							<Image
								src="/favicon.png"
								alt={t("common.title")}
								width={32}
								height={32}
								className="rounded-lg"
							/>
							<span className="font-bold text-lg">{t("common.title")}</span>
						</div>
						<p className="text-sm text-muted-foreground leading-relaxed">{t("footer.description")}</p>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="font-semibold mb-4">{t("footer.quickLinks")}</h3>
						<ul className="space-y-2">
							{quickLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										target={link?.external ? "_blank" : undefined}
										rel={link?.external ? "noopener noreferrer" : undefined}
										className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
										<link.icon className="w-3.5 h-3.5" />
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Socials */}
					<div>
						<h3 className="font-semibold mb-4">{t("footer.socials")}</h3>
						<ul className="space-y-2">
							{socialLinks.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-muted-foreground hover:text-primary transition-colors">
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} {t("footer.copyright")}
					</p>
				</div>
			</div>
		</footer>
	);
}
