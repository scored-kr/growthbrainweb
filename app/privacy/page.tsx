import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { renderMarkdown } from "@/lib/markdown";
import { CONTACT_EMAIL, SOCIAL_IMAGE } from "@/lib/site";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "개인정보처리방침 — Growth Brain",
  description: "Growth Brain 베타 대기 신청자의 개인정보 처리방침입니다.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", images: [SOCIAL_IMAGE] },
};

export default async function PrivacyPage() {
  const source = await readFile(path.join(process.cwd(), "content", "privacy.md"), "utf8");
  const content = source.replaceAll("[문의 이메일]", CONTACT_EMAIL);

  return (
    <>
      <SiteHeader base="/" />
      <main className={styles.main}>
        <article className={styles.article}>{renderMarkdown(content, styles)}</article>
      </main>
      <SiteFooter />
    </>
  );
}
