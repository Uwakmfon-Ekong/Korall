import Link from "next/link";
import { Bounty } from "@/hooks/useBounties";
import { STATE_LABELS, TYPE_LABELS } from "@/lib/constants";

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
  const timeLeft = timeRemaining(bounty.submissionDeadlineMs);

  const isUrgent =
    bounty.submissionDeadlineMs - Date.now() < 3 * 86_400_000 &&
    bounty.submissionDeadlineMs > Date.now();

  return (
    <Link href={`/bounty/${bounty.id}`} className="no-underline">
      <div
        className="
          bg-white
          border border-ocean-100
          rounded-xl
          p-5
          transition
          hover:border-koral/40
          hover:-translate-y-[1px]
          hover:shadow-sm
          flex flex-col gap-4
          font-syne
          mb-4
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">

            {/* subtle left indicator */}
            <div className="w-1 h-full min-h-[44px] rounded-full bg-koral/80 shrink-0" />

            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-ocean-900 leading-snug truncate">
                {bounty.title}
              </h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-ocean-500 font-mono">
                  {shortAddr(bounty.poster)}
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-50 text-koral-600 font-medium">
                  {TYPE_LABELS[bounty.bountyType]}
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-koral/10 text-koral font-semibold">
                  {STATE_LABELS[bounty.state]}
                </span>
              </div>
            </div>
          </div>

          {/* REWARD */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-koral-500 font-mono">reward</p>
            <p className="text-[18px] font-bold text-koral-900 font-mono leading-none">
              {bounty.prizePool.toLocaleString()}
            </p>
            <p className="text-[10px] font-semibold text-koral mt-1">SUI</p>
          </div>
        </div>

        {/* META */}
        <div className="flex items-center justify-between pt-3 border-t border-koral-100">
          <div className="flex gap-4 text-[11px] text-koral-600">
            <span>
              <span className="text-koral-900 font-semibold">
                {bounty.submissionCount}
              </span>{" "}
              submissions
            </span>

            <span>
              <span className="text-koral-900 font-semibold">
                {bounty.judgeCount}
              </span>{" "}
              judges
            </span>
          </div>

          <span
            className={`
              text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full
              ${
                isUrgent
                  ? "bg-koral/10 text-koral"
                  : "bg-ocean-50 text-ocean-600"
              }
            `}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    </Link>
  );
}