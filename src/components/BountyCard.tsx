import Link from "next/link";
import { Bounty } from "@/hooks/useBounties";
import { STATE_LABELS, TYPE_LABELS } from "@/lib/constants";

const TYPE_BAR: Record<number, string> = {
  0: "bg-coral",
  1: "bg-teal",
  2: "bg-yellow-500",
};

const STATE_BADGE: Record<number, string> = {
  0: "bg-teal-light text-teal",
  1: "bg-purple-100 text-purple-700",
  2: "bg-gray-100 text-gray-500",
};

const SKILL_TAGS: Record<number, string[]> = {
  0: ["Development", "Move", "Sui"],
  1: ["Design", "Creative"],
  2: ["Research", "Writing"],
};

function timeRemaining(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86_400_000);
  return days > 0 ? `${days}d left` : `${Math.floor(diff / 3_600_000)}h left`;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function BountyCard({ bounty }: { bounty: Bounty }) {
  const tags = SKILL_TAGS[bounty.bountyType] ?? ["Web3"];
  const timeLeft = timeRemaining(bounty.submissionDeadlineMs);
  const isUrgent = bounty.submissionDeadlineMs - Date.now() < 3 * 86_400_000 && bounty.submissionDeadlineMs > Date.now();

  return (
    <Link href={`/bounty/${bounty.id}`} className="no-underline">
      <div className="bg-white border border-ocean-100 rounded-xl p-5 cursor-pointer transition-all hover:border-coral hover:-translate-y-px flex flex-col gap-3.5">

        {/* Top */}
        <div className="flex items-start gap-3">
          <div className={`w-0.5 self-stretch rounded-sm ${TYPE_BAR[bounty.bountyType]} shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full shrink-0"
                style={{ background: `hsl(${parseInt(bounty.poster.slice(2, 4), 16) * 1.4}, 60%, 50%)` }}
              />
              <span className="text-[11px] text-ocean-600 font-mono">{shortAddr(bounty.poster)}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${STATE_BADGE[bounty.state]}`}>
                {STATE_LABELS[bounty.state]}
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-ocean-900 leading-snug truncate">{bounty.title}</h3>
          </div>

          {/* Prize */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-ocean-600 font-mono mb-0.5">reward</p>
            <p className="text-[20px] font-bold text-ocean-900 font-mono leading-none">{bounty.prizePool.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-coral font-mono mt-0.5">SUI</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TYPE_BAR[bounty.bountyType]} bg-opacity-10 text-ocean-900`}>
            {TYPE_LABELS[bounty.bountyType]}
          </span>
          {tags.map(tag => (
            <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-ocean-50 text-ocean-600 font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-ocean-100">
          <div className="flex gap-4">
            <span className="text-[11px] text-ocean-600">
              <strong className="text-ocean-900">{bounty.submissionCount}</strong> submissions
            </span>
            <span className="text-[11px] text-ocean-600">
              <strong className="text-ocean-900">{bounty.judgeCount}</strong> judges
            </span>
          </div>
          <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full ${isUrgent ? "bg-red-50 text-red-600" : "bg-ocean-100 text-ocean-600"}`}>
            {timeLeft}
          </span>
        </div>
      </div>
    </Link>
  );
}