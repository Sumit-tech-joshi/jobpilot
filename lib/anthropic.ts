import Groq from 'groq-sdk';
import { masterProfile } from '@/data/master-profile';
import { GeneratedResume } from '@/types';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

export async function generateResume(
  jobTitle: string,
  jobDescription: string,
  companyName: string
): Promise<GeneratedResume> {
  const systemPrompt = `You are a resume formatter. You will receive a candidate profile and a job description.
Your job is to return a JSON object with tailored resume content.

RULES FOR CONTENT:
- Keep all facts accurate. Never invent experience, skills, or achievements.
- Reorder and emphasize skills and bullets that match the job description.
- Use keywords from the job description naturally — do not stuff them artificially.
- Every bullet point must start with a past tense action verb.
- Keep bullets concise and specific. One idea per bullet.
- Do not use: "results-driven", "passionate", "dynamic", "leverage", "synergy",
  "spearhead", "innovative", "dedicated", "excited to", "I am pleased to",
  "proven track record", em dashes (—), or any filler phrases.
- Write like a real human wrote this. No AI patterns.

RETURN THIS EXACT JSON STRUCTURE — no markdown, no explanation, raw JSON only:
{
  "summary": "2-3 sentence paragraph. Direct, specific, no fluff.",
  "skills": {
    "languages": [],
    "frameworks": [],
    "databases": [],
    "tools": [],
    "practices": []
  },
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "dates": "",
      "projects": [
        {
          "name": "",
          "bullets": []
        }
      ],
      "general": []
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "dates": "",
      "note": ""
    }
  ]
}`;

  const userMessage = `Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
${jobDescription}

Candidate Master Profile:
${JSON.stringify(masterProfile, null, 2)}`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content ?? '';

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  return JSON.parse(cleaned) as GeneratedResume;
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  companyName: string
): Promise<string> {
  const systemPrompt = `You are a cover letter writer. You will receive a candidate profile and a job description.
Write a tailored cover letter and return it as plain text only.

RULES:
- Maximum 4 paragraphs. Must fit on one page when printed.
- Do not use: em dashes (—), "I am excited to", "I am passionate about", "leverage",
  "synergy", "dynamic", "results-driven", "I would welcome the opportunity",
  "Thank you for your consideration", "please find attached", or any corporate filler.
- Do not open with "I am writing to apply for". Start differently.
- Be direct. Reference the actual company name and specific requirements from the JD.
- If the candidate is missing a skill the JD asks for, acknowledge it briefly and honestly.
- Write in first person, conversational but professional. Like a real person wrote it.
- End simply — no long sign-off, no "sincerely yours", just a short closing line.
- Return plain text only. No markdown, no formatting, no labels.

PARAGRAPH STRUCTURE:
1. Why this company and role specifically (1-2 sentences, direct)
2. Most relevant professional experience tied to this job (3-4 sentences)
3. Skills match + honest acknowledgment of any gaps (2-3 sentences)
4. Availability, work permit if relevant, portfolio/contact (2 sentences max)`;

  const userMessage = `Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
${jobDescription}

Candidate Master Profile:
${JSON.stringify(masterProfile, null, 2)}`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? '';
}

/* ─────────────────────────────────────────────
   Universal generation (profile-based, any industry)
───────────────────────────────────────────── */

export interface UniversalGeneratedResume {
  summary: string
  skillSections: { categoryName: string; skills: string[] }[]
  experience: { jobTitle: string; employer: string; location: string; dates: string; bullets: string[] }[]
  education: { credential: string; institution: string; location: string; dates: string; notes: string }[]
  certifications: { name: string; issuingBody: string; dates: string }[]
  projects: { name: string; description: string; bullets: string[] }[]
}

export interface JobAnalysis {
  jobTitle: string
  company: string
  location: string
  salary: string
  requiredSkills: string[]
  niceToHave: string[]
  experienceLevel: string
  employmentType: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProfileContext(profile: Record<string, any>): string {
  const lines: string[] = []

  if (profile.fullName)         lines.push(`Name: ${profile.fullName}`)
  if (profile.headline)         lines.push(`Headline: ${profile.headline}`)
  if (profile.location)         lines.push(`Location: ${profile.location}`)
  if (profile.workAuthorization) lines.push(`Work Authorization: ${profile.workAuthorization}`)
  if (profile.summary)          lines.push(`\nProfessional Summary:\n${profile.summary}`)

  if (profile.skillCategories?.length) {
    lines.push('\nSKILLS:')
    for (const cat of profile.skillCategories) {
      if (cat.skills?.length) lines.push(`${cat.categoryName}: ${cat.skills.join(', ')}`)
    }
  }

  if (profile.experience?.length) {
    lines.push('\nEXPERIENCE:')
    for (const e of profile.experience) {
      const period = e.currentRole ? `${e.startDate} – Present` : `${e.startDate} – ${e.endDate}`
      lines.push(`\n${e.jobTitle} | ${e.employer}${e.location ? ` | ${e.location}` : ''} | ${period}`)
      if (e.employmentType) lines.push(`Type: ${e.employmentType}`)
      if (e.description)    lines.push(e.description)
      if (e.achievements?.length) lines.push(`Key achievements: ${e.achievements.join(' • ')}`)
    }
  }

  if (profile.education?.length) {
    lines.push('\nEDUCATION:')
    for (const e of profile.education) {
      lines.push(`${e.credential}${e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''} — ${e.institution} (${e.endDate || 'In progress'})`)
      if (e.notes) lines.push(`  ${e.notes}`)
    }
  }

  if (profile.certifications?.length) {
    lines.push('\nCERTIFICATIONS:')
    for (const c of profile.certifications) {
      lines.push(`${c.name} — ${c.issuingBody}${c.issueDate ? ` (${c.issueDate})` : ''}`)
    }
  }

  if (profile.projects?.length) {
    lines.push('\nPROJECTS:')
    for (const p of profile.projects) {
      lines.push(`\n${p.name}${p.role ? ` — ${p.role}` : ''}`)
      if (p.description) lines.push(p.description)
      if (p.techOrTools?.length) lines.push(`Tools: ${p.techOrTools.join(', ')}`)
      if (p.highlights?.length)  lines.push(`Highlights: ${p.highlights.join(' • ')}`)
    }
  }

  if (profile.languages?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const langs = profile.languages.map((l: any) => `${l.language} (${l.proficiency})`).join(', ')
    lines.push(`\nLANGUAGES: ${langs}`)
  }

  const extras: string[] = []
  if (profile.careerObjective) extras.push(`Career objective: ${profile.careerObjective}`)
  if (profile.standoutFacts)   extras.push(`What makes them stand out: ${profile.standoutFacts}`)
  if (profile.workEnvironment) extras.push(`Work environment preference: ${profile.workEnvironment}`)
  if (profile.availability)    extras.push(`Availability: ${profile.availability}`)
  if (profile.aiContext)       extras.push(`Extra context: ${profile.aiContext}`)
  if (extras.length) {
    lines.push('\nAI CONTEXT (use this to personalise and improve accuracy):')
    extras.forEach(e => lines.push(e))
  }

  return lines.join('\n')
}

const TONE_MAP: Record<string, string> = {
  professional:   '',
  conversational: 'Write in a warm, natural, conversational tone. Shorter sentences. Less corporate stiffness.',
  direct:         'Write in a direct, sharp style. Every word earns its place. No softeners or hedging.',
  technical:      'Emphasise technical skills, tools, and domain expertise. Use precise terminology naturally.',
}

export const TWEAK_PROMPTS: Record<string, string> = {
  shorter:        'Reduce length by approximately 30%. Keep only the most impactful content.',
  more_technical: 'Increase technical depth. Reference specific technologies and methodologies more explicitly.',
  less_formal:    'Lower the formality. Make it sound more natural and human.',
  leadership:     'Emphasise leadership, team management, mentoring, and strategic decision-making.',
  metrics:        'Add specific quantified results — percentages, dollar amounts, time saved, team sizes — wherever the profile supports it.',
}

export async function generateUniversalResume(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>,
  jobDescription: string,
  jobTitle: string,
  company: string,
  tweak?: string
): Promise<UniversalGeneratedResume> {
  const profileCtx = buildProfileContext(profile)
  const tweakLine  = tweak ? `\n\nADDITIONAL INSTRUCTION: ${tweak}` : ''

  const systemPrompt = `You are an expert resume writer for any industry and country.

RULES:
- Keep all facts accurate. Never invent experience, skills, or qualifications.
- Reorder and emphasise content that matches the job description.
- Use keywords from the job description naturally throughout.
- Every bullet point starts with a strong past tense action verb.
- Include numbers and metrics where the profile provides them.
- Match the tone and terminology of the industry in the job description.
- If the candidate is missing a required qualification, omit or reframe honestly — never invent.
- Never use: em dashes, "results-driven", "passionate", "dynamic", "leverage", "synergy", "spearhead", "dedicated", "excited to", or any AI filler.
- Write like a real human. No AI patterns.${tweakLine}

Return valid JSON only. No markdown. No text outside the JSON object.

{
  "summary": "2-3 sentence tailored summary",
  "skillSections": [{ "categoryName": "string", "skills": ["string"] }],
  "experience": [{ "jobTitle": "string", "employer": "string", "location": "string", "dates": "string", "bullets": ["string"] }],
  "education": [{ "credential": "string", "institution": "string", "location": "string", "dates": "string", "notes": "string" }],
  "certifications": [{ "name": "string", "issuingBody": "string", "dates": "string" }],
  "projects": [{ "name": "string", "description": "string", "bullets": ["string"] }]
}`

  const userMessage = `Job Title: ${jobTitle}\nCompany: ${company}\n\nJob Description:\n${jobDescription}\n\nCandidate Profile:\n${profileCtx}`

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 3000,
    temperature: 0.7,
  })

  const text    = completion.choices[0]?.message?.content ?? ''
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(cleaned) as UniversalGeneratedResume
}

export async function generateUniversalCoverLetter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any>,
  jobDescription: string,
  jobTitle: string,
  company: string,
  tone = 'professional',
  tweak?: string
): Promise<string> {
  const profileCtx   = buildProfileContext(profile)
  const toneStr      = TONE_MAP[tone] ? `\n\nTONE: ${TONE_MAP[tone]}` : ''
  const tweakLine    = tweak ? `\n\nADDITIONAL INSTRUCTION: ${tweak}` : ''

  const systemPrompt = `You are an expert cover letter writer for any industry and country.

RULES:
- Maximum 4 paragraphs. Must fit on one page when printed.
- No em dashes. No "I am excited to", "I am passionate about", "leverage", "synergy", "results-driven", "I would welcome the opportunity", "Thank you for your consideration", or any corporate filler.
- Do not open with "I am writing to apply for".
- Be direct. Reference the actual company name and real requirements from the job description.
- Match the tone of the industry.
- If the candidate is missing a qualification, acknowledge it briefly and honestly.
- Write in first person, conversational but professional. End simply.
- Return plain text only. No markdown.${toneStr}${tweakLine}

STRUCTURE:
Paragraph 1: Why this specific role and company (2 sentences, direct)
Paragraph 2: Most relevant experience tied to this job (3-4 sentences)
Paragraph 3: Skills match + honest gap acknowledgment if needed (2-3 sentences)
Paragraph 4: Availability, work authorization if relevant, how to reach them (2 sentences max)`

  const userMessage = `Job Title: ${jobTitle}\nCompany: ${company}\n\nJob Description:\n${jobDescription}\n\nCandidate Profile:\n${profileCtx}`

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content ?? ''
}

export async function analyseJobDescription(jd: string): Promise<JobAnalysis> {
  const systemPrompt = `Extract structured information from this job description. Return valid JSON only. No markdown.

{
  "jobTitle": "string or empty string",
  "company": "string or empty string",
  "location": "string or empty string",
  "salary": "string or empty string",
  "requiredSkills": ["up to 15 required skills and tools"],
  "niceToHave": ["up to 8 optional or preferred skills"],
  "experienceLevel": "entry | junior | mid | senior | lead | executive",
  "employmentType": "full-time | part-time | contract | internship | unknown"
}`

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: jd },
    ],
    max_tokens: 600,
    temperature: 0.2,
  })

  const text    = completion.choices[0]?.message?.content ?? ''
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  return JSON.parse(cleaned) as JobAnalysis
}
