import Link from "next/link";
import { CONTACT_EMAIL, HAS_CONTACT_EMAIL } from "@/lib/site";
import styles from "./site.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span className={styles.footerLogo}>Growth Brain</span>
        <div className={styles.footerMeta}>
          <Link href="/privacy" className={styles.footerLink}>
            개인정보처리방침
          </Link>
          <span>
            문의{" "}
            {HAS_CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerMail}>
                {CONTACT_EMAIL}
              </a>
            ) : (
              CONTACT_EMAIL
            )}
          </span>
          <span>© 2026 Growth Brain</span>
        </div>
      </div>
    </footer>
  );
}
