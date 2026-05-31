"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BountyCard from "@/components/BountyCard";
import BountyCardSkeleton from "@/components/BountyCardSkeleton";
import { useBounties } from "@/hooks/useBounties";
import { BOUNTY_STATE, TYPE_LABELS } from "@/lib/constants";

const TYPES = ["All", "Fixed", "Contest", "Grant"];
const CATS  = ["All", "Dev", "Design", "Content", "Research"];
const STATES = ["All", "Open", "In review", "Closed"];

export default function BountiesPage() {
  const { data: bounties, isLoading } = useBounties();

  const [search,     setSearch]     = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeCat,  setActiveCat]  = useState("All");
  const [activeState, setActiveState] = useState("All");
  const [sort, setSort] = useState<"newest" | "prize" | "deadline">("newest");

  const filtered = (bounties ?? []).filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeType !== "All") {
      const map: Record<string, number> = { Fixed: 0, Contest: 1, Grant: 2 };
      if (b.bountyType !== map[activeType]) return false;
    }
    if (activeState !== "All") {
      const map: Record<string, number> = { Open: 0, "In review": 1, Closed: 2 };
      if (b.state !== map[activeState]) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "prize") return b.prizePool - a.prizePool;
    if (sort === "deadline") return a.submissionDeadlineMs - b.submissionDeadlineMs;
    return 0; // newest — keep event order
  });

  const open   = sorted.filter(b => b.state === BOUNTY_STATE.OPEN);
  const review = sorted.filter(b => b.state === BOUNTY_STATE.REVIEW);
  const closed = sorted.filter(b => b.state === BOUNTY_STATE.CLOSED);

  const totalPrize = (bounties ?? []).reduce((a, b) => a + b.prizePool, 0);
  const totalClosed = (bounties ?? []).filter(b => b.state === BOUNTY_STATE.CLOSED).length;

  const Pill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`text-[12px] font-medium px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all font-syne ${
        active
          ? "bg-koral-600 text-white border-koral-600"
          : "bg-white text-koral-600 border-koral-100 hover:border-koral-400"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-koral-50 font-syne flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-koral-700 px-6 pt-10 pb-8 border-b border-koral-600">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-mono text-koral-200 tracking-widest uppercase mb-2">
            All bounties
          </p>
          <h1 className="font-syne font-bold text-2xl sm:text-3xl text-white tracking-tight mb-1">
            Bounty explorer
          </h1>
          <p className="text-[13px] text-white/50 mb-6">
            Browse every bounty posted on Koral — open, in review, and closed.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6">
            {[
              { val: (bounties ?? []).length.toString(), lbl: "Total bounties" },
              { val: open.length.toString(), lbl: "Open now" },
              { val: totalPrize.toLocaleString(), lbl: "SUI in pools" },
              { val: totalClosed.toString(), lbl: "Completed" },
            ].map((s, i) => (
              <div key={i}>
                <p className="font-mono font-bold text-[22px] text-white leading-none">{s.val}</p>
                <p className="text-[11px] text-koral-200/60 mt-0.5">{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-koral-100 px-6 py-4 sticky top-14 z-40">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">

          {/* Search + sort */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                className="w-full text-[13px] py-2.5 pl-9 pr-4 border border-koral-100 rounded-lg bg-koral-50 text-koral-900 outline-none focus:border-koral-500 transition-colors"
                placeholder="Search bounties by title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-koral-400 text-base">⌕</span>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="text-[12px] font-medium px-3 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-700 outline-none focus:border-koral-500 cursor-pointer font-syne"
            >
              <option value="newest">Newest first</option>
              <option value="prize">Highest prize</option>
              <option value="deadline">Deadline soon</option>
            </select>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {STATES.map(s => <Pill key={s} label={s} active={activeState === s} onClick={() => setActiveState(s)} />)}
            <div className="w-px bg-koral-100 self-stretch mx-1" />
            {TYPES.map(t => <Pill key={t} label={t} active={activeType === t} onClick={() => setActiveType(t)} />)}
            <div className="w-px bg-koral-100 self-stretch mx-1" />
            {CATS.map(c => <Pill key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />)}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <BountyCardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🪸</p>
            <p className="font-syne font-bold text-lg text-koral-900 mb-2">No bounties found</p>
            <p className="text-[13px] text-koral-500 mb-6">Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setSearch(""); setActiveType("All"); setActiveCat("All"); setActiveState("All"); }}
              className="text-[13px] font-bold bg-koral-600 text-white px-6 py-3 rounded-lg border-none cursor-pointer font-syne hover:bg-koral-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* Show sections only when not filtering by state */}
            {activeState === "All" ? (
              <>
                {open.length > 0 && (
                  <Section label="Open" count={open.length} color="bg-green-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {open.map(b => <BountyCard key={b.id} bounty={b} />)}
                    </div>
                  </Section>
                )}
                {review.length > 0 && (
                  <Section label="In review" count={review.length} color="bg-purple-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {review.map(b => <BountyCard key={b.id} bounty={b} />)}
                    </div>
                  </Section>
                )}
                {closed.length > 0 && (
                  <Section label="Closed" count={closed.length} color="bg-gray-400">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {closed.map(b => <BountyCard key={b.id} bounty={b} />)}
                    </div>
                  </Section>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sorted.map(b => <BountyCard key={b.id} bounty={b} />)}
              </div>
            )}

            {/* Summary */}
            <div className="text-center pt-4 border-t border-koral-100">
              <p className="text-[12px] text-koral-400 font-mono">
                Showing {sorted.length} of {(bounties ?? []).length} bounties
              </p>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}

function Section({ label, count, color, children }: {
  label: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="font-syne font-bold text-[14px] text-koral-900">{label}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-koral-100 text-koral-600 font-mono">{count}</span>
      </div>
      {children}
    </div>
  );
}