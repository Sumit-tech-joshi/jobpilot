import { GeneratedResume } from '@/types';

export default function ResumePreview({ resume }: { resume: GeneratedResume }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-sm space-y-5 max-h-[600px] overflow-y-auto">
      {/* Summary */}
      <section>
        <h3 className="text-[#8B5CF6] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#6366F1]/20 pb-1">
          Summary
        </h3>
        <p className="text-[#CBD5E1] leading-relaxed">{resume.summary}</p>
      </section>

      {/* Skills */}
      <section>
        <h3 className="text-[#8B5CF6] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#6366F1]/20 pb-1">
          Skills
        </h3>
        <div className="space-y-1.5">
          {Object.entries(resume.skills).map(([category, items]) =>
            items && items.length > 0 ? (
              <div key={category}>
                <span className="text-[#94A3B8] font-medium capitalize">{category}: </span>
                <span className="text-[#CBD5E1]">{items.join(', ')}</span>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h3 className="text-[#8B5CF6] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#6366F1]/20 pb-1">
          Experience
        </h3>
        <div className="space-y-4">
          {resume.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex flex-wrap items-baseline gap-1">
                <span className="text-white font-semibold">{exp.title}</span>
                <span className="text-[#8B5CF6]">at {exp.company}</span>
              </div>
              <p className="text-[#475569] text-xs italic mb-2">
                {exp.location} | {exp.startDate} - {exp.endDate}
              </p>
              {exp.projects?.map((proj, j) => (
                <div key={j} className="mb-2">
                  <p className="text-[#CBD5E1] font-medium text-xs mb-1">{proj.name}</p>
                  <ul className="space-y-1">
                    {proj.bullets.map((b, k) => (
                      <li key={k} className="text-[#94A3B8] flex gap-2">
                        <span className="text-[#6366F1] mt-0.5 shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {exp.bullets?.map((b, j) => (
                <li key={j} className="text-[#94A3B8] flex gap-2 list-none">
                  <span className="text-[#6366F1] mt-0.5 shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
              {exp.general?.map((b, j) => (
                <li key={j} className="text-[#94A3B8] flex gap-2 list-none mt-1">
                  <span className="text-[#6366F1] mt-0.5 shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <h3 className="text-[#8B5CF6] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#6366F1]/20 pb-1">
          Education
        </h3>
        <div className="space-y-2">
          {resume.education.map((edu, i) => (
            <div key={i}>
              <p className="text-white font-medium">{edu.degree}</p>
              <p className="text-[#475569] text-xs italic">
                {edu.institution} |{' '}
                {edu.startDate ? `${edu.startDate} - ` : ''}{edu.endDate}
              </p>
              {edu.notes && <p className="text-[#94A3B8] text-xs mt-0.5">{edu.notes}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
