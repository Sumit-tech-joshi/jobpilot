'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { UniversalGeneratedResume } from '@/lib/anthropic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobAnalysisResult {
  jobTitle: string
  company: string
  location: string
  salary: string
  requiredSkills: string[]
  niceToHave: string[]
  experienceLevel: string
  employmentType: string
  matchScore: number
  skillsYouHave: string[]
  skillsYouMiss: string[]
}

interface Version {
  id: string
  label: string
  timestamp: Date
  resume?: UniversalGeneratedResume
  coverLetter?: string
  tweak?: string
  tone?: string
}

type Tone = 'professional' | 'conversational' | 'direct' | 'technical'
type Tweak = 'shorter' | 'more_technical' | 'less_formal' | 'leadership' | 'metrics'
type OutputTab = 'resume' | 'coverletter'

const TONE_LABELS: Record<Tone, string> = {
  professional:   'Professional',
  conversational: 'Conversational',
  direct:         'Direct',
  technical:      'Technical',
}

const TWEAK_LABELS: Record<Tweak, string> = {
  shorter:        'Shorter',
  more_technical: 'More technical',
  less_formal:    'Less formal',
  leadership:     'Leadership',
  metrics:        'Add metrics',
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg width="72" height="72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1e2d3d" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
        {score}%
      </text>
    </svg>
  )
}

// ─── Keyword highlighter ───────────────────────────────────────────────────────

function highlight(text: string, keywords: string[], active: boolean): string {
  if (!active || !keywords.length) return text
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-400/30 text-yellow-200 rounded px-0.5">$1</mark>')
}

// ─── Resume renderer ──────────────────────────────────────────────────────────

function ResumeView({ resume, keywords, highlightOn }: {
  resume: UniversalGeneratedResume
  keywords: string[]
  highlightOn: boolean
}) {
  function hl(text: string) {
    return { __html: highlight(text, keywords, highlightOn) }
  }
  return (
    <div className="space-y-5 text-sm">
      {/* Summary */}
      {resume.summary && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a9eda] mb-1">Summary</h3>
          <p className="text-[#cdd9e5] leading-relaxed" dangerouslySetInnerHTML={hl(resume.summary)} />
        </div>
      )}

      {/* Skills */}
      {resume.skillSections?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a9eda] mb-2">Skills</h3>
          <div className="space-y-1">
            {resume.skillSections.map((s, i) => (
              <div key={i} className="flex gap-2 flex-wrap">
                <span className="text-[#8b949e] font-medium min-w-[120px]">{s.categoryName}:</span>
                <span className="text-[#cdd9e5]" dangerouslySetInnerHTML={hl(s.skills.join(', '))} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a9eda] mb-2">Experience</h3>
          <div className="space-y-4">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-start flex-wrap gap-1">
                  <div>
                    <span className="font-semibold text-white">{exp.jobTitle}</span>
                    <span className="text-[#8b949e]"> · {exp.employer}</span>
                    {exp.location && <span className="text-[#8b949e]">, {exp.location}</span>}
                  </div>
                  <span className="text-[#8b949e] text-xs">{exp.dates}</span>
                </div>
                <ul className="mt-1.5 space-y-0.5 pl-4">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="text-[#cdd9e5] list-disc"
                      dangerouslySetInnerHTML={hl(b)} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a9eda] mb-2">Education</h3>
          <div className="space-y-1.5">
            {resume.education.map((e, i) => (
              <div key={i} className="flex justify-between flex-wrap gap-1">
                <div>
                  <span className="font-semibold text-white">{e.credential}</span>
                  <span className="text-[#8b949e]"> · {e.institution}</span>
                  {e.location && <span className="text-[#8b949e]">, {e.location}</span>}
                  {e.notes && <p className="text-[#8b949e] text-xs mt-0.5">{e.notes}</p>}
                </div>
                <span className="text-[#8b949e] text-xs">{e.dates}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a9eda] mb-2">Certifications</h3>
          <div className="space-y-1">
            {resume.certifications.map((c, i) => (
              <div key={i} className="flex justify-between flex-wrap gap-1">
                <span className="text-[#cdd9e5]">{c.name} <span className="text-[#8b949e]">· {c.issuingBody}</span></span>
                <span className="text-[#8b949e] text-xs">{c.dates}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a9eda] mb-2">Projects</h3>
          <div className="space-y-3">
            {resume.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-white">{p.name}</p>
                {p.description && <p className="text-[#8b949e] text-xs" dangerouslySetInnerHTML={hl(p.description)} />}
                <ul className="mt-1 space-y-0.5 pl-4">
                  {p.bullets.map((b, j) => (
                    <li key={j} className="text-[#cdd9e5] list-disc" dangerouslySetInnerHTML={hl(b)} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [jobDescription, setJobDescription] = useState('')
  const [manualTitle, setManualTitle]       = useState('')
  const [manualCompany, setManualCompany]   = useState('')
  const [tone, setTone]                     = useState<Tone>('professional')
  const [generateType, setGenerateType]     = useState<'resume' | 'coverletter' | 'both'>('both')

  const [analysis, setAnalysis]             = useState<JobAnalysisResult | null>(null)
  const [analysing, setAnalysing]           = useState(false)

  const [generating, setGenerating]         = useState(false)
  const [genError, setGenError]             = useState('')

  const [resume, setResume]                 = useState<UniversalGeneratedResume | null>(null)
  const [coverLetter, setCoverLetter]       = useState<string | null>(null)
  const [editedCoverLetter, setEditedCoverLetter] = useState<string | null>(null)
  const [editingCL, setEditingCL]           = useState(false)

  const [activeTab, setActiveTab]           = useState<OutputTab>('resume')
  const [highlightOn, setHighlightOn]       = useState(false)
  const [versions, setVersions]             = useState<Version[]>([])
  const [showVersions, setShowVersions]     = useState(false)
  const [showSaveModal, setShowSaveModal]   = useState(false)

  const analyseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auto-analyse JD after 1s pause ──
  useEffect(() => {
    if (analyseTimer.current) clearTimeout(analyseTimer.current)
    if (jobDescription.trim().length < 80) {
      setAnalysis(null)
      return
    }
    analyseTimer.current = setTimeout(() => {
      runAnalysis(jobDescription)
    }, 1000)
    return () => {
      if (analyseTimer.current) clearTimeout(analyseTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobDescription])

  // Auto-fill title/company from analysis
  useEffect(() => {
    if (analysis) {
      if (analysis.jobTitle && !manualTitle) setManualTitle(analysis.jobTitle)
      if (analysis.company && !manualCompany) setManualCompany(analysis.company)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis])

  async function runAnalysis(jd: string) {
    setAnalysing(true)
    try {
      const res = await fetch('/api/generate/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd }),
      })
      if (res.ok) setAnalysis(await res.json())
    } finally {
      setAnalysing(false)
    }
  }

  const generate = useCallback(async (tweak?: Tweak) => {
    if (!jobDescription.trim()) return
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/generate/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          jobTitle:  manualTitle  || analysis?.jobTitle  || '',
          company:   manualCompany || analysis?.company  || '',
          type:      generateType,
          tone,
          tweak,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      if (data.resume)      setResume(data.resume)
      if (data.coverLetter) { setCoverLetter(data.coverLetter); setEditedCoverLetter(null); setEditingCL(false) }

      if (generateType === 'resume' || generateType === 'both') setActiveTab('resume')
      else setActiveTab('coverletter')

      // Version history (max 5)
      const v: Version = {
        id:          Date.now().toString(),
        label:       tweak ? `${TWEAK_LABELS[tweak]} tweak` : `Version ${versions.length + 1}`,
        timestamp:   new Date(),
        resume:      data.resume,
        coverLetter: data.coverLetter,
        tweak,
        tone,
      }
      setVersions(prev => [v, ...prev].slice(0, 5))
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }, [jobDescription, manualTitle, manualCompany, generateType, tone, analysis, versions.length])

  function loadVersion(v: Version) {
    if (v.resume)      setResume(v.resume)
    if (v.coverLetter) { setCoverLetter(v.coverLetter); setEditedCoverLetter(null) }
    setShowVersions(false)
  }

  const keywords = analysis?.requiredSkills ?? []
  const displayCL = editedCoverLetter ?? coverLetter

  const hasOutput = resume || coverLetter

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Document Generator</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Paste any job description — get a tailored resume and cover letter instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6">

          {/* ── Left panel ── */}
          <div className="space-y-4">

            {/* JD input */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Job Description</label>
                {analysing && (
                  <span className="flex items-center gap-1.5 text-xs text-[#4a9eda]">
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Analysing…
                  </span>
                )}
                {analysis && !analysing && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Analysed
                  </span>
                )}
              </div>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                rows={10}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#cdd9e5] placeholder-[#484f58] resize-y focus:outline-none focus:border-[#1F4E79]"
              />
            </div>

            {/* Job Analysis card */}
            {analysis && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
                {/* Match score + extracted info */}
                <div className="flex items-start gap-4">
                  <ScoreRing score={analysis.matchScore} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-base truncate">{analysis.jobTitle || 'Role detected'}</p>
                    <p className="text-[#8b949e] text-sm">{analysis.company}{analysis.location ? ` · ${analysis.location}` : ''}</p>
                    <div className="flex gap-2 flex-wrap mt-1.5">
                      {analysis.experienceLevel && (
                        <span className="px-2 py-0.5 bg-[#1F4E79]/30 border border-[#1F4E79]/50 rounded-full text-xs text-[#4a9eda] capitalize">{analysis.experienceLevel}</span>
                      )}
                      {analysis.employmentType && analysis.employmentType !== 'unknown' && (
                        <span className="px-2 py-0.5 bg-[#1e2d3d] border border-[#30363d] rounded-full text-xs text-[#8b949e] capitalize">{analysis.employmentType}</span>
                      )}
                      {analysis.salary && (
                        <span className="px-2 py-0.5 bg-[#1e2d3d] border border-[#30363d] rounded-full text-xs text-[#8b949e]">{analysis.salary}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills gap */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-green-400 mb-1.5">You have ({analysis.skillsYouHave.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.skillsYouHave.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-300">{s}</span>
                      ))}
                      {analysis.skillsYouHave.length === 0 && <span className="text-xs text-[#484f58]">None matched</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-1.5">Gaps ({analysis.skillsYouMiss.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.skillsYouMiss.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">{s}</span>
                      ))}
                      {analysis.skillsYouMiss.length === 0 && <span className="text-xs text-green-400">No gaps!</span>}
                    </div>
                  </div>
                </div>

                {/* Nice to have */}
                {analysis.niceToHave.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#8b949e] mb-1.5">Nice to have</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.niceToHave.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-[#1e2d3d] border border-[#30363d] rounded text-xs text-[#8b949e]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Title / Company override */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <p className="text-sm font-medium text-white mb-3">Job Details <span className="text-[#484f58] font-normal">(auto-filled from analysis)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Job Title</label>
                  <input
                    value={manualTitle}
                    onChange={e => setManualTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#cdd9e5] placeholder-[#484f58] focus:outline-none focus:border-[#1F4E79]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Company</label>
                  <input
                    value={manualCompany}
                    onChange={e => setManualCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#cdd9e5] placeholder-[#484f58] focus:outline-none focus:border-[#1F4E79]"
                  />
                </div>
              </div>
            </div>

            {/* Tone selector */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <p className="text-sm font-medium text-white mb-3">Writing Tone</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TONE_LABELS) as Tone[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                      tone === t
                        ? 'bg-[#1F4E79] border-[#1F4E79] text-white'
                        : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#1F4E79]/60 hover:text-[#cdd9e5]'
                    }`}
                  >
                    {TONE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate type + button */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
              <p className="text-sm font-medium text-white">Generate</p>
              <div className="flex rounded-lg overflow-hidden border border-[#30363d]">
                {(['resume', 'coverletter', 'both'] as const).map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setGenerateType(t)}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      i > 0 ? 'border-l border-[#30363d]' : ''
                    } ${generateType === t ? 'bg-[#1F4E79] text-white' : 'bg-[#0d1117] text-[#8b949e] hover:text-[#cdd9e5]'}`}
                  >
                    {t === 'resume' ? 'Resume' : t === 'coverletter' ? 'Cover Letter' : 'Both'}
                  </button>
                ))}
              </div>

              {genError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{genError}</p>
              )}

              <button
                onClick={() => generate()}
                disabled={generating || !jobDescription.trim()}
                className="w-full py-3 bg-[#1F4E79] hover:bg-[#1a4269] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ── Right panel — output ── */}
          <div className="space-y-4">
            {!hasOutput && !generating && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#1F4E79]/20 border border-[#1F4E79]/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#4a9eda]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">No output yet</p>
                <p className="text-[#8b949e] text-sm">Paste a job description and click Generate.</p>
              </div>
            )}

            {generating && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#1F4E79]/20 border border-[#1F4E79]/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-7 h-7 text-[#4a9eda]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Generating your documents…</p>
                <p className="text-[#8b949e] text-sm">This usually takes 10–20 seconds.</p>
              </div>
            )}

            {hasOutput && !generating && (
              <>
                {/* Toolbar */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 flex items-center gap-2 flex-wrap">
                  {/* Tabs */}
                  {resume && coverLetter && (
                    <div className="flex rounded-lg overflow-hidden border border-[#30363d] mr-auto">
                      <button onClick={() => setActiveTab('resume')}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === 'resume' ? 'bg-[#1F4E79] text-white' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'}`}>
                        Resume
                      </button>
                      <button onClick={() => setActiveTab('coverletter')}
                        className={`px-3 py-1.5 text-xs font-medium border-l border-[#30363d] transition-colors ${activeTab === 'coverletter' ? 'bg-[#1F4E79] text-white' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'}`}>
                        Cover Letter
                      </button>
                    </div>
                  )}
                  {!resume && coverLetter && <span className="text-xs font-medium text-white mr-auto">Cover Letter</span>}
                  {resume && !coverLetter && <span className="text-xs font-medium text-white mr-auto">Resume</span>}

                  {/* Keyword highlight toggle */}
                  <button
                    onClick={() => setHighlightOn(h => !h)}
                    title="Toggle keyword highlighting"
                    className={`p-1.5 rounded-lg border transition-colors ${highlightOn ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300' : 'border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58]'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  {/* Version history */}
                  {versions.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowVersions(v => !v)}
                        className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors"
                        title="Version history"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      {showVersions && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl z-20 overflow-hidden">
                          {versions.map(v => (
                            <button key={v.id} onClick={() => loadVersion(v)}
                              className="w-full text-left px-3 py-2.5 text-xs hover:bg-[#1e2d3d] transition-colors border-b border-[#30363d] last:border-0">
                              <p className="text-white font-medium">{v.label}</p>
                              <p className="text-[#484f58]">{v.timestamp.toLocaleTimeString()}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save */}
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors"
                    title="Save to applications"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                {/* Quick tweak chips */}
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(TWEAK_LABELS) as Tweak[]).map(tw => (
                    <button key={tw} onClick={() => generate(tw)} disabled={generating}
                      className="px-3 py-1.5 bg-[#161b22] hover:bg-[#1e2d3d] border border-[#30363d] rounded-full text-xs text-[#8b949e] hover:text-white hover:border-[#1F4E79]/60 transition-all disabled:opacity-40">
                      ↺ {TWEAK_LABELS[tw]}
                    </button>
                  ))}
                </div>

                {/* Output content */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 min-h-[400px]">

                  {/* Resume tab */}
                  {(activeTab === 'resume' || !coverLetter) && resume && (
                    <ResumeView resume={resume} keywords={keywords} highlightOn={highlightOn} />
                  )}

                  {/* Cover letter tab */}
                  {(activeTab === 'coverletter' || !resume) && displayCL && (
                    <div>
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={() => {
                            if (editingCL) {
                              // done editing
                              setEditingCL(false)
                            } else {
                              setEditedCoverLetter(displayCL)
                              setEditingCL(true)
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors"
                        >
                          {editingCL ? (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Done
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </>
                          )}
                        </button>
                      </div>
                      {editingCL ? (
                        <textarea
                          value={editedCoverLetter ?? ''}
                          onChange={e => setEditedCoverLetter(e.target.value)}
                          rows={20}
                          className="w-full bg-[#0d1117] border border-[#1F4E79]/50 rounded-lg px-3 py-2.5 text-sm text-[#cdd9e5] focus:outline-none resize-y leading-relaxed"
                        />
                      ) : (
                        <p className="text-sm text-[#cdd9e5] whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: highlight(displayCL, keywords, highlightOn) }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Download row */}
                <div className="flex gap-2 flex-wrap">
                  {resume && (
                    <>
                      {(['pdf', 'docx'] as const).map(fmt => (
                        <button key={fmt}
                          onClick={async () => {
                            const res = await fetch('/api/generate/universal/download', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                format: fmt,
                                resume,
                                jobTitle: manualTitle || analysis?.jobTitle || '',
                                company: manualCompany || analysis?.company || '',
                              }),
                            })
                            if (res.ok) {
                              const blob = await res.blob()
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url; a.download = `resume.${fmt}`; a.click()
                              URL.revokeObjectURL(url)
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Resume {fmt.toUpperCase()}
                        </button>
                      ))}
                    </>
                  )}
                  {displayCL && (
                    <button
                      onClick={() => {
                        const blob = new Blob([displayCL], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url; a.download = 'cover-letter.txt'; a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Cover Letter TXT
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Save to Applications modal ── */}
      {showSaveModal && (
        <SaveModal
          jobTitle={manualTitle || analysis?.jobTitle || ''}
          company={manualCompany || analysis?.company || ''}
          resume={resume}
          coverLetter={displayCL ?? undefined}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  )
}

// ─── Save modal ───────────────────────────────────────────────────────────────

function SaveModal({ jobTitle, company, resume, coverLetter, onClose }: {
  jobTitle: string
  company: string
  resume?: UniversalGeneratedResume | null
  coverLetter?: string
  onClose: () => void
}) {
  const [title, setTitle]     = useState(jobTitle)
  const [comp, setComp]       = useState(company)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  async function handleSave() {
    if (!title.trim() || !comp.trim()) { setError('Job title and company are required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/generate/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: title,
          company: comp,
          resumeContent: resume ? JSON.stringify(resume) : undefined,
          coverLetterContent: coverLetter,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Save failed')
      }
      setSaved(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {saved ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Saved to Applications!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Save to Applications</h2>
              <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Job Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#cdd9e5] focus:outline-none focus:border-[#1F4E79]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Company</label>
                <input value={comp} onChange={e => setComp(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#cdd9e5] focus:outline-none focus:border-[#1F4E79]"
                />
              </div>
              <div className="flex gap-2 text-xs text-[#8b949e]">
                {resume && <span className="px-2 py-1 bg-[#1e2d3d] rounded">Resume attached</span>}
                {coverLetter && <span className="px-2 py-1 bg-[#1e2d3d] rounded">Cover letter attached</span>}
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose}
                className="flex-1 py-2 border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 bg-[#1F4E79] hover:bg-[#1a4269] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Saving…</>
                ) : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
