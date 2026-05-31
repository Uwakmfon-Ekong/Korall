"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BountyCard from "@/components/BountyCard";
import HowItWorks from "@/components/howitworks";
import FeaturedExternal from "@/components/Featuredexternal";
import BountyCardSkeleton from "@/components/BountyCardSkeleton";
import { useBounties } from "@/hooks/useBounties";
import { BOUNTY_STATE } from "@/lib/constants";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";

const TYPES = ["All", "Fixed", "Contest", "Grant"];

export default function HomePage() {
  const { data: bounties, isLoading } = useBounties();
  const account = useCurrentAccount();

  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = (bounties ?? []).filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;

    if (activeType !== "All") {
      const map: Record<string, number> = {
        Fixed: 0,
        Contest: 1,
        Grant: 2,
      };
      if (b.bountyType !== map[activeType]) return false;
    }

    return true;
  });

  const open = filtered.filter((b) => b.state === BOUNTY_STATE.OPEN);
  const review = filtered.filter((b) => b.state === BOUNTY_STATE.REVIEW);
  const closed = filtered.filter((b) => b.state === BOUNTY_STATE.CLOSED);

  const Pill = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`text-[12px] px-3 py-1.5 rounded-full font-medium transition-all border font-sans
      ${
        active
          ? "bg-koral-600 text-white border-koral-600"
          : "bg-white text-koral-700 border-koral-100 hover:border-koral-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-koral-50 font-syne">
      <Navbar />

      {/* HERO (UNCHANGED COPY) */}
      <div className="bg-koral-700 text-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-koral-200 font-mono mb-4">
              Live on Sui Testnet
            </p>

            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4 font-syne">
              Where builders &amp;
              <br />
              <span className="text-koral-300">creators</span> get paid.
            </h1>

            <p className="text-sm text-white/70 leading-relaxed">
              On-chain bounties with transparent hybrid judging. Post tasks, submit work, earn SUI. No middlemen, no trust required.
            </p>

            <div className="flex gap-3 mt-8 flex-wrap">
              {!account ? (
                <ConnectButton />
              ) : (
                <>
                  <a
                    href="/create"
                    className="bg-koral-600 hover:bg-koral-500 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    Post a bounty →
                  </a>

                  <a
                    href="#bounties"
                    className="bg-white/10 hover:bg-white/15 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    Browse bounties
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT WRAPPER (IMPORTANT FOR MODERN FEEL) */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* SEARCH + FILTER */}
        <div className="mb-8">
          <input
            className="w-full px-4 py-3 rounded-xl border border-koral-100 bg-white text-sm outline-none focus:border-koral-400 transition"
            placeholder="Search bounties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 mt-4">
            {TYPES.map((t) => (
              <Pill
                key={t}
                label={t}
                active={activeType === t}
                onClick={() => setActiveType(t)}
              />
            ))}
          </div>
        </div>

        {/* LIST */}
        <div id="bounties" className="space-y-10">
         {isLoading ? (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => <BountyCardSkeleton key={i} />)}
  </div>
) : (
            <>
              {open.length > 0 && (
                <Section title="Open" count={open.length}>
                  {open.map((b) => (
                    <BountyCard key={b.id} bounty={b} />
                  ))}
                </Section>
              )}

              {review.length > 0 && (
                <Section title="In review" count={review.length}>
                  {review.map((b) => (
                    <BountyCard key={b.id} bounty={b} />
                  ))}
                </Section>
              )}

              {closed.length > 0 && (
                <Section title="Closed" count={closed.length}>
                  {closed.map((b) => (
                    <BountyCard key={b.id} bounty={b} />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </div>

      <FeaturedExternal />
      <HowItWorks />
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-koral-900 font-syne">
          {title}
        </h2>

        <span className="text-xs font-mono text-koral-500">
          {count}
        </span>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}