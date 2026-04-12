'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface SkillCategory { id: string; categoryName: string; skills: string[] }
interface Experience {
  id: string; jobTitle: string; employer: string; location: string
  startDate: string; endDate: string; currentRole: boolean
  employmentType: string; industry: string; description: string; achievements: string[]
}
interface Education {
  id: string; credential: string; institution: string; location: string
  fieldOfStudy: string; startDate: string; endDate: string; current: boolean; notes: string
}
interface Certification {
  id: string; name: string; issuingBody: string; issueDate: string
  expiryDate: string; credentialId: string
}
interface Project {
  id: string; name: string; description: string; role: string
  techOrTools: string[]; url: string; highlights: string[]
}
interface Language { language: string; proficiency: string }
interface Volunteer {
  id: string; role: string; organization: string
  startDate: string; endDate: string; description: string
}
interface ProfileData {
  fullName: string; headline: string; phone: string; location: string; email: string
  portfolio: string; linkedin: string; github: string; website: string
  summary: string; workAuthorization: string
  skillCategories: SkillCategory[]
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  projects: Project[]
  languages: Language[]
  volunteer: Volunteer[]
  careerObjective: string; standoutFacts: string
  workEnvironment: string; availability: string; aiContext: string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type SectionId = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'languages' | 'additional'

/* ─────────────────────────────────────────────
   Sidebar config
───────────────────────────────────────────── */
const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'personal',       label: 'Personal Info',         icon: <IconUser /> },
  { id: 'summary',        label: 'Summary',               icon: <IconFile /> },
  { id: 'experience',     label: 'Experience',            icon: <IconBriefcase /> },
  { id: 'education',      label: 'Education',             icon: <IconGraduate /> },
  { id: 'skills',         label: 'Skills',                icon: <IconZap /> },
  { id: 'certifications', label: 'Certifications',        icon: <IconAward /> },
  { id: 'projects',       label: 'Projects',              icon: <IconFolder /> },
  { id: 'languages',      label: 'Languages & Volunteer', icon: <IconGlobe /> },
  { id: 'additional',     label: 'Additional Info',       icon: <IconSparkle /> },
]

const WORK_AUTH = [
  'Canadian Citizen','Permanent Resident (Canada)','Open Work Permit (Canada)',
  'Employer-Specific Work Permit','US Citizen','US Green Card',
  'US Work Visa (H-1B / TN / OPT)','EU Citizen','UK Citizen','UK Work Visa',
  'Australian Citizen / PR','Other',
]
const PROFICIENCY = ['Native','Fluent','Professional','Conversational','Basic']
const EMPLOYMENT_TYPES = ['Full-time','Part-time','Contract','Freelance','Internship','Apprenticeship','Casual / On-call']

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function uid() { return `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

function emptyProfile(): ProfileData {
  return {
    fullName: '', headline: '', phone: '', location: '', email: '',
    portfolio: '', linkedin: '', github: '', website: '',
    summary: '', workAuthorization: '',
    skillCategories: [], experience: [], education: [],
    certifications: [], projects: [], languages: [], volunteer: [],
    careerObjective: '', standoutFacts: '', workEnvironment: '', availability: '', aiContext: '',
  }
}

function calcCompletion(p: ProfileData): number {
  let score = 0
  if (p.fullName && p.headline) score += 20
  if (p.summary && p.summary.length > 20) score += 15
  if (p.experience.length > 0) score += 25
  if (p.education.length > 0) score += 15
  if (p.skillCategories.some(c => c.skills.length > 0)) score += 15
  if (p.aiContext || p.careerObjective) score += 10
  return score
}

function sectionHasData(id: SectionId, p: ProfileData): boolean {
  switch (id) {
    case 'personal':       return !!(p.fullName || p.headline)
    case 'summary':        return p.summary.length > 10
    case 'experience':     return p.experience.length > 0
    case 'education':      return p.education.length > 0
    case 'skills':         return p.skillCategories.length > 0
    case 'certifications': return p.certifications.length > 0
    case 'projects':       return p.projects.length > 0
    case 'languages':      return p.languages.length > 0 || p.volunteer.length > 0
    case 'additional':     return !!(p.aiContext || p.careerObjective || p.standoutFacts)
  }
}

/* ─────────────────────────────────────────────
   Shared UI
───────────────────────────────────────────── */
const ic = 'w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 rounded-xl text-white placeholder-[#484f58] outline-none transition-all duration-200 text-sm'
const sc = 'w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 rounded-xl text-white outline-none transition-all duration-200 text-sm appearance-none cursor-pointer'
const tc = 'w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 rounded-xl text-white placeholder-[#484f58] outline-none transition-all duration-200 text-sm resize-none'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-2">{label}</label>
      {children}
      {hint && <p className="text-[#484f58] text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 pb-5 border-b border-[#21262d]">
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      <p className="text-[#8b949e] text-sm">{description}</p>
    </div>
  )
}

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'saving'}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        state === 'saving' ? 'bg-[#1F4E79]/50 text-white/50 cursor-not-allowed' :
        state === 'saved'  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' :
        state === 'error'  ? 'bg-red-500/20 border border-red-500/40 text-red-400' :
        'bg-[#1F4E79] hover:bg-[#2563a8] text-white'
      }`}
    >
      {state === 'saving' && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
      {state === 'saved'  && <span className="text-emerald-400">✓</span>}
      {state === 'error'  && <span>⚠</span>}
      {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : state === 'error' ? 'Failed — retry' : 'Save Changes'}
    </button>
  )
}

function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [val, setVal] = useState('')
  function add() {
    const s = val.trim()
    if (s && !tags.includes(s)) onChange([...tags, s])
    setVal('')
  }
  function remove(s: string) { onChange(tags.filter(t => t !== s)) }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !val && tags.length) onChange(tags.slice(0, -1))
  }
  return (
    <div className="bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] focus-within:border-[#1F4E79] focus-within:ring-2 focus-within:ring-[#1F4E79]/20 rounded-xl p-3 transition-all duration-200 min-h-[48px]">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1F4E79]/20 border border-[#1F4E79]/40 text-[#79b8ff] rounded-lg text-xs">
            {t}
            <button onClick={() => remove(t)} className="text-[#4a9eda]/60 hover:text-red-400 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
      </div>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={onKey} placeholder={tags.length === 0 ? placeholder : '+ add more'} className="bg-transparent text-white placeholder-[#484f58] text-sm outline-none w-full" />
    </div>
  )
}

function useSave(onSaved?: (data: Partial<ProfileData>) => void) {
  const [state, setState] = useState<SaveState>('idle')
  const save = useCallback(async (data: Partial<ProfileData>) => {
    setState('saving')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setState('saved')
      onSaved?.(data)
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }, [onSaved])
  return { state, save }
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData>(emptyProfile())
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<SectionId>('personal')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setProfile({ ...emptyProfile(), ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function onProfileChange(partial: Partial<ProfileData>) {
    setProfile(p => ({ ...p, ...partial }))
  }

  const completion = calcCompletion(profile)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#161b22] rounded-xl w-48" />
          <div className="h-2 bg-[#161b22] rounded-full w-full" />
          <div className="flex gap-6 mt-8">
            <div className="w-56 h-96 bg-[#161b22] rounded-2xl shrink-0" />
            <div className="flex-1 h-96 bg-[#161b22] rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-[#8b949e] text-sm mt-1">
              {session?.user?.name} · Keep this updated for the best AI-generated documents
            </p>
          </div>
          <Link
            href="/generate"
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#1F4E79]/20 hover:bg-[#1F4E79]/30 border border-[#1F4E79]/40 text-[#4a9eda] rounded-xl text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Generate Resume
          </Link>
        </div>

        {/* Completion bar */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm text-[#c9d1d9] font-medium">Profile completion</span>
            <span className="text-sm font-bold" style={{ color: completion >= 75 ? '#3fb950' : completion >= 40 ? '#e3b341' : '#4a9eda' }}>
              {completion}%
            </span>
          </div>
          <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completion}%`,
                background: completion >= 75 ? 'linear-gradient(90deg,#238636,#3fb950)' :
                            completion >= 40 ? 'linear-gradient(90deg,#9e6a03,#e3b341)' :
                            'linear-gradient(90deg,#1F4E79,#4a9eda)',
              }}
            />
          </div>
          {completion < 100 && (
            <p className="text-[#484f58] text-xs mt-2">
              {completion < 40 ? 'Add your experience and education to get started.' :
               completion < 75 ? 'Looking good — add a summary and skills to improve results.' :
               'Almost there — fill in Additional Info to reach 100%.'}
            </p>
          )}
        </div>
      </div>

      {/* ── Mobile section tabs ── */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeSection === s.id
                ? 'bg-[#1F4E79]/20 border border-[#1F4E79]/50 text-[#4a9eda]'
                : 'bg-[#161b22] border border-[#30363d] text-[#8b949e]'
            }`}
          >
            <span className="w-3.5 h-3.5">{s.icon}</span>
            {s.label}
            {sectionHasData(s.id, profile) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-6 items-start">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-24">
          <nav className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
            {SECTIONS.map((s, i) => {
              const active = activeSection === s.id
              const filled = sectionHasData(s.id, profile)
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all duration-150 ${
                    i < SECTIONS.length - 1 ? 'border-b border-[#21262d]' : ''
                  } ${active ? 'bg-[#1F4E79]/15 text-[#4a9eda]' : 'text-[#8b949e] hover:bg-white/[0.04] hover:text-[#c9d1d9]'}`}
                >
                  <span className={`w-4 h-4 shrink-0 ${active ? 'text-[#4a9eda]' : 'text-[#484f58]'}`}>{s.icon}</span>
                  <span className="flex-1 font-medium leading-tight">{s.label}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${filled ? 'bg-emerald-500' : 'bg-[#30363d]'}`} />
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ── Section content ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 md:p-8">
            {activeSection === 'personal'       && <PersonalSection       profile={profile} onChange={onProfileChange} />}
            {activeSection === 'summary'        && <SummarySection        profile={profile} onChange={onProfileChange} />}
            {activeSection === 'experience'     && <ExperienceSection     profile={profile} onChange={onProfileChange} />}
            {activeSection === 'education'      && <EducationSection      profile={profile} onChange={onProfileChange} />}
            {activeSection === 'skills'         && <SkillsSection         profile={profile} onChange={onProfileChange} />}
            {activeSection === 'certifications' && <CertificationsSection profile={profile} onChange={onProfileChange} />}
            {activeSection === 'projects'       && <ProjectsSection       profile={profile} onChange={onProfileChange} />}
            {activeSection === 'languages'      && <LanguagesVolunteerSection profile={profile} onChange={onProfileChange} />}
            {activeSection === 'additional'     && <AdditionalSection     profile={profile} onChange={onProfileChange} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 1 — Personal Info
───────────────────────────────────────────── */
function PersonalSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [d, setD] = useState({ fullName: profile.fullName, headline: profile.headline, phone: profile.phone, location: profile.location, email: profile.email, workAuthorization: profile.workAuthorization, portfolio: profile.portfolio, linkedin: profile.linkedin, github: profile.github, website: profile.website })
  const { state, save } = useSave(onChange)
  const p = (k: keyof typeof d) => (v: string) => setD(x => ({ ...x, [k]: v }))
  return (
    <div>
      <SectionHeader title="Personal Info" description="This appears at the top of every resume and cover letter." />
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full name"><input className={ic} value={d.fullName} onChange={e => p('fullName')(e.target.value)} placeholder="Jane Smith" /></Field>
          <Field label="Professional headline"><input className={ic} value={d.headline} onChange={e => p('headline')(e.target.value)} placeholder="e.g. Registered Nurse | 8 years experience" /></Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Email"><input className={ic} type="email" value={d.email} onChange={e => p('email')(e.target.value)} placeholder="you@example.com" /></Field>
          <Field label="Phone"><input className={ic} value={d.phone} onChange={e => p('phone')(e.target.value)} placeholder="+1 (604) 555-0100" /></Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Location"><input className={ic} value={d.location} onChange={e => p('location')(e.target.value)} placeholder="Vancouver, BC, Canada" /></Field>
          <Field label="Work authorization">
            <select className={sc} value={d.workAuthorization} onChange={e => p('workAuthorization')(e.target.value)}>
              <option value="">Select…</option>
              {WORK_AUTH.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div className="pt-2 border-t border-[#21262d]">
          <p className="text-xs text-[#484f58] uppercase tracking-wider font-medium mb-4">Online presence (optional)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="LinkedIn URL"><input className={ic} value={d.linkedin} onChange={e => p('linkedin')(e.target.value)} placeholder="linkedin.com/in/yourname" /></Field>
            <Field label="Portfolio / website"><input className={ic} value={d.portfolio} onChange={e => p('portfolio')(e.target.value)} placeholder="yoursite.com" /></Field>
            <Field label="GitHub"><input className={ic} value={d.github} onChange={e => p('github')(e.target.value)} placeholder="github.com/yourhandle" /></Field>
            <Field label="Other website"><input className={ic} value={d.website} onChange={e => p('website')(e.target.value)} placeholder="Any other link" /></Field>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save(d)} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 2 — Summary
───────────────────────────────────────────── */
function SummarySection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [summary, setSummary] = useState(profile.summary)
  const { state, save } = useSave(onChange)
  return (
    <div>
      <SectionHeader title="Professional Summary" description="2–4 sentences that appear at the top of your resume. Write in first person." />
      <Field label="Summary" hint="Tip: mention your years of experience, key strengths, and what type of role you're targeting.">
        <textarea className={tc} rows={5} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Results-oriented professional with X years of experience in..." />
      </Field>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-xs ${summary.length > 600 ? 'text-red-400' : 'text-[#484f58]'}`}>{summary.length} characters</span>
      </div>
      <div className="flex justify-end mt-5 pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ summary })} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 3 — Experience
───────────────────────────────────────────── */
function ExperienceSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [items, setItems] = useState<Experience[]>(profile.experience.map(e => ({ ...e, id: e.id || uid() })))
  const [expandedId, setExpandedId] = useState<string | null>(items.length === 0 ? null : null)
  const { state, save } = useSave(d => onChange(d))

  function add() {
    const id = uid()
    const blank: Experience = { id, jobTitle: '', employer: '', location: '', startDate: '', endDate: '', currentRole: false, employmentType: 'Full-time', industry: '', description: '', achievements: [] }
    setItems(p => [blank, ...p])
    setExpandedId(id)
  }
  function update(id: string, fields: Partial<Experience>) {
    setItems(p => p.map(x => x.id === id ? { ...x, ...fields } : x))
  }
  function remove(id: string) {
    setItems(p => p.filter(x => x.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div>
      <SectionHeader title="Experience" description="List your roles in reverse chronological order." />
      <div className="space-y-3 mb-5">
        {items.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#30363d] rounded-2xl">
            <p className="text-[#484f58] text-sm mb-3">No experience entries yet.</p>
            <button onClick={add} className="text-[#4a9eda] text-sm hover:text-[#79b8ff] transition-colors">+ Add your first role</button>
          </div>
        )}
        {items.map(item => (
          <ExperienceCard
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onUpdate={f => update(item.id, f)}
            onDelete={() => remove(item.id)}
          />
        ))}
      </div>
      {items.length > 0 && (
        <button onClick={add} className="w-full py-3 border border-dashed border-[#30363d] hover:border-[#1F4E79]/50 hover:bg-[#1F4E79]/5 rounded-xl text-[#8b949e] hover:text-[#4a9eda] text-sm transition-all duration-200 mb-5">
          + Add another role
        </button>
      )}
      <div className="flex justify-end pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ experience: items })} />
      </div>
    </div>
  )
}

function ExperienceCard({ item, expanded, onToggle, onUpdate, onDelete }: {
  item: Experience; expanded: boolean
  onToggle: () => void; onUpdate: (f: Partial<Experience>) => void; onDelete: () => void
}) {
  return (
    <div className="border border-[#30363d] rounded-xl overflow-hidden">
      {/* Header row */}
      <div className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${expanded ? 'bg-[#1F4E79]/10' : 'hover:bg-white/[0.03]'}`} onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{item.jobTitle || <span className="text-[#484f58]">Job title</span>}</p>
          <p className="text-[#8b949e] text-xs truncate mt-0.5">
            {item.employer || 'Employer'}{item.location ? ` · ${item.location}` : ''}{item.startDate ? ` · ${item.startDate} – ${item.currentRole ? 'Present' : item.endDate || '?'}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1.5 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <svg className={`w-4 h-4 text-[#484f58] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {/* Edit form */}
      {expanded && (
        <div className="px-4 pb-5 pt-4 border-t border-[#21262d] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Job title"><input className={ic} value={item.jobTitle} onChange={e => onUpdate({ jobTitle: e.target.value })} placeholder="e.g. Software Developer" /></Field>
            <Field label="Employer"><input className={ic} value={item.employer} onChange={e => onUpdate({ employer: e.target.value })} placeholder="Company name" /></Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Location"><input className={ic} value={item.location} onChange={e => onUpdate({ location: e.target.value })} placeholder="e.g. Toronto, ON" /></Field>
            <Field label="Employment type">
              <select className={sc} value={item.employmentType} onChange={e => onUpdate({ employmentType: e.target.value })}>
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Start date"><input className={ic} value={item.startDate} onChange={e => onUpdate({ startDate: e.target.value })} placeholder="e.g. Jan 2022" /></Field>
            <Field label="End date">
              <input className={`${ic} ${item.currentRole ? 'opacity-40 cursor-not-allowed' : ''}`} value={item.endDate} disabled={item.currentRole} onChange={e => onUpdate({ endDate: e.target.value })} placeholder="e.g. Dec 2024" />
            </Field>
          </div>
          <Checkbox label="I currently work here" checked={item.currentRole} onChange={v => onUpdate({ currentRole: v, endDate: v ? '' : item.endDate })} />
          <Field label="Industry (optional)"><input className={ic} value={item.industry} onChange={e => onUpdate({ industry: e.target.value })} placeholder="e.g. Healthcare, Finance, Tech" /></Field>
          <Field label="Description" hint="Describe your responsibilities and achievements. Bullet points or prose both work.">
            <textarea className={tc} rows={4} value={item.description} onChange={e => onUpdate({ description: e.target.value })} placeholder="What did you do in this role? What did you achieve?" />
          </Field>
          <Field label="Key achievements" hint="Press Enter after each one.">
            <TagInput tags={item.achievements} onChange={v => onUpdate({ achievements: v })} placeholder="e.g. Reduced costs by 30% · Led team of 8" />
          </Field>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 4 — Education
───────────────────────────────────────────── */
function EducationSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [items, setItems] = useState<Education[]>(profile.education.map(e => ({ ...e, id: e.id || uid() })))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { state, save } = useSave(onChange)

  function add() {
    const id = uid()
    const blank: Education = { id, credential: '', institution: '', location: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, notes: '' }
    setItems(p => [blank, ...p])
    setExpandedId(id)
  }
  function update(id: string, fields: Partial<Education>) { setItems(p => p.map(x => x.id === id ? { ...x, ...fields } : x)) }
  function remove(id: string) { setItems(p => p.filter(x => x.id !== id)); if (expandedId === id) setExpandedId(null) }

  return (
    <div>
      <SectionHeader title="Education" description="Degrees, diplomas, trade certificates, bootcamps — anything goes." />
      <div className="space-y-3 mb-5">
        {items.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#30363d] rounded-2xl">
            <p className="text-[#484f58] text-sm mb-3">No education entries yet.</p>
            <button onClick={add} className="text-[#4a9eda] text-sm hover:text-[#79b8ff] transition-colors">+ Add your first qualification</button>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="border border-[#30363d] rounded-xl overflow-hidden">
            <div className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${expandedId === item.id ? 'bg-[#1F4E79]/10' : 'hover:bg-white/[0.03]'}`} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.credential || <span className="text-[#484f58]">Credential</span>}</p>
                <p className="text-[#8b949e] text-xs truncate mt-0.5">{item.institution || 'Institution'}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ''}{item.endDate ? ` · ${item.endDate}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={e => { e.stopPropagation(); remove(item.id) }} className="p-1.5 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <svg className={`w-4 h-4 text-[#484f58] transition-transform duration-200 ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {expandedId === item.id && (
              <div className="px-4 pb-5 pt-4 border-t border-[#21262d] space-y-4">
                <Field label="Credential / qualification"><input className={ic} value={item.credential} onChange={e => update(item.id, { credential: e.target.value })} placeholder="e.g. Bachelor of Science, Red Seal Certificate" /></Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Institution"><input className={ic} value={item.institution} onChange={e => update(item.id, { institution: e.target.value })} placeholder="University or college name" /></Field>
                  <Field label="Field of study"><input className={ic} value={item.fieldOfStudy} onChange={e => update(item.id, { fieldOfStudy: e.target.value })} placeholder="e.g. Computer Science, Electrical" /></Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Location"><input className={ic} value={item.location} onChange={e => update(item.id, { location: e.target.value })} placeholder="e.g. Toronto, ON" /></Field>
                  <Field label="Start date"><input className={ic} value={item.startDate} onChange={e => update(item.id, { startDate: e.target.value })} placeholder="e.g. Sep 2018" /></Field>
                </div>
                <Field label="Year completed / expected">
                  <input className={`${ic} ${item.current ? 'opacity-40 cursor-not-allowed' : ''}`} value={item.endDate} disabled={item.current} onChange={e => update(item.id, { endDate: e.target.value })} placeholder="e.g. 2022" />
                </Field>
                <Checkbox label="Currently studying" checked={item.current} onChange={v => update(item.id, { current: v, endDate: '' })} />
                <Field label="Notes (optional)"><input className={ic} value={item.notes} onChange={e => update(item.id, { notes: e.target.value })} placeholder="e.g. GPA, honours, relevant coursework" /></Field>
              </div>
            )}
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <button onClick={add} className="w-full py-3 border border-dashed border-[#30363d] hover:border-[#1F4E79]/50 hover:bg-[#1F4E79]/5 rounded-xl text-[#8b949e] hover:text-[#4a9eda] text-sm transition-all duration-200 mb-5">
          + Add another qualification
        </button>
      )}
      <div className="flex justify-end pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ education: items })} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 5 — Skills
───────────────────────────────────────────── */
function SkillsSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [cats, setCats] = useState<SkillCategory[]>(profile.skillCategories.map(c => ({ ...c, id: c.id || uid() })))
  const { state, save } = useSave(onChange)

  function addCat() {
    setCats(p => [...p, { id: uid(), categoryName: '', skills: [] }])
  }
  function updateCat(id: string, fields: Partial<SkillCategory>) {
    setCats(p => p.map(c => c.id === id ? { ...c, ...fields } : c))
  }
  function removeCat(id: string) { setCats(p => p.filter(c => c.id !== id)) }

  return (
    <div>
      <SectionHeader title="Skills" description="Organise your skills into categories. Each category appears as its own section on your resume." />
      <div className="space-y-4 mb-5">
        {cats.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#30363d] rounded-2xl">
            <p className="text-[#484f58] text-sm mb-3">No skill categories yet.</p>
            <button onClick={addCat} className="text-[#4a9eda] text-sm hover:text-[#79b8ff] transition-colors">+ Add your first category</button>
          </div>
        )}
        {cats.map(cat => (
          <div key={cat.id} className="border border-[#30363d] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                className={`${ic} flex-1`}
                value={cat.categoryName}
                onChange={e => updateCat(cat.id, { categoryName: e.target.value })}
                placeholder="Category name — e.g. Technical Skills, Tools, Soft Skills"
              />
              <button onClick={() => removeCat(cat.id)} className="p-2 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <TagInput tags={cat.skills} onChange={v => updateCat(cat.id, { skills: v })} placeholder="Type a skill and press Enter" />
          </div>
        ))}
      </div>
      {cats.length > 0 && (
        <button onClick={addCat} className="w-full py-3 border border-dashed border-[#30363d] hover:border-[#1F4E79]/50 hover:bg-[#1F4E79]/5 rounded-xl text-[#8b949e] hover:text-[#4a9eda] text-sm transition-all duration-200 mb-5">
          + Add another category
        </button>
      )}
      <div className="flex justify-end pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ skillCategories: cats })} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 6 — Certifications
───────────────────────────────────────────── */
function CertificationsSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [items, setItems] = useState<Certification[]>(profile.certifications.map(c => ({ ...c, id: c.id || uid() })))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { state, save } = useSave(onChange)

  function add() {
    const id = uid()
    setItems(p => [...p, { id, name: '', issuingBody: '', issueDate: '', expiryDate: '', credentialId: '' }])
    setExpandedId(id)
  }
  function update(id: string, f: Partial<Certification>) { setItems(p => p.map(x => x.id === id ? { ...x, ...f } : x)) }
  function remove(id: string) { setItems(p => p.filter(x => x.id !== id)); if (expandedId === id) setExpandedId(null) }

  return (
    <div>
      <SectionHeader title="Certifications & Licences" description="Professional certifications, licences, trade credentials — anything that shows qualification." />
      <div className="space-y-3 mb-5">
        {items.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#30363d] rounded-2xl">
            <p className="text-[#484f58] text-sm mb-3">No certifications added yet.</p>
            <button onClick={add} className="text-[#4a9eda] text-sm hover:text-[#79b8ff] transition-colors">+ Add a certification</button>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="border border-[#30363d] rounded-xl overflow-hidden">
            <div className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${expandedId === item.id ? 'bg-[#1F4E79]/10' : 'hover:bg-white/[0.03]'}`} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.name || <span className="text-[#484f58]">Certification name</span>}</p>
                <p className="text-[#8b949e] text-xs truncate mt-0.5">{item.issuingBody || 'Issuing body'}{item.issueDate ? ` · ${item.issueDate}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={e => { e.stopPropagation(); remove(item.id) }} className="p-1.5 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <svg className={`w-4 h-4 text-[#484f58] transition-transform duration-200 ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {expandedId === item.id && (
              <div className="px-4 pb-5 pt-4 border-t border-[#21262d] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Certification name"><input className={ic} value={item.name} onChange={e => update(item.id, { name: e.target.value })} placeholder="e.g. AWS Solutions Architect, Red Seal" /></Field>
                  <Field label="Issuing organisation"><input className={ic} value={item.issuingBody} onChange={e => update(item.id, { issuingBody: e.target.value })} placeholder="e.g. Amazon, ITA BC" /></Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Issue date"><input className={ic} value={item.issueDate} onChange={e => update(item.id, { issueDate: e.target.value })} placeholder="e.g. Mar 2023" /></Field>
                  <Field label="Expiry date (if any)"><input className={ic} value={item.expiryDate} onChange={e => update(item.id, { expiryDate: e.target.value })} placeholder="e.g. Mar 2026" /></Field>
                  <Field label="Credential ID (optional)"><input className={ic} value={item.credentialId} onChange={e => update(item.id, { credentialId: e.target.value })} placeholder="ID or badge URL" /></Field>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <button onClick={add} className="w-full py-3 border border-dashed border-[#30363d] hover:border-[#1F4E79]/50 hover:bg-[#1F4E79]/5 rounded-xl text-[#8b949e] hover:text-[#4a9eda] text-sm transition-all duration-200 mb-5">
          + Add another certification
        </button>
      )}
      <div className="flex justify-end pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ certifications: items })} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 7 — Projects
───────────────────────────────────────────── */
function ProjectsSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [items, setItems] = useState<Project[]>(profile.projects.map(p => ({ ...p, id: p.id || uid() })))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { state, save } = useSave(onChange)

  function add() {
    const id = uid()
    setItems(p => [...p, { id, name: '', description: '', role: '', techOrTools: [], url: '', highlights: [] }])
    setExpandedId(id)
  }
  function update(id: string, f: Partial<Project>) { setItems(p => p.map(x => x.id === id ? { ...x, ...f } : x)) }
  function remove(id: string) { setItems(p => p.filter(x => x.id !== id)); if (expandedId === id) setExpandedId(null) }

  return (
    <div>
      <SectionHeader title="Projects & Portfolio" description="Personal projects, freelance work, open-source contributions, or notable work samples." />
      <div className="space-y-3 mb-5">
        {items.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#30363d] rounded-2xl">
            <p className="text-[#484f58] text-sm mb-3">No projects added yet.</p>
            <button onClick={add} className="text-[#4a9eda] text-sm hover:text-[#79b8ff] transition-colors">+ Add a project</button>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="border border-[#30363d] rounded-xl overflow-hidden">
            <div className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${expandedId === item.id ? 'bg-[#1F4E79]/10' : 'hover:bg-white/[0.03]'}`} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.name || <span className="text-[#484f58]">Project name</span>}</p>
                <p className="text-[#8b949e] text-xs truncate mt-0.5">{item.role || 'Your role'}{item.techOrTools.length ? ` · ${item.techOrTools.slice(0, 3).join(', ')}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={e => { e.stopPropagation(); remove(item.id) }} className="p-1.5 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <svg className={`w-4 h-4 text-[#484f58] transition-transform duration-200 ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {expandedId === item.id && (
              <div className="px-4 pb-5 pt-4 border-t border-[#21262d] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Project name"><input className={ic} value={item.name} onChange={e => update(item.id, { name: e.target.value })} placeholder="e.g. E-Commerce Platform" /></Field>
                  <Field label="Your role"><input className={ic} value={item.role} onChange={e => update(item.id, { role: e.target.value })} placeholder="e.g. Lead Developer, Designer" /></Field>
                </div>
                <Field label="Description"><textarea className={tc} rows={3} value={item.description} onChange={e => update(item.id, { description: e.target.value })} placeholder="What is this project? What problem does it solve?" /></Field>
                <Field label="Technologies / tools used" hint="Press Enter after each one.">
                  <TagInput tags={item.techOrTools} onChange={v => update(item.id, { techOrTools: v })} placeholder="e.g. React, Node.js, Figma" />
                </Field>
                <Field label="Key highlights" hint="Measurable outcomes or notable achievements. Press Enter after each.">
                  <TagInput tags={item.highlights} onChange={v => update(item.id, { highlights: v })} placeholder="e.g. 10k active users · 99.9% uptime" />
                </Field>
                <Field label="URL (optional)"><input className={ic} value={item.url} onChange={e => update(item.id, { url: e.target.value })} placeholder="https://github.com/... or live URL" /></Field>
              </div>
            )}
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <button onClick={add} className="w-full py-3 border border-dashed border-[#30363d] hover:border-[#1F4E79]/50 hover:bg-[#1F4E79]/5 rounded-xl text-[#8b949e] hover:text-[#4a9eda] text-sm transition-all duration-200 mb-5">
          + Add another project
        </button>
      )}
      <div className="flex justify-end pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ projects: items })} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 8 — Languages & Volunteer
───────────────────────────────────────────── */
function LanguagesVolunteerSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [langs, setLangs] = useState<Language[]>(profile.languages.length ? profile.languages : [])
  const [vols, setVols] = useState<Volunteer[]>(profile.volunteer.map(v => ({ ...v, id: v.id || uid() })))
  const [expandedVolId, setExpandedVolId] = useState<string | null>(null)
  const { state, save } = useSave(onChange)

  function addLang() { setLangs(p => [...p, { language: '', proficiency: 'Professional' }]) }
  function updateLang(i: number, f: Partial<Language>) { setLangs(p => p.map((x, idx) => idx === i ? { ...x, ...f } : x)) }
  function removeLang(i: number) { setLangs(p => p.filter((_, idx) => idx !== i)) }

  function addVol() {
    const id = uid()
    setVols(p => [...p, { id, role: '', organization: '', startDate: '', endDate: '', description: '' }])
    setExpandedVolId(id)
  }
  function updateVol(id: string, f: Partial<Volunteer>) { setVols(p => p.map(x => x.id === id ? { ...x, ...f } : x)) }
  function removeVol(id: string) { setVols(p => p.filter(x => x.id !== id)); if (expandedVolId === id) setExpandedVolId(null) }

  return (
    <div>
      <SectionHeader title="Languages & Volunteer" description="Language skills and community involvement — both strengthen your profile." />

      {/* Languages */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#c9d1d9]">Languages spoken</p>
          <button onClick={addLang} className="text-xs text-[#4a9eda] hover:text-[#79b8ff] transition-colors">+ Add language</button>
        </div>
        {langs.length === 0 ? (
          <p className="text-[#484f58] text-sm py-4 text-center border border-dashed border-[#30363d] rounded-xl">No languages added. <button onClick={addLang} className="text-[#4a9eda] hover:underline">Add one</button></p>
        ) : (
          <div className="space-y-2">
            {langs.map((lang, i) => (
              <div key={i} className="flex items-center gap-3">
                <input className={`${ic} flex-1`} value={lang.language} onChange={e => updateLang(i, { language: e.target.value })} placeholder="e.g. Spanish, French" />
                <select className={`${sc} w-40 shrink-0`} value={lang.proficiency} onChange={e => updateLang(i, { proficiency: e.target.value })}>
                  {PROFICIENCY.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={() => removeLang(i)} className="p-2 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volunteer */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#c9d1d9]">Volunteer & community work</p>
          <button onClick={addVol} className="text-xs text-[#4a9eda] hover:text-[#79b8ff] transition-colors">+ Add volunteer role</button>
        </div>
        <div className="space-y-3">
          {vols.length === 0 && (
            <p className="text-[#484f58] text-sm py-4 text-center border border-dashed border-[#30363d] rounded-xl">No volunteer roles added. <button onClick={addVol} className="text-[#4a9eda] hover:underline">Add one</button></p>
          )}
          {vols.map(vol => (
            <div key={vol.id} className="border border-[#30363d] rounded-xl overflow-hidden">
              <div className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${expandedVolId === vol.id ? 'bg-[#1F4E79]/10' : 'hover:bg-white/[0.03]'}`} onClick={() => setExpandedVolId(expandedVolId === vol.id ? null : vol.id)}>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{vol.role || <span className="text-[#484f58]">Role</span>}</p>
                  <p className="text-[#8b949e] text-xs truncate mt-0.5">{vol.organization || 'Organisation'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={e => { e.stopPropagation(); removeVol(vol.id) }} className="p-1.5 text-[#484f58] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <svg className={`w-4 h-4 text-[#484f58] transition-transform duration-200 ${expandedVolId === vol.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {expandedVolId === vol.id && (
                <div className="px-4 pb-5 pt-4 border-t border-[#21262d] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Role"><input className={ic} value={vol.role} onChange={e => updateVol(vol.id, { role: e.target.value })} placeholder="e.g. Mentor, Food Bank Volunteer" /></Field>
                    <Field label="Organisation"><input className={ic} value={vol.organization} onChange={e => updateVol(vol.id, { organization: e.target.value })} placeholder="e.g. Red Cross, local shelter" /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Start date"><input className={ic} value={vol.startDate} onChange={e => updateVol(vol.id, { startDate: e.target.value })} placeholder="e.g. Jan 2021" /></Field>
                    <Field label="End date"><input className={ic} value={vol.endDate} onChange={e => updateVol(vol.id, { endDate: e.target.value })} placeholder="e.g. Present" /></Field>
                  </div>
                  <Field label="Description"><textarea className={tc} rows={3} value={vol.description} onChange={e => updateVol(vol.id, { description: e.target.value })} placeholder="What did you do? What impact did you have?" /></Field>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save({ languages: langs, volunteer: vols })} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section 9 — Additional Info
───────────────────────────────────────────── */
function AdditionalSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [d, setD] = useState({
    careerObjective: profile.careerObjective,
    standoutFacts: profile.standoutFacts,
    workEnvironment: profile.workEnvironment,
    availability: profile.availability,
    aiContext: profile.aiContext,
  })
  const { state, save } = useSave(onChange)
  const p = (k: keyof typeof d) => (v: string) => setD(x => ({ ...x, [k]: v }))

  return (
    <div>
      <SectionHeader title="Additional Information" description="Extra context that helps the AI write more accurate and personalised documents for you." />

      <div className="space-y-5">
        <div className="bg-[#1F4E79]/5 border border-[#1F4E79]/20 rounded-xl p-4 flex gap-3">
          <svg className="w-4 h-4 text-[#4a9eda] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-[#8b949e] text-sm leading-relaxed">
            This section is only used by the AI when generating your resume and cover letter. None of it appears directly in the output — it gives context to write better tailored content.
          </p>
        </div>

        <Field label="Career objective" hint="What kind of role or next step are you looking for?">
          <textarea className={tc} rows={3} value={d.careerObjective} onChange={e => p('careerObjective')(e.target.value)} placeholder="e.g. I'm looking for a senior-level role in data engineering at a mid-size tech company. Open to remote or hybrid in Canada or the US." />
        </Field>

        <Field label="What makes you stand out" hint="Anything unique about you that's hard to capture in a resume format.">
          <textarea className={tc} rows={3} value={d.standoutFacts} onChange={e => p('standoutFacts')(e.target.value)} placeholder="e.g. I have cross-industry experience in both healthcare and tech. I'm bilingual (English/French). I rebuilt my company's CI/CD pipeline from scratch in 2023." />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Preferred work environment" hint="Remote, hybrid, on-site, team size, culture, etc.">
            <input className={ic} value={d.workEnvironment} onChange={e => p('workEnvironment')(e.target.value)} placeholder="e.g. Remote-first, small team, fast-paced startup" />
          </Field>

          <Field label="Availability" hint="When can you start? Any notice period?">
            <input className={ic} value={d.availability} onChange={e => p('availability')(e.target.value)} placeholder="e.g. Available immediately / 2 weeks notice" />
          </Field>
        </div>

        <Field label="Anything else the AI should know" hint="No rules here. Write whatever you think would help produce a better resume or cover letter.">
          <textarea
            className={tc}
            rows={5}
            value={d.aiContext}
            onChange={e => p('aiContext')(e.target.value)}
            placeholder={`Free-form context. Examples:\n- I left my last job due to company closure, not performance\n- I'm transitioning from nursing into health tech\n- I have a gap year in 2020 (I was a caregiver for a family member)\n- I want to downplay my 10 years of experience for junior roles\n- The job description uses Canadian spelling — match that`}
          />
        </Field>
      </div>

      <div className="flex justify-end mt-6 pt-5 border-t border-[#21262d]">
        <SaveButton state={state} onClick={() => save(d)} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Checkbox helper
───────────────────────────────────────────── */
function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group w-fit">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${checked ? 'bg-[#1F4E79] border-[#1F4E79]' : 'border-[#484f58] group-hover:border-[#4a9eda]'}`}
      >
        {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className="text-[#c9d1d9] text-sm select-none">{label}</span>
    </label>
  )
}

/* ─────────────────────────────────────────────
   Inline SVG icons
───────────────────────────────────────────── */
function IconUser()      { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
function IconFile()      { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }
function IconBriefcase() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
function IconGraduate()  { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg> }
function IconZap()       { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> }
function IconAward()     { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg> }
function IconFolder()    { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg> }
function IconGlobe()     { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function IconSparkle()   { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> }
