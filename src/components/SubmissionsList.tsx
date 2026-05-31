"use client";

import { useSubmissions } from "@/hooks/useSubmissions";

interface Props {
  bountyId: string;
  isPoster: boolean;
  isReview: boolean;
  onSelectForVoting?: (submissionId: string) => void;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function SubmissionsList({
  bountyId,
  isPoster,
  isReview,
  onSelectForVoting,
}: Props) {
  const { data: submissions, isLoading } = useSubmissions(bountyId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-ocean-100">
        <h2 className="font-sans font-bold text-[14px] text-ocean-900 mb-4 pb-3 border-b border-ocean-50">
          Submissions
        </h2>
        <p className="text-[12px] text-ocean-400 font-mono">
          Loading submissions…
        </p>
      </div>
    );
  }

  if (!submissions?.length) {
    return (
      <div className="bg-white rounded-xl p-5 border border-ocean-100">
        <h2 className="font-sans font-bold text-[14px] text-ocean-900 mb-4 pb-3 border-b border-ocean-50">
          Submissions · 0
        </h2>
        <p className="text-[12px] text-ocean-400">
          No submissions yet. Share this bounty to attract hunters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-ocean-100">
      <h2 className="font-sans font-bold text-[14px] text-ocean-900 mb-4 pb-3 border-b border-ocean-50">
        Submissions · {submissions.length}
      </h2>

      <div className="flex flex-col gap-4">
        {submissions.map((s, i) => (
          <div
            key={s.id}
            className="border border-ocean-100 rounded-xl p-4 hover:border-ocean-200 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
                  style={{
                    background: `hsl(${parseInt(s.hunter.slice(2, 4), 16) * 1.4}, 55%, 45%)`,
                  }}
                >
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-sans font-bold text-[13px] text-ocean-900">
                    {s.name}
                  </p>
                  <p className="text-[10px] text-ocean-400 font-mono">
                    {shortAddr(s.hunter)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal uppercase tracking-wider">
                  #{i + 1}
                </span>
                <p className="text-[10px] text-ocean-400 font-mono mt-1">
                  {s.submittedAt}
                </p>
              </div>
            </div>

            {/* Project link */}
            {s.projectLink && s.projectLink.startsWith("http") && (
              <a
                href={s.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-ocean-50 border border-ocean-100 no-underline hover:border-coral transition-colors mb-3 group"
              >
                <div>
                  <p className="text-[10px] text-ocean-400 font-mono mb-0.5">
                    Project link
                  </p>
                  <p className="text-[12px] font-bold text-ocean-800 truncate max-w-xs">
                    {s.projectLink}
                  </p>
                </div>
                <span className="text-coral text-sm group-hover:translate-x-0.5 transition-transform">
                  ↗
                </span>
              </a>
            )}

            {/* Comments */}
            {s.comments && (
              <div className="px-3 py-2.5 rounded-lg bg-ocean-50 border border-ocean-100 mb-3">
                <p className="text-[10px] text-ocean-400 font-mono mb-1">
                  Notes from hunter
                </p>
                <p className="text-[12px] text-ocean-700 leading-relaxed">
                  {s.comments}
                </p>
              </div>
            )}

            {/* On-chain proof */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">🪸</span>
                <span className="text-[10px] text-ocean-400 font-mono">
                  NFT: {s.id.slice(0, 12)}…
                </span>
              </div>

              {/* Poster actions */}
              {isPoster && isReview && onSelectForVoting && (
                <button
                  onClick={() => onSelectForVoting(s.id)}
                  className="text-[11px] font-bold text-coral bg-coral-light px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-coral hover:text-white transition-colors font-sans"
                >
                  Vote for this →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Poster note during review */}
      {isPoster && isReview && (
        <div className="mt-4 p-3 bg-ocean-50 rounded-lg border border-ocean-100">
          <p className="text-[11px] text-ocean-600 leading-relaxed">
            <strong>Review phase is open.</strong> Click "Vote for this →" on
            any submission to select it in the voting panel, then commit your
            score.
          </p>
        </div>
      )}

      {/* Poster note during open */}
      {isPoster && !isReview && (
        <div className="mt-4 p-3 bg-ocean-50 rounded-lg border border-ocean-100">
          <p className="text-[11px] text-ocean-600 leading-relaxed">
            Only you can see these submissions. Once the deadline passes, start
            the review phase to begin judging.
          </p>
        </div>
      )}
    </div>
  );
}
