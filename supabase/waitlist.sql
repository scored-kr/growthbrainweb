-- Growth Brain 웨이트리스트 테이블
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run

create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  ai_tools     text[] not null default '{}',   -- chatgpt, claude, gemini, other
  ai_other     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,
  consent_at   timestamptz not null default now(),  -- 개인정보 수집·이용 동의 시각
  created_at   timestamptz not null default now()
);

-- 대소문자 달라도 같은 이메일은 중복으로 막기
create unique index if not exists waitlist_email_lower_idx on public.waitlist (lower(email));

-- RLS 켜고 정책은 만들지 않음 → anon 키로는 읽기·쓰기 불가, 서버(service_role)만 저장 가능
alter table public.waitlist enable row level security;
