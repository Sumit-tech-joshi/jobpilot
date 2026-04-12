'use client';

import { useState, useEffect } from 'react';

export const CA_CITIES = [
  { value: 'Canada', label: 'All Canada' },
  { value: 'Victoria BC', label: 'Victoria, BC' },
  { value: 'Vancouver BC', label: 'Vancouver, BC' },
  { value: 'Toronto ON', label: 'Toronto, ON' },
  { value: 'Ottawa ON', label: 'Ottawa, ON' },
  { value: 'Calgary AB', label: 'Calgary, AB' },
  { value: 'Edmonton AB', label: 'Edmonton, AB' },
  { value: 'Montreal QC', label: 'Montreal, QC' },
  { value: 'Waterloo ON', label: 'Waterloo, ON' },
  { value: 'Remote Canada', label: 'Remote — Canada' },
];

interface JobSearchProps {
  onSearch: (keyword: string, location: string) => void;
  loading?: boolean;
  initialKeyword?: string;
  initialLocation?: string;
}

export default function JobSearch({
  onSearch,
  loading,
  initialKeyword = '',
  initialLocation = 'Canada',
}: JobSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation || 'Canada');

  // Sync if parent changes initial values (e.g. URL nav)
  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    if (initialLocation) setLocation(initialLocation);
  }, [initialLocation]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(keyword.trim(), location);
  }

  function handleLocationChange(val: string) {
    setLocation(val);
    onSearch(keyword.trim(), val);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title or keyword (optional)..."
          className="w-full bg-[#161b22] border border-[#30363d] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] transition-colors"
        />
      </div>
      <div className="sm:w-52 shrink-0">
        <select
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full bg-[#161b22] border border-[#30363d] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] transition-colors appearance-none cursor-pointer"
        >
          {CA_CITIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#1F4E79] hover:bg-[#2563a0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
      >
        {loading ? 'Searching...' : 'Search Jobs'}
      </button>
    </form>
  );
}
