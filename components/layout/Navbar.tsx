'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/applications', label: 'My Applications' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117] border-b border-[#1f4e79]/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#1F4E79] font-bold text-xl tracking-tight">Job</span>
          <span className="text-white font-bold text-xl tracking-tight">Pilot</span>
          <span className="ml-1 text-xs bg-[#1F4E79]/20 text-[#4a9eda] px-2 py-0.5 rounded-full border border-[#1F4E79]/40">
            AI
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1F4E79]/20 text-[#4a9eda] border border-[#1F4E79]/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
