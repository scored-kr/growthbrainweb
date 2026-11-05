import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WaitlistForm from "@/components/WaitlistForm";
import FaqList from "@/components/FaqList";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  CalendarDots,
  ChatDots,
  Docs,
  Layers,
  ListIcon,
  OpenBox,
  TwoChats,
} from "@/components/icons";
import type { ComponentType, ReactNode } from "react";
import { landingJsonLd } from "@/lib/jsonld";
import styles from "./page.module.css";

type IconItem = { Icon: ComponentType<{ className?: string }>; text: ReactNode };

const PAINS: IconItem[] = [
  { Icon: ChatDots, text: "대화가 길어져서 새 창을 열었더니, AI가 아무것도 기억하지 못한다" },
  { Icon: Layers, text: <>ChatGPT로 기획하고 Claude로 글을 쓰는데, 둘 사이를 <span className="nw">복붙으로 오간다</span></> },
  { Icon: Calendar, text: "어제 왜 그렇게 결정했는지, 나도 AI도 기억이 안 난다" },
];

const AUDIENCE: IconItem[] = [
  { Icon: TwoChats, text: <>AI 두 개 이상을 업무에 <span className="nw">쓰는 분</span></> },
  { Icon: CalendarDots, text: "한 프로젝트를 며칠, 몇 주씩 AI와 진행하는 분" },
  { Icon: Docs, text: "새 대화마다 배경 설명을 일일이 다시 하고 계신 분" },
];

const STATE_ROWS = [
  { label: "현재 진행 상태", value: "목차 확정, 본문 작성 시작" },
  { label: "주요 결정과 그 이유", value: "결론 먼저 — 첫 장에서 설득하려고" },
  { label: "다음 작업", value: "1장 요약과 근거 데이터 정리" },
  { label: "관련 작업물", value: "목차안, 시장 조사 자료" },
];

const TIMELINE = [
  { day: "월요일", tag: "ChatGPT · 저장", text: "제안 방향과 목차 정하기", active: false },
  { day: "화요일", tag: "ChatGPT · 저장", text: "근거 자료 정리", active: false },
  { day: "수요일", tag: "Claude · 불러옴", text: "설명 없이 바로 본문 작성", active: true },
];

function IconList({ items }: { items: IconItem[] }) {
  return (
    <ul className={styles.iconList}>
      {items.map(({ Icon, text }, i) => (
        <li key={i} className={styles.iconRow}>
          <Icon className={styles.rowIcon} />
          <p className={styles.rowText}>{text}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON 안의 "<"를 이스케이프해 스크립트 태그 탈출 방지
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd()).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main>
        {/* 히어로 */}
        <section id="top" data-section="hero" className={`${styles.container} ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <h1 className={styles.h1}>
              오늘도 AI에게
              <br />
              똑같은 내용을
              <br />
              설명하고 계신가요?
            </h1>
            <p className={styles.sub}>
              <span className="nw">대화창을 바꾸거나</span> <span className="nw">AI 툴을 옮길 때마다,</span>
              <br />
              처음부터 다시 설명하고 계시다면.
            </p>
            <p className={styles.heroStat}>
              한 번에 5분, 하루 세 번이면
              <br />
              <strong className={styles.heroStatStrong}>한 달에 5시간</strong>이 넘습니다.
            </p>
            <div className={styles.heroCtaWrap}>
              <a href="#waitlist" className={styles.ctaPrimary} data-cta="hero">
                베타 대기 신청하기
                <ArrowRight />
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.chatCard}>
              <div className={styles.chatHead}>
                <span className={styles.chipGpt} aria-hidden="true" />
                <span className={styles.chatName}>ChatGPT</span>
                <span className={styles.chatWhen}>· 어제</span>
              </div>
              <div className={styles.chatBody}>
                <div className={styles.bubble}>
                  <span className="nw">제안서 기획하자, 결론부터</span> <span className="nw">예산 이야기는 2장으로 빼자.</span>
                </div>
              </div>
            </div>
            <div className={styles.connector} aria-hidden="true">
              <svg width="56" height="52" viewBox="0 0 56 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2c0 26 14 40 42 42" />
                <path d="M40 37l8 7-9 6" />
              </svg>
            </div>
            <div className={`${styles.chatCard} ${styles.chatCardRight}`}>
              <div className={styles.chatHead}>
                <span className={styles.chipClaude} aria-hidden="true" />
                <span className={styles.chatName}>Claude</span>
                <span className={styles.chatWhen}>· 오늘</span>
              </div>
              <div className={`${styles.chatBody} ${styles.chatBodyStack}`}>
                <div className={styles.loadedChip}>
                  <Bookmark size={16} strokeWidth={2} />
                  이전 작업 불러옴
                </div>
                <div className={styles.bubble}>
                  <span className="nw">결론 먼저, 예산은 2장으로 뺀</span> <span className="nw">구조로 초안 잡아볼게요.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 이런 순간, 익숙한가요? */}
        <section data-section="pain" className={styles.tint}>
          <div className={`${styles.container} ${styles.sectionStack} ${styles.padA}`}>
            <h2 className={styles.h2List}>이런 순간, 익숙한가요?</h2>
            <IconList items={PAINS} />
          </div>
        </section>

        {/* 문제 */}
        <section data-section="problem" className={`${styles.container} ${styles.problem} ${styles.padB}`}>
          <span className={styles.eyebrow}>문제</span>
          <h2 className={styles.h2Problem}>
            <span className="nw">AI가 부족한 게</span> <span className="nw">아닙니다.</span>
            <br />
            <strong className={styles.bold}>
              <span className="nw">일의 맥락이 매번</span> <span className="nw">끊기는 겁니다.</span>
            </strong>
          </h2>
        </section>

        {/* 사용 방법 */}
        <section id="how" data-section="how" className={styles.tint}>
          <div className={`${styles.container} ${styles.how} ${styles.padA}`}>
            <div className={styles.headStack}>
              <span className={styles.eyebrow}>사용 방법</span>
              <h2 className={styles.h2Mid}>
                <span className="nw">Growth Brain은</span> <span className="nw">AI를 바꿔도</span>
                <br />
                <span className="nw">일이 이어지게 하는</span> <span className="nw">개인 업무 기억입니다.</span>
              </h2>
            </div>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <Bookmark className={styles.stepIcon} />
                <span className={styles.stepNum} aria-hidden="true">01</span>
                <p className={styles.stepText}>대화 중 버튼 한 번으로 저장</p>
              </li>
              <li className={styles.step}>
                <ListIcon className={styles.stepIcon} />
                <span className={styles.stepNum} aria-hidden="true">02</span>
                <p className={styles.stepText}>
                  <span>
                    현재 상태·결정·
                    <br />
                    다음 할 일로 자동 정리
                  </span>
                </p>
              </li>
              <li className={styles.step}>
                <OpenBox className={styles.stepIcon} />
                <span className={styles.stepNum} aria-hidden="true">03</span>
                <p className={styles.stepText}>
                  <span>
                    다른 AI에서 바로 불러와 <span className="nw">이어서 작업</span>
                  </span>
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* 무엇이 이어지나 */}
        <section data-section="carryover" className={`${styles.container} ${styles.carry} ${styles.padB}`}>
          <div className={styles.carryCopy}>
            <span className={styles.eyebrow}>무엇이 이어지나</span>
            <h2 className={`${styles.h2Mid} ${styles.light}`}>
              대화 기록이 아니라,
              <br />
              <strong className={styles.bold}>일의 상태를 넘깁니다.</strong>
            </h2>
            <p className={`${styles.sub} ${styles.carrySub}`}>
              새 창을 열어도, 다른 AI로 옮겨도
              <br />이 네 가지가 그대로 따라갑니다.
            </p>
          </div>
          <div className={styles.stateCard}>
            <div className={styles.stateHead}>
              <Bookmark size={22} strokeWidth={1.8} className={styles.blueIcon} />
              <span className={styles.stateTitle}>신규 프로젝트 제안서 작성</span>
            </div>
            <dl className={styles.stateList}>
              {STATE_ROWS.map((row) => (
                <div key={row.label} className={styles.stateRow}>
                  <dt className={styles.stateLabel}>{row.label}</dt>
                  <dd className={styles.stateValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 쓸수록 똑똑해진다 */}
        <section data-section="smarter" className={styles.topLine}>
          <div className={`${styles.container} ${styles.sectionStack} ${styles.padB}`}>
            <div className={styles.headStackWide}>
              <h2 className={styles.h2Big}>쓸수록 똑똑해진다</h2>
              <p className={styles.sub}>
                <span className="nw">쓰면 쓸수록</span> <span className="nw">내 일의 맥락이 쌓이고,</span>
                <br />
                <span className="nw">어떤 AI를 켜도</span> <span className="nw">나를 아는 상태에서 시작합니다.</span>
              </p>
            </div>
            <ol className={styles.timeline}>
              {TIMELINE.map((item) => (
                <li key={item.day} className={item.active ? `${styles.dayCard} ${styles.dayCardActive}` : styles.dayCard}>
                  <div className={styles.dayHead}>
                    <span className={styles.dayName}>{item.day}</span>
                    <span className={styles.dayTag}>{item.tag}</span>
                  </div>
                  <span className={styles.dayText}>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 이런 분께 */}
        <section data-section="audience" className={styles.tint}>
          <div className={`${styles.container} ${styles.sectionStack} ${styles.padA}`}>
            <h2 className={styles.h2List}>이런 분께</h2>
            <IconList items={AUDIENCE} />
          </div>
        </section>

        {/* 베타 대기 신청 */}
        <section id="waitlist" data-section="waitlist" className={`${styles.container} ${styles.waitlist} ${styles.padB}`}>
          <div className={styles.waitlistCopy}>
            <span className={styles.eyebrow}>베타 대기 신청</span>
            <h2 className={styles.h2List135}>
              첫 베타는
              <br />
              ChatGPT ↔ Claude부터
              <br />
              시작합니다.
            </h2>
            <p className={styles.sub}>
              <span className="nw">대기 신청자에게</span> <span className="nw">가장 먼저 체험 기회와</span>
              <br />
              초기 유저 혜택을 드립니다.
            </p>
          </div>
          <WaitlistForm />
        </section>

        {/* FAQ */}
        <section id="faq" data-section="faq" className={styles.faqSection}>
          <div className={`${styles.container} ${styles.faq}`}>
            <h2 className={styles.h2List}>자주 묻는 질문</h2>
            <FaqList />
          </div>
        </section>

        {/* 마지막 CTA */}
        <section data-section="final_cta" className={styles.final}>
          <div className={`${styles.container} ${styles.finalInner}`}>
            <h2 className={styles.h2Final}>
              다음 대화창에서는,
              <br />
              <strong className={styles.bold}>
                <span className="nw">처음부터</span> <span className="nw">설명하지 마세요.</span>
              </strong>
            </h2>
            <a href="#waitlist" className={styles.ctaWhite} data-cta="final_cta">
              베타 대기 신청하기
              <ArrowRight />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
