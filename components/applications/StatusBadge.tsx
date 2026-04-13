import { ApplicationStatus } from '@/types';

const statusConfig: Record<ApplicationStatus, { label: string; classes: string }> = {
  saved: { label: 'Saved', classes: 'bg-[#475569]/20 text-[#94A3B8] border-[#475569]/30' },
  applied: { label: 'Applied', classes: 'bg-[#6366F1]/20 text-[#818CF8] border-[#6366F1]/30' },
  interviewing: { label: 'Interviewing', classes: 'bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30' },
  rejected: { label: 'Rejected', classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  offer: { label: 'Offer', classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status] || statusConfig.saved;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
