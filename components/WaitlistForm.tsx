"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { submitWaitlist } from "@/app/actions";
import { track, trackPixel } from "@/lib/analytics";
import { captureAttribution, type Attribution } from "@/lib/attribution";
import { AI_TOOLS, MESSAGES, isValidEmail, type WaitlistErrorReason } from "@/lib/waitlist";
import { ArrowRight } from "./icons";
import styles from "./WaitlistForm.module.css";

type Status = "idle" | "submitting" | "success";
type FormError = { reason: WaitlistErrorReason; message: string } | null;

export default function WaitlistForm() {
  const uid = useId();
  const ids = {
    email: `${uid}-email`,
    emailError: `${uid}-email-error`,
    other: `${uid}-other`,
    consent: `${uid}-consent`,
    consentError: `${uid}-consent-error`,
    consentDetail: `${uid}-consent-detail`,
    submitError: `${uid}-submit-error`,
  };

  const [email, setEmail] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [consent, setConsent] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<FormError>(null);

  const attribution = useRef<Attribution | null>(null);
  const started = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    attribution.current = captureAttribution();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const otherChecked = tools.includes("other");
  const showOther = otherChecked || otherText.length > 0;

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("form_start");
  }

  function toggleTool(value: string, checked: boolean) {
    setTools((prev) => (checked ? [...prev.filter((v) => v !== value), value] : prev.filter((v) => v !== value)));
  }

  function onOtherInput(value: string) {
    setOtherText(value);
    if (value.trim().length > 0 && !tools.includes("other")) toggleTool("other", true);
  }

  function showError(reason: WaitlistErrorReason, message: string = MESSAGES[reason]) {
    setError({ reason, message });
    track("form_error", { reason });
    if (reason === "invalid_email" || reason === "duplicate") emailRef.current?.focus();
    if (reason === "consent") consentRef.current?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) return showError("invalid_email");
    if (!consent) return showError("consent");

    setError(null);
    setStatus("submitting");

    const attr = attribution.current ?? captureAttribution();
    const selected = AI_TOOLS.map((t) => t.value).filter((v) => tools.includes(v));
    try {
      const result = await submitWaitlist({
        email: trimmed,
        aiTools: selected,
        aiOther: otherChecked ? otherText : "",
        consent,
        company,
        ...attr,
      });
      if (result.ok) {
        setStatus("success");
        track("form_submit", { ai_tools: selected, has_other: otherChecked && otherText.trim().length > 0 });
        trackPixel("Lead");
      } else {
        setStatus("idle");
        showError(result.reason, result.message);
      }
    } catch {
      setStatus("idle");
      showError("server");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.box}>
        <div ref={successRef} tabIndex={-1} role="status" className={styles.success}>
          <p className={styles.successTitle}>신청이 완료됐습니다.</p>
          <p className={styles.successBody}>베타가 열리면 이 이메일로 가장 먼저 알려드릴게요.</p>
        </div>
      </div>
    );
  }

  const emailInvalid = error?.reason === "invalid_email" || error?.reason === "duplicate";
  const consentInvalid = error?.reason === "consent";
  const submitInvalid = error?.reason === "server";
  const submitting = status === "submitting";

  return (
    <form className={styles.box} onSubmit={onSubmit} onChange={markStarted} noValidate>
      <div className={styles.field}>
        <label htmlFor={ids.email} className={styles.label}>
          이메일
        </label>
        <input
          ref={emailRef}
          id={ids.email}
          name="email"
          type="email"
          inputMode="email"
          placeholder="name@example.com"
          autoComplete="email"
          required
          className={`${styles.input} ph-no-capture`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailInvalid) setError(null);
          }}
          aria-invalid={emailInvalid || undefined}
          aria-describedby={emailInvalid ? ids.emailError : undefined}
        />
        {emailInvalid && (
          <p id={ids.emailError} className={styles.error} role="alert">
            {error?.message}
          </p>
        )}
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          주로 쓰는 AI <span className={styles.legendNote}>(중복 선택 가능)</span>
        </legend>
        <div className={styles.options}>
          {AI_TOOLS.map((tool) => (
            <label key={tool.value} className={styles.option}>
              <input
                type="checkbox"
                name="ai_tools"
                value={tool.value}
                className={styles.checkbox}
                checked={tools.includes(tool.value)}
                onChange={(e) => toggleTool(tool.value, e.target.checked)}
              />
              {tool.label}
            </label>
          ))}
        </div>
        {showOther && (
          <>
            <label htmlFor={ids.other} className="sr-only">
              기타 AI 직접 입력
            </label>
            <input
              id={ids.other}
              name="ai_other"
              type="text"
              maxLength={100}
              placeholder="기타 AI를 적어주세요 (예: Perplexity, Copilot)"
              className={`${styles.input} ${styles.inputSmall}`}
              value={otherText}
              onChange={(e) => onOtherInput(e.target.value)}
            />
          </>
        )}
      </fieldset>

      <div className={styles.consent}>
        <div className={styles.consentRow}>
          <label className={styles.consentLabel}>
            <input
              ref={consentRef}
              id={ids.consent}
              type="checkbox"
              name="consent"
              className={styles.checkbox}
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (consentInvalid) setError(null);
              }}
              aria-invalid={consentInvalid || undefined}
              aria-describedby={consentInvalid ? ids.consentError : undefined}
            />
            <span>
              [필수] 개인정보 <span className="nw">수집·이용에 동의합니다.</span>
            </span>
          </label>
          <button
            type="button"
            className={styles.detailToggle}
            aria-expanded={detailOpen}
            aria-controls={ids.consentDetail}
            onClick={() => setDetailOpen((v) => !v)}
          >
            자세히
          </button>
        </div>
        <ul id={ids.consentDetail} className={styles.consentDetail} hidden={!detailOpen}>
          <li>수집 항목: 이메일, 주로 쓰는 AI, 유입 경로</li>
          <li>이용 목적: 베타 오픈 안내, 서비스 개선을 위한 통계</li>
          <li>보유 기간: 베타 종료 후 6개월 또는 삭제 요청 시까지</li>
          <li>동의를 거부할 수 있으며, 거부 시 베타 대기 신청이 제한됩니다.</li>
        </ul>
        <p className={styles.privacyNote}>
          <a href="/privacy" target="_blank" rel="noopener">
            개인정보처리방침
          </a>
        </p>
        {consentInvalid && (
          <p id={ids.consentError} className={styles.error} role="alert">
            {error?.message}
          </p>
        )}
      </div>

      {/* honeypot — 사람에게는 보이지 않는 칸 */}
      <div className={styles.hp} aria-hidden="true">
        <label>
          회사
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.submitArea}>
        <button
          type="submit"
          className={styles.submit}
          disabled={submitting}
          aria-describedby={submitInvalid ? ids.submitError : undefined}
        >
          {submitting ? (
            "신청 중…"
          ) : (
            <>
              베타 대기 신청하기
              <ArrowRight />
            </>
          )}
        </button>
        {submitInvalid && (
          <p id={ids.submitError} className={styles.error} role="alert">
            {error?.message}
          </p>
        )}
      </div>

    </form>
  );
}
