import Anthropic from '@anthropic-ai/sdk';
import { masterProfile } from '@/data/master-profile';
import { GeneratedResume } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

export async function generateResume(
  jobTitle: string,
  jobDescription: string,
  companyName: string
): Promise<GeneratedResume> {
  const systemPrompt = `You are an expert resume writer. Your job is to take the candidate's master profile and rewrite their resume specifically tailored for the job description provided.

Rules:
- Keep all facts accurate. Do not invent experience or skills.
- Reorder and emphasize skills and experience that match the job description.
- Use keywords from the job description naturally throughout.
- Keep bullet points concise, specific, and results-focused.
- Do not use phrases like "results-driven", "passionate", "dynamic", "leverage", "synergy".
- Do not use em dashes (—). Use plain language.
- Write like a real human wrote this, not an AI.
- Return a JSON object with this structure:
{
  "summary": "tailored summary paragraph",
  "skills": { same structure as master profile skills, reordered by relevance },
  "experience": [ array of experience with tailored bullets ],
  "education": [ same as master profile ]
}
Return only valid JSON. No markdown, no explanation.`;

  const userMessage = `Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
${jobDescription}

Candidate Master Profile:
${JSON.stringify(masterProfile, null, 2)}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  return JSON.parse(cleaned) as GeneratedResume;
}

export async function generateCoverLetter(
  jobTitle: string,
  jobDescription: string,
  companyName: string
): Promise<string> {
  const systemPrompt = `You are an expert cover letter writer. Write a tailored cover letter for the candidate applying to the job described.

Rules:
- Do not use em dashes (—).
- Do not use phrases like "I am excited to", "I am passionate about", "leverage", "synergy", "dynamic", "results-driven".
- Write in first person, conversational but professional tone.
- Be direct and specific. Reference the actual company and job requirements.
- Acknowledge any gaps or missing skills honestly and briefly.
- Maximum 4 paragraphs.
- Do not use bullet points in the cover letter.
- Write like a real human wrote this, not like AI output.
- Return plain text only. No markdown formatting.`;

  const userMessage = `Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
${jobDescription}

Candidate Master Profile:
${JSON.stringify(masterProfile, null, 2)}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
