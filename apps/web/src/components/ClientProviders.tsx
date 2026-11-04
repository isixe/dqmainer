"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/locales/i18n";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </I18nextProvider>
  );
}
