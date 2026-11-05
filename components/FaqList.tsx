"use client";

import { FAQS } from "@/lib/site";
import { track } from "@/lib/analytics";
import styles from "@/app/page.module.css";

export default function FaqList() {
  return (
    <div className={styles.faqList}>
      {FAQS.map((faq) => (
        <details
          key={faq.question}
          className={styles.faqItem}
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) track("faq_open", { question: faq.question });
          }}
        >
          <summary className={styles.faqQuestion}>
            {faq.question}
            <svg
              className={styles.faqIcon}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 12h14" />
              <path className={styles.faqIconV} d="M12 5v14" />
            </svg>
          </summary>
          <p className={styles.faqAnswer}>{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
