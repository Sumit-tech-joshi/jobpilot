export default function CoverLetterPreview({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 max-h-[600px] overflow-y-auto">
      <div className="space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-[#CBD5E1] text-sm leading-relaxed">
            {para.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}
