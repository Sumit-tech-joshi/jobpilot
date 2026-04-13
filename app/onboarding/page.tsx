'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const INDUSTRIES = [
  { id: 'tech', icon: '💻', title: 'Technology & Software', subtitle: 'Dev, QA, DevOps, Data' },
  { id: 'trades', icon: '🔧', title: 'Trades & Technical', subtitle: 'Electrical, Plumbing, HVAC' },
  { id: 'healthcare', icon: '🏥', title: 'Healthcare & Medical', subtitle: 'Nursing, Pharmacy, Admin' },
  { id: 'business', icon: '💼', title: 'Business & Finance', subtitle: 'Accounting, Banking, HR' },
  { id: 'marketing', icon: '🎨', title: 'Marketing & Creative', subtitle: 'Design, Copywriting, SEO' },
  { id: 'education', icon: '📚', title: 'Education & Research', subtitle: 'Teaching, Academia, R&D' },
  { id: 'legal', icon: '⚖️', title: 'Legal & Compliance', subtitle: 'Law, Paralegal, Regulatory' },
  { id: 'sales', icon: '🤝', title: 'Sales & Service', subtitle: 'Retail, B2B, Support' },
  { id: 'engineering', icon: '⚙️', title: 'Engineering', subtitle: 'Mechanical, Civil, Chemical' },
  { id: 'other', icon: '✨', title: 'Other', subtitle: 'Any field not listed above' },
]

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  tech: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS'],
  trades: ['Electrical wiring', 'Blueprint reading', 'Safety compliance', 'PLC programming', 'HVAC systems'],
  healthcare: ['Patient care', 'IV therapy', 'EMR/EHR systems', 'Medication administration', 'ACLS'],
  business: ['Financial analysis', 'Excel', 'QuickBooks', 'Budget management', 'Payroll', 'SAP'],
  marketing: ['SEO', 'Google Ads', 'Adobe Creative Suite', 'Copywriting', 'Email marketing', 'Analytics'],
  education: ['Curriculum development', 'Classroom management', 'SMART Board', 'Differentiated instruction'],
  legal: ['Legal research', 'Contract drafting', 'Westlaw', 'LexisNexis', 'Case management'],
  sales: ['CRM (Salesforce)', 'Cold calling', 'Negotiation', 'Lead generation', 'Account management'],
  engineering: ['AutoCAD', 'SolidWorks', 'MATLAB', 'FEA analysis', 'Project management', 'PMP'],
  other: ['Microsoft Office', 'Communication', 'Project management', 'Problem solving', 'Teamwork'],
}

const CATEGORY_NAMES: Record<string, string> = {
  tech: 'Technical Skills',
  trades: 'Trade Skills',
  healthcare: 'Clinical Skills',
  business: 'Business Skills',
  marketing: 'Marketing Skills',
  education: 'Teaching Skills',
  legal: 'Legal Skills',
  sales: 'Sales Skills',
  engineering: 'Engineering Skills',
  other: 'Core Skills',
}

const WORK_AUTH_OPTIONS = [
  'Canadian Citizen',
  'Permanent Resident (Canada)',
  'Open Work Permit (Canada)',
  'Employer-Specific Work Permit',
  'US Citizen',
  'US Green Card',
  'US Work Visa (H-1B / TN / OPT)',
  'EU Citizen',
  'UK Citizen',
  'UK Work Visa',
  'Australian Citizen / PR',
  'Other',
]

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Apprenticeship',
  'Casual / On-call',
]

const TOTAL_STEPS = 6

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface ExperienceEntry {
  jobTitle: string
  employer: string
  location: string
  startDate: string
  endDate: string
  currentRole: boolean
  employmentType: string
  description: string
}

interface EducationEntry {
  credential: string
  institution: string
  fieldOfStudy: string
  endDate: string
  current: boolean
}

interface ProfileData {
  industry: string
  headline: string
  location: string
  workAuthorization: string
  experience: ExperienceEntry | null
  education: EducationEntry | null
  skillCategoryName: string
  skills: string[]
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [data, setData] = useState<ProfileData>({
    industry: '',
    headline: '',
    location: '',
    workAuthorization: '',
    experience: null,
    education: null,
    skillCategoryName: 'Core Skills',
    skills: [],
  })

  const userName = session?.user?.name?.split(' ')[0] ?? 'there'

  function patch(partial: Partial<ProfileData>) {
    setData((d) => ({ ...d, ...partial }))
  }

  function patchExp(partial: Partial<ExperienceEntry>) {
    setData((d) => ({
      ...d,
      experience: { ...(d.experience ?? emptyExp()), ...partial },
    }))
  }

  function patchEdu(partial: Partial<EducationEntry>) {
    setData((d) => ({
      ...d,
      education: { ...(d.education ?? emptyEdu()), ...partial },
    }))
  }

  function emptyExp(): ExperienceEntry {
    return {
      jobTitle: '',
      employer: '',
      location: '',
      startDate: '',
      endDate: '',
      currentRole: false,
      employmentType: 'Full-time',
      description: '',
    }
  }

  function emptyEdu(): EducationEntry {
    return {
      credential: '',
      institution: '',
      fieldOfStudy: '',
      endDate: '',
      current: false,
    }
  }

  // Animate between steps
  const goTo = useCallback(
    (next: number) => {
      setAnimating(true)
      setTimeout(() => {
        setStep(next)
        setAnimating(false)
      }, 180)
    },
    []
  )

  function next() {
    if (step < TOTAL_STEPS) goTo(step + 1)
  }

  function back() {
    if (step > 1) goTo(step - 1)
  }

  function selectIndustry(id: string) {
    patch({
      industry: id,
      skillCategoryName: CATEGORY_NAMES[id] ?? 'Core Skills',
      skills: [],
    })
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !data.skills.includes(s)) {
      patch({ skills: [...data.skills, s] })
    }
    setSkillInput('')
  }

  function removeSkill(s: string) {
    patch({ skills: data.skills.filter((x) => x !== s) })
  }

  function addSuggestedSkill(s: string) {
    if (!data.skills.includes(s)) {
      patch({ skills: [...data.skills, s] })
    }
  }

  async function handleFinish() {
    setSaving(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: data.industry,
          headline: data.headline,
          location: data.location,
          workAuthorization: data.workAuthorization,
          experience: data.experience?.jobTitle ? data.experience : null,
          education: data.education?.institution ? data.education : null,
          skillCategories:
            data.skills.length > 0
              ? [{ id: 'cat-1', categoryName: data.skillCategoryName, skills: data.skills }]
              : [],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Request failed (${res.status})`)
      }

      // Pass the value directly into the JWT — no DB call, no hanging
      await update({ onboardingComplete: true })

      // Hard redirect so the middleware reads the refreshed cookie
      window.location.href = '/'
    } catch (err) {
      console.error('[ONBOARDING_FINISH]', err)
      setSaving(false)
      alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-enter { animation: fadeSlideIn 0.25s ease-out forwards; }
        .step-exit  { opacity: 0; transform: translateY(-8px); transition: opacity 0.15s ease, transform 0.15s ease; }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        .skill-tag { animation: popIn 0.2s ease forwards; }
        @keyframes checkDraw {
          to { stroke-dashoffset: 0; }
        }
        .check-path {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: checkDraw 0.5s ease 0.2s forwards;
        }
      `}</style>

      <div className="min-h-screen bg-[#080C14] flex flex-col">
        {/* ── Top progress bar ── */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-white/[0.05] z-50">
          <div
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 md:px-10 pt-8 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">Job</span>
            <span className="text-white font-bold text-xl tracking-tight">Pilot</span>
          </div>
          <div className="flex items-center gap-4">
            {step >= 3 && step < TOTAL_STEPS && (
              <button
                onClick={next}
                className="text-[#94A3B8] hover:text-white text-sm transition-colors"
              >
                Skip this step →
              </button>
            )}
            <span className="text-[#475569] text-sm">
              {step} <span className="text-[#334155]">/</span> {TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* ── Step dots ── */}
        <div className="flex items-center justify-center gap-2 py-4">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 < step
                  ? 'w-2 h-2 bg-[#8B5CF6]'
                  : i + 1 === step
                  ? 'w-6 h-2 bg-[#6366F1]'
                  : 'w-2 h-2 bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* ── Step content ── */}
        <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-y-auto">
          <div
            key={step}
            className={`w-full max-w-2xl ${animating ? 'step-exit' : 'step-enter'}`}
          >
            {step === 1 && (
              <Step1
                selected={data.industry}
                onSelect={selectIndustry}
                onNext={next}
                userName={userName}
              />
            )}
            {step === 2 && (
              <Step2
                data={data}
                onChange={patch}
                userName={userName}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 3 && (
              <Step3
                exp={data.experience ?? emptyExp()}
                onChange={patchExp}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 4 && (
              <Step4
                edu={data.education ?? emptyEdu()}
                onChange={patchEdu}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 5 && (
              <Step5
                categoryName={data.skillCategoryName}
                skills={data.skills}
                industry={data.industry}
                skillInput={skillInput}
                setSkillInput={setSkillInput}
                onAdd={addSkill}
                onRemove={removeSkill}
                onSuggestion={addSuggestedSkill}
                onCategoryChange={(v) => patch({ skillCategoryName: v })}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 6 && (
              <Step6
                data={data}
                saving={saving}
                onFinish={handleFinish}
                onBack={back}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   Step 1 — Industry
───────────────────────────────────────────── */
function Step1({
  selected,
  onSelect,
  onNext,
  userName,
}: {
  selected: string
  onSelect: (id: string) => void
  onNext: () => void
  userName: string
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[#8B5CF6] text-sm font-medium mb-2">Step 1 of 6</p>
        <h2 className="text-3xl font-bold text-white mb-2">
          Hi {userName}, what&apos;s your field?
        </h2>
        <p className="text-[#94A3B8]">
          This helps us tailor suggestions. You can apply for any job regardless of what you pick.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {INDUSTRIES.map((ind) => {
          const active = selected === ind.id
          return (
            <button
              key={ind.id}
              onClick={() => onSelect(ind.id)}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 group hover:scale-[1.03] ${
                active
                  ? 'bg-[#6366F1]/15 border-[#6366F1]/60 shadow-lg shadow-[#6366F1]/10'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-[#6366F1]/30 hover:bg-[#6366F1]/5'
              }`}
            >
              {active && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <span className="text-2xl mb-2">{ind.icon}</span>
              <p className={`text-xs font-semibold leading-tight ${active ? 'text-[#A78BFA]' : 'text-[#CBD5E1] group-hover:text-white'}`}>
                {ind.title}
              </p>
              <p className="text-[10px] text-[#475569] mt-1 leading-tight">{ind.subtitle}</p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-[#6366F1]/20"
        >
          Continue
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Step 2 — Basic info
───────────────────────────────────────────── */
function Step2({
  data,
  onChange,
  userName,
  onNext,
  onBack,
}: {
  data: ProfileData
  onChange: (p: Partial<ProfileData>) => void
  userName: string
  onNext: () => void
  onBack: () => void
}) {
  const industry = INDUSTRIES.find((i) => i.id === data.industry)
  const placeholder = industry
    ? `e.g. ${industry.title.split(' ')[0]} Professional | 5 years experience`
    : 'e.g. Marketing Manager | 8 years experience'

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#8B5CF6] text-sm font-medium mb-2">Step 2 of 6</p>
        <h2 className="text-3xl font-bold text-white mb-2">About you</h2>
        <p className="text-[#94A3B8]">
          This information will appear at the top of your resume.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <Field label="Your name">
          <input
            type="text"
            defaultValue={userName}
            readOnly
            className="w-full px-4 py-3 bg-[#080C14] border border-white/[0.05] rounded-xl text-[#475569] text-sm cursor-not-allowed"
          />
          <p className="text-[#475569] text-xs mt-1">Taken from your account</p>
        </Field>

        <Field label="Professional headline">
          <input
            type="text"
            value={data.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            placeholder={placeholder}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Location">
            <input
              type="text"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. Vancouver, BC, Canada"
              className={inputCls}
            />
          </Field>

          <Field label="Work authorization">
            <select
              value={data.workAuthorization}
              onChange={(e) => onChange({ workAuthorization: e.target.value })}
              className={selectCls}
            >
              <option value="">Select status…</option>
              {WORK_AUTH_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Step 3 — Experience
───────────────────────────────────────────── */
function Step3({
  exp,
  onChange,
  onNext,
  onBack,
}: {
  exp: ExperienceEntry
  onChange: (p: Partial<ExperienceEntry>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[#8B5CF6] text-sm font-medium mb-2">Step 3 of 6</p>
        <h2 className="text-3xl font-bold text-white mb-2">Most recent role</h2>
        <p className="text-[#94A3B8]">
          Add your latest or current position. You can add more later.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Job title" required>
            <input
              type="text"
              value={exp.jobTitle}
              onChange={(e) => onChange({ jobTitle: e.target.value })}
              placeholder="e.g. Electrician, Software Developer"
              className={inputCls}
            />
          </Field>

          <Field label="Employer" required>
            <input
              type="text"
              value={exp.employer}
              onChange={(e) => onChange({ employer: e.target.value })}
              placeholder="Company or organisation name"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Location">
            <input
              type="text"
              value={exp.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="e.g. Toronto, ON"
              className={inputCls}
            />
          </Field>

          <Field label="Employment type">
            <select
              value={exp.employmentType}
              onChange={(e) => onChange({ employmentType: e.target.value })}
              className={selectCls}
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Start date">
            <input
              type="text"
              value={exp.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              placeholder="e.g. Jan 2022"
              className={inputCls}
            />
          </Field>

          <Field label="End date">
            <input
              type="text"
              value={exp.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              placeholder="e.g. Dec 2024"
              disabled={exp.currentRole}
              className={`${inputCls} ${exp.currentRole ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </Field>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => onChange({ currentRole: !exp.currentRole, endDate: '' })}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              exp.currentRole
                ? 'bg-[#6366F1] border-[#6366F1]'
                : 'border-[#475569] group-hover:border-[#8B5CF6]'
            }`}
          >
            {exp.currentRole && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[#CBD5E1] text-sm select-none">I currently work here</span>
        </label>

        <Field label="Brief description (optional)">
          <textarea
            value={exp.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="What were your main responsibilities and achievements?"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Step 4 — Education
───────────────────────────────────────────── */
function Step4({
  edu,
  onChange,
  onNext,
  onBack,
}: {
  edu: EducationEntry
  onChange: (p: Partial<EducationEntry>) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[#8B5CF6] text-sm font-medium mb-2">Step 4 of 6</p>
        <h2 className="text-3xl font-bold text-white mb-2">Education</h2>
        <p className="text-[#94A3B8]">
          Add your highest qualification. This can be a degree, diploma, trade certificate, or anything else.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
        <Field label="Credential / qualification">
          <input
            type="text"
            value={edu.credential}
            onChange={(e) => onChange({ credential: e.target.value })}
            placeholder="e.g. Bachelor of Science, Red Seal Certificate, Diploma"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Institution">
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => onChange({ institution: e.target.value })}
              placeholder="University, college, or trade school"
              className={inputCls}
            />
          </Field>

          <Field label="Field of study">
            <input
              type="text"
              value={edu.fieldOfStudy}
              onChange={(e) => onChange({ fieldOfStudy: e.target.value })}
              placeholder="e.g. Computer Science, Electrical"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Year completed (or expected)">
          <input
            type="text"
            value={edu.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            placeholder="e.g. 2021 or In progress"
            disabled={edu.current}
            className={`${inputCls} ${edu.current ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => onChange({ current: !edu.current, endDate: '' })}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              edu.current
                ? 'bg-[#6366F1] border-[#6366F1]'
                : 'border-[#475569] group-hover:border-[#8B5CF6]'
            }`}
          >
            {edu.current && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[#CBD5E1] text-sm select-none">Currently studying</span>
        </label>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Step 5 — Skills
───────────────────────────────────────────── */
function Step5({
  categoryName,
  skills,
  industry,
  skillInput,
  setSkillInput,
  onAdd,
  onRemove,
  onSuggestion,
  onCategoryChange,
  onNext,
  onBack,
}: {
  categoryName: string
  skills: string[]
  industry: string
  skillInput: string
  setSkillInput: (v: string) => void
  onAdd: () => void
  onRemove: (s: string) => void
  onSuggestion: (s: string) => void
  onCategoryChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const suggestions = (SKILL_SUGGESTIONS[industry] ?? SKILL_SUGGESTIONS.other).filter(
    (s) => !skills.includes(s)
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      onAdd()
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#8B5CF6] text-sm font-medium mb-2">Step 5 of 6</p>
        <h2 className="text-3xl font-bold text-white mb-2">Your skills</h2>
        <p className="text-[#94A3B8]">
          Add your key skills. Press Enter after each one. You can expand this later.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-5">
        {/* Category name */}
        <Field label="Skill category name">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="e.g. Technical Skills, Trade Skills"
            className={inputCls}
          />
        </Field>

        {/* Tag input */}
        <Field label="Add skills">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter…"
              className={`${inputCls} flex-1`}
            />
            <button
              onClick={onAdd}
              disabled={!skillInput.trim()}
              className="px-4 py-3 bg-[#6366F1]/10 hover:bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#8B5CF6] rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </Field>

        {/* Current skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="skill-tag flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#A78BFA] rounded-lg text-sm"
              >
                {s}
                <button
                  onClick={() => onRemove(s)}
                  className="text-[#8B5CF6]/60 hover:text-red-400 transition-colors ml-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p className="text-[#475569] text-xs mb-2 uppercase tracking-wider">Suggested for you</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 8).map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestion(s)}
                  className="px-3 py-1.5 bg-white/[0.03] hover:bg-[#6366F1]/10 border border-white/[0.07] hover:border-[#6366F1]/30 text-[#94A3B8] hover:text-[#A78BFA] rounded-lg text-sm transition-all duration-200"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Step 6 — Done
───────────────────────────────────────────── */
function Step6({
  data,
  saving,
  onFinish,
  onBack,
}: {
  data: ProfileData
  saving: boolean
  onFinish: () => void
  onBack: () => void
}) {
  // Calculate completion score
  let score = 0
  if (data.industry) score += 15
  if (data.headline) score += 15
  if (data.location) score += 10
  if (data.workAuthorization) score += 10
  if (data.experience?.jobTitle && data.experience?.employer) score += 25
  if (data.education?.institution) score += 15
  if (data.skills.length >= 3) score += 10

  return (
    <div className="text-center max-w-lg mx-auto">
      {/* Animated checkmark */}
      <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse" />
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-12 h-12" fill="none" stroke="#3fb950" viewBox="0 0 24 24">
            <path
              className="check-path"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <p className="text-[#8B5CF6] text-sm font-medium mb-2">Step 6 of 6</p>
      <h2 className="text-3xl font-bold text-white mb-3">You&apos;re all set!</h2>
      <p className="text-[#94A3B8] leading-relaxed mb-8">
        Your profile is ready. You can always add more details later to improve your document quality.
      </p>

      {/* Completion bar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-8 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#CBD5E1] text-sm font-medium">Profile completion</span>
          <span className="text-[#8B5CF6] text-sm font-bold">{score}%</span>
        </div>
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[#475569] text-xs mt-3">
          Add more experience, certifications, and projects on your profile page to reach 100%.
        </p>
      </div>

      {/* Summary of what was added */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-8 text-left space-y-2">
        <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-3">What you added</p>
        {[
          { label: 'Industry', value: INDUSTRIES.find((i) => i.id === data.industry)?.title },
          { label: 'Headline', value: data.headline || null },
          { label: 'Location', value: data.location || null },
          { label: 'Experience', value: data.experience?.jobTitle ? `${data.experience.jobTitle} at ${data.experience.employer}` : null },
          { label: 'Education', value: data.education?.institution || null },
          { label: 'Skills', value: data.skills.length > 0 ? `${data.skills.length} skills added` : null },
        ].map(({ label, value }) =>
          value ? (
            <div key={label} className="flex items-center gap-3">
              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[#94A3B8] text-sm">
                <span className="text-[#475569]">{label}: </span>
                {value}
              </span>
            </div>
          ) : null
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onFinish}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-[#6366F1]/20"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Go to Dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>

      <button
        onClick={onBack}
        disabled={saving}
        className="mt-4 text-[#475569] hover:text-[#94A3B8] text-sm transition-colors disabled:opacity-50"
      >
        ← Go back and edit
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Shared UI helpers
───────────────────────────────────────────── */
const inputCls =
  'w-full px-4 py-3 bg-[#080C14] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 rounded-xl text-white placeholder-[#475569] outline-none transition-all duration-200 text-sm'

const selectCls =
  'w-full px-4 py-3 bg-[#080C14] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 rounded-xl text-white outline-none transition-all duration-200 text-sm appearance-none cursor-pointer'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
        {label}
        {required && <span className="text-[#8B5CF6] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function StepNav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between mt-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] rounded-xl text-sm transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        Back
      </button>
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-[#6366F1]/20"
      >
        Continue
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  )
}
