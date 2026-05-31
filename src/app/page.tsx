"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BountyCard from "@/components/BountyCard";
import HowItWorks from "@/components/howitworks";
import FeaturedExternal from "@/components/Featuredexternal";
import { useBounties } from "@/hooks/useBounties";
import { BOUNTY_STATE } from "@/lib/constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";

const TYPES = ["All", "Fixed", "Contest", "Grant"];
const CATS  = ["All", "Dev", "Design", "Content", "Research"];

export default function HomePage() {
  const { data: bounties, isLoading } = useBounties();
  const account = useCurrentAccount();
  const [activeType, setActiveType] = useState("All");
  const [activeCat,  setActiveCat]  = useState("All");
  const [search,     setSearch]     = useState("");

  const filtered = (bounties ?? []).filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeType !== "All") {
      const map: Record<string, number> = { Fixed: 0, Contest: 1, Grant: 2 };
      if (b.bountyType !== map[activeType]) return false;
    }
    return true;
  });

  const open   = filtered.filter(b => b.state === BOUNTY_STATE.OPEN);
  const review = filtered.filter(b => b.state === BOUNTY_STATE.REVIEW);
  const closed = filtered.filter(b => b.state === BOUNTY_STATE.CLOSED);
  const totalPrize = (bounties ?? []).reduce((a, b) => a + b.prizePool, 0);

  const Pill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border-none cursor-pointer transition-all font-sans ${active ? "bg-ocean-900 text-white" : "bg-white text-ocean-600 shadow-[0_0_0_1px_rgba(24,95,165,0.15)] hover:shadow-[0_0_0_1.5px_#FF6B6B]"}`}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-ocean-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-ocean-900 px-6 pt-16 pb-14">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/25 rounded-full px-3.5 py-1.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
            <span className="text-[11px] text-coral font-bold font-mono tracking-widest uppercase">Live on Sui Testnet</span>
          </div>
          <h1 className="font-sans font-bold text-4xl sm:text-5xl text-white leading-[1.1] tracking-tight mb-4">
            Where builders &amp;<br />
            <span className="text-coral">creators</span> get paid.
          </h1>
          <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-md">
            On-chain bounties with transparent hybrid judging. Post tasks, submit work, earn SUI. No middlemen, no trust required.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {!account ? (
              <>
                <ConnectButton />
                <a href="#bounties" className="text-[13px] font-semibold bg-white/8 text-white/70 px-6 py-3 rounded-lg no-underline border border-white/12 hover:bg-white/12 transition-colors">
                  Browse bounties
                </a>
              </>
            ) : (
              <>
                <a href="/create" className="text-[13px] font-bold bg-coral text-white px-6 py-3 rounded-lg no-underline hover:bg-coral-dark transition-colors">
                  Post a bounty →
                </a>
                <a href="#bounties" className="text-[13px] font-semibold bg-white/8 text-white/70 px-6 py-3 rounded-lg no-underline border border-white/12 hover:bg-white/12 transition-colors">
                  Browse open work
                </a>
              </>
            )}
          </div>

          {/* First time user nudge */}
          {!account && (
            <p className="text-[12px] text-white/30 mt-4">
              New here? Connect your Sui wallet to post bounties or submit work. ↑
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-ocean-950 border-b border-coral/10">
        <div className="max-w-2xl mx-auto flex flex-wrap">
          {[
            { val: (bounties ?? []).length.toString(), lbl: "Total bounties" },
            { val: totalPrize.toLocaleString(), lbl: "SUI in pools" },
            { val: open.length.toString(), lbl: "Open now" },
            { val: "96%", lbl: "Payout rate" },
          ].map((s, i) => (
            <div key={i} className={`flex-1 basis-28 px-6 py-4 ${i < 3 ? "border-r border-coral/8" : ""}`}>
              <p className="font-mono text-[22px] font-medium text-white mb-0.5">{s.val}</p>
              <p className="text-[11px] text-coral/60">{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works — shown to non-connected users */}
      {!account && <HowItWorks />}
      
      {/* Bounties */}
      <div id="bounties" className="max-w-2xl mx-auto px-6 py-8">

        {/* Search */}
        <div className="relative mb-5">
          <input
            className="w-full text-[13px] py-3 pl-10 pr-4 border border-ocean-100 rounded-lg bg-white text-ocean-900 outline-none focus:border-coral font-sans transition-colors"
            placeholder="Search bounties…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-ocean-600">⌕</span>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-2">
          {CATS.map(c => <Pill key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />)}
        </div>
        <div className="flex flex-wrap gap-2 mb-7">
          {TYPES.map(t => <Pill key={t} label={t} active={activeType === t} onClick={() => setActiveType(t)} />)}
        </div>

        {isLoading ? (
          <div className="text-center py-16 font-mono text-[12px] text-ocean-600">Loading bounties…</div>
        ) : (
          <>
            {open.length > 0 && (
              <>
                <SectionLabel label="Open" count={open.length} />
                <div className="flex flex-col gap-3 mb-8">{open.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
              </>
            )}
            {review.length > 0 && (
              <>
                <SectionLabel label="In review" count={review.length} />
                <div className="flex flex-col gap-3 mb-8">{review.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
              </>
            )}
            {closed.length > 0 && (
              <>
                <SectionLabel label="Closed" count={closed.length} />
                <div className="flex flex-col gap-3 mb-8">{closed.map(b => <BountyCard key={b.id} bounty={b} />)}</div>
              </>
            )}
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🪸</p>
                <p className="font-sans font-bold text-lg text-ocean-900 mb-2">No bounties yet</p>
                <p className="text-[13px] text-ocean-600 mb-6">Be the first to post one.</p>
                {account ? (
                  <a href="/create" className="text-[13px] font-bold bg-coral text-white px-6 py-3 rounded-lg no-underline">
                    Post a bounty →
                  </a>
                ) : (
                  <ConnectButton />
                )}
              </div>
            )}
          </>
        )}
      </div>
<FeaturedExternal />
      {/* How it works for connected users too — at bottom */}
      {account && <HowItWorks />}
    </div>
  );
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5">
      <div className="w-2 h-2 rounded-full bg-coral" />
      <span className="text-[13px] font-bold text-ocean-900">{label}</span>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-coral-light text-coral-dark font-mono">{count}</span>
    </div>
  );
}