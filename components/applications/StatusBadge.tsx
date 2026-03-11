import { ApplicationStatus } from '@/types';

const statusConfig: Record<ApplicationStatus, { label: string; classes: string }> = {
  saved: { label: 'Saved', classes: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  applied: { label: 'Applied', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  interviewing: { label: 'Interviewing', classes: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  rejected: { label: 'Rejected', classes: 'bg-red-500/20 text-red-300 border-red-500/30' },
  offer: { label: 'Offer', classes: 'bg-green-500/20 text-green-300 border-green-500/30' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status] || statusConfig.saved;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
