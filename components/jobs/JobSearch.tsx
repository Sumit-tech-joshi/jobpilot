'use client';

import { useState } from 'react';

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
  initialLocation = '',
}: JobSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(keyword.trim() || 'software developer', location.trim() || 'Canada');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, keyword..."
          className="w-full bg-[#161b22] border border-[#30363d] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] transition-colors"
        />
      </div>
      <div className="flex-1 sm:max-w-[220px]">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location..."
          className="w-full bg-[#161b22] border border-[#30363d] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] transition-colors"
        />
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
