import Link from "next/link";
import styles from "./site.module.css";

/** base: 랜딩에서는 "" (같은 페이지 앵커), 다른 페이지에서는 "/" */
export default function SiteHeader({ base = "" }: { base?: "" | "/" }) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="주요 메뉴">
        {base ? (
          <Link href="/" className={styles.logo}>
            Growth Brain
          </Link>
        ) : (
          <a href="#top" className={styles.logo}>
            Growth Brain
          </a>
        )}
        <div className={styles.navLinks}>
          <a href={`${base}#how`} className={styles.navLink}>
            사용 방법
          </a>
          <a href={`${base}#faq`} className={styles.navLink}>
            FAQ
          </a>
          <a href={`${base}#waitlist`} className={styles.navCta} data-cta="header">
            베타 신청
          </a>
        </div>
      </nav>
    </header>
  );
}
