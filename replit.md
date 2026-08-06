# XpertAuth - Landing Page

## Overview
XpertAuth is a non-profit association landing page that combines human expertise with AI. Founded by José Luis Echezarreta (30 years in special transport). Three pillars: Special Transport Consulting, AI Implementation for SMEs, and Digital Literacy for seniors (free).

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js
- **Routing**: wouter (frontend), Express (API)
- **State Management**: TanStack React Query
- **Animations**: Framer Motion
- **Language**: TypeScript
- **i18n**: Custom React context-based system with fallback to Spanish

## i18n (Internationalization)
- **Supported Locales**: es (Spanish, default), ca (Catalan), en (English), fr (French)
- **URL Structure**: `/:locale` (e.g., `/es`, `/en`, `/fr`, `/ca`)
- **Translation Files**: `client/src/i18n/messages/{es,en,fr,ca}.ts`
- **Context Provider**: `client/src/i18n/context.tsx` - Provides `useI18n()` and `useTranslations(section)` hooks
- **Locale Switcher**: `client/src/components/locale-switcher.tsx` - Dropdown with flags in navbar
- **Fallback**: Empty Catalan keys fall back to Spanish (default locale)
- **Persistence**: Locale stored in localStorage (`xpertauth-locale`)
- **HTML lang**: Automatically updates `document.documentElement.lang`

## Architecture
Single-page landing site with 11 sections:
1. Navbar (fixed, Obsidian background, locale switcher)
2. Hero (particle effect background)
3. Problem/Solution (3 cards)
4. Services (stacked card scroll effect with accumulation from below, 8px peek, 150px scroll pause per card)
5. How It Works (scroll-driven horizontal image slider with grayscale-to-color hover)
6. Pricing / Membership tiers (3 plans)
7. Social Proof / Authority
8. Senior Training (Ember accent)
9. Blog + Newsletter
10. Final CTA
11. Footer

## Color Palette
- Obsidian: #0A0E1A (dark backgrounds)
- XpertBlue: #1B4FD8 (CTAs, primary actions)
- Arctic: #4D9FEC (accents, hover)
- Mist: #F4F6FA (light section backgrounds)
- Ember: #E8620A (senior section, badges)
- Pure: #FFFFFF (text on dark)

## Typography
- Sora: headings (`font-heading`)
- Inter: body text (`font-sans`)
- JetBrains Mono: code/data (`font-mono`)

## API Endpoints
- `POST /api/waitlist` - Join waitlist (name, email, type) — legacy, uses MemStorage
- `POST /api/newsletter` - Newsletter signup (email) — uses MemStorage
- `POST /api/socios` - Register as member (nombre, email, tipo_socio, acepta_privacidad) — writes to Supabase `socios` table

## Pricing Registration Flows
- **Free plan** → Opens modal (name + email), saves to Supabase with `tipo_socio='gratuito'`
- **Individual plan** → Opens modal (name + email + fee acceptance checkbox), saves with `tipo_socio='individual'`
- **Corporate plan** → Scrolls to footer contact section (`id="contacto"`)

## Key Components
- `client/src/components/navbar.tsx` - Fixed navigation with locale switcher
- `client/src/components/locale-switcher.tsx` - Language dropdown
- `client/src/components/hero.tsx` - Hero with particle canvas
- `client/src/components/problem-solution.tsx` - Problem/Solution cards
- `client/src/components/services.tsx` - Stacked card scroll effect (cards accumulate from below)
- `client/src/components/how-it-works.tsx` - Horizontal image slider (scroll-driven, Supabase images)
- `client/src/components/pricing.tsx` - Membership plans with 3 registration flows
- `client/src/components/waitlist-modal.tsx` - Socio registration modal (free/individual)
- `client/src/components/social-proof.tsx` - Stats + testimonials
- `client/src/components/senior-training.tsx` - Senior program section
- `client/src/components/blog-newsletter.tsx` - Blog + newsletter
- `client/src/components/cta-final.tsx` - Final CTA
- `client/src/components/footer.tsx` - Footer

## Supabase Storage
- **Project URL**: `https://supabase.xpertauth.com`
- **Bucket**: `web-images` (public)
- **Logo**: `logo/logo_xpertauth_icon_v1.png`
- **How It Works images**: `como-funciona/paso{1-4}_*_v1.webp`
- **Service Key**: stored as `SUPABASE_SERVICE_KEY` secret

## Storage
- **MemStorage**: In-memory storage for waitlist and newsletter (legacy)
- **Supabase**: `socios` table for member registrations (via `server/supabase.ts`)
- **Supabase Storage**: Public bucket `web-images` for images

## Contact Info
- Web: www.xpertauth.com
- Email: info@xpertauth.com
- Phone: +34 625 897 546
