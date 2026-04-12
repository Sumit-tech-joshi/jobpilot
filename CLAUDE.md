# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js, port 3000)
npm run build    # Production build
npm run lint     # ESLint (no test suite configured)
```

No test framework is set up. Lint runs `eslint` with the `eslint-config-next` config.

## Environment Variables Required

```
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GROQ_API_KEY
ADZUNA_APP_ID
ADZUNA_APP_KEY
RESEND_API_KEY
```

## Architecture

### AI / Generation
Despite the file being named `lib/anthropic.ts`, **all AI calls go through Groq**, not Anthropic. The model is `llama-3.3-70b-versatile` via `groq-sdk`. The `@anthropic-ai/sdk` package is installed but not currently used for generation.

`lib/anthropic.ts` exports:
- `generateResume` / `generateCoverLetter` — legacy, uses hardcoded `data/master-profile.ts`
- `generateUniversalResume` / `generateUniversalCoverLetter` — profile-based, takes a DB profile object
- `analyseJobDescription` — extracts structured JSON from a raw JD
- `TWEAK_PROMPTS` — preset prompt modifiers (shorter, more_technical, etc.)

### Auth Flow
NextAuth v4 with JWT strategy (`lib/auth.ts`). Two providers: Google OAuth and Credentials.
- Credentials require email verification before login (`emailVerified` flag)
- `onboardingComplete` is stored on the `User` model and propagated into the JWT token
- `middleware.ts` protects all routes except `/login`, `/signup`, `/verify-email`, and `/api/auth/*`
- Incomplete onboarding → middleware redirects to `/onboarding`
- Update `onboardingComplete` in the session via `useSession().update({ onboardingComplete: true })` — avoids a DB round-trip by writing directly to the JWT

### Data Models (MongoDB via Mongoose)
- `models/User.ts` — auth fields + `onboardingComplete`, `industry`
- `models/Profile.ts` — full career profile (experience, education, skills, certifications, projects, etc.) linked 1:1 to User via `userId`

Profile data is passed to AI functions as a plain object; `buildProfileContext()` in `lib/anthropic.ts` serialises it to a structured string for the LLM prompt.

### Document Generation
Two output formats per resume:
- **PDF**: `lib/universal-pdf.tsx` via `@react-pdf/renderer`, rendered server-side to buffer
- **DOCX**: `lib/universal-docx.ts` via `docx` package

DOCX rule: use `LevelFormat.BULLET` with a numbering config. Never use unicode bullets (`•`) or `\n` inside paragraph text.

### API Routes (`app/api/`)
| Route | Purpose |
|---|---|
| `api/auth/[...nextauth]` | NextAuth handler |
| `api/auth/signup` | Register + send verification email |
| `api/auth/verify-email` | Consume verification token |
| `api/onboarding` | Save onboarding data to Profile + mark user complete |
| `api/profile` | CRUD for the user's Profile document |
| `api/generate/analyse` | Analyse a raw JD → structured JSON |
| `api/generate/universal` | Generate resume + cover letter from DB profile |
| `api/generate/save` | Persist a generated version |
| `api/generate/resume` | Legacy resume generation |
| `api/generate/coverletter` | Legacy cover letter generation |
| `api/generate/download` | Stream PDF/DOCX to client |
| `api/jobs` | Proxy to Adzuna job search |
| `api/applications` | Save/list job applications |
| `api/admin` | Admin utilities |

### Job Search
`lib/adzuna.ts` fetches from the Adzuna Canada API. Jobs are deduplicated by title + company name. Job IDs are prefixed with `adzuna_`.

### Pages
- `/jobs` — search, filter, browse jobs; click to generate docs
- `/generate` — paste a JD → analyse → generate resume + cover letter with tone/tweak controls + version history
- `/profile` — manage career profile used by universal generation
- `/onboarding` — 6-step profile setup on first login

### UI Conventions
- Dark theme: primary blue `#1F4E79`
- Tailwind CSS 4 only — no external UI component libraries
- `app/providers.tsx` wraps the app in `SessionProvider`
- React Compiler enabled (`reactCompiler: true` in `next.config.ts`)
