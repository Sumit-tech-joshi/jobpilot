export default function CoverLetterPreview({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 max-h-[600px] overflow-y-auto">
      <div className="space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-gray-300 text-sm leading-relaxed">
            {para.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}
