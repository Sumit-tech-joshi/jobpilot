import { GeneratedResume } from '@/types';

export default function ResumePreview({ resume }: { resume: GeneratedResume }) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 text-sm space-y-5 max-h-[600px] overflow-y-auto">
      {/* Summary */}
      <section>
        <h3 className="text-[#4a9eda] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#1F4E79]/30 pb-1">
          Summary
        </h3>
        <p className="text-gray-300 leading-relaxed">{resume.summary}</p>
      </section>

      {/* Skills */}
      <section>
        <h3 className="text-[#4a9eda] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#1F4E79]/30 pb-1">
          Skills
        </h3>
        <div className="space-y-1.5">
          {Object.entries(resume.skills).map(([category, items]) =>
            items && items.length > 0 ? (
              <div key={category}>
                <span className="text-gray-400 font-medium capitalize">{category}: </span>
                <span className="text-gray-300">{items.join(', ')}</span>
              </div>
            ) : null
          )}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h3 className="text-[#4a9eda] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#1F4E79]/30 pb-1">
          Experience
        </h3>
        <div className="space-y-4">
          {resume.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex flex-wrap items-baseline gap-1">
                <span className="text-white font-semibold">{exp.title}</span>
                <span className="text-[#4a9eda]">at {exp.company}</span>
              </div>
              <p className="text-gray-500 text-xs italic mb-2">
                {exp.location} | {exp.startDate} - {exp.endDate}
              </p>
              {exp.projects?.map((proj, j) => (
                <div key={j} className="mb-2">
                  <p className="text-gray-300 font-medium text-xs mb-1">{proj.name}</p>
                  <ul className="space-y-1">
                    {proj.bullets.map((b, k) => (
                      <li key={k} className="text-gray-400 flex gap-2">
                        <span className="text-[#1F4E79] mt-0.5 shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {exp.bullets?.map((b, j) => (
                <li key={j} className="text-gray-400 flex gap-2 list-none">
                  <span className="text-[#1F4E79] mt-0.5 shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
              {exp.general?.map((b, j) => (
                <li key={j} className="text-gray-400 flex gap-2 list-none mt-1">
                  <span className="text-[#1F4E79] mt-0.5 shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <h3 className="text-[#4a9eda] font-semibold uppercase tracking-wide text-xs mb-2 border-b border-[#1F4E79]/30 pb-1">
          Education
        </h3>
        <div className="space-y-2">
          {resume.education.map((edu, i) => (
            <div key={i}>
              <p className="text-white font-medium">{edu.degree}</p>
              <p className="text-gray-500 text-xs italic">
                {edu.institution} |{' '}
                {edu.startDate ? `${edu.startDate} - ` : ''}{edu.endDate}
              </p>
              {edu.notes && <p className="text-gray-400 text-xs mt-0.5">{edu.notes}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
