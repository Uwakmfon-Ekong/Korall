"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, MODULE } from "@/lib/constants";
import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface JudgeStats {
  totalSessions: number;
  totalBounties: string[];
  approvedOn: string[];
}

// ── Hooks ──────────────────────────────────────────────────────────────────

function useJudgeStats(address: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["judgeStats", address],
    queryFn: async (): Promise<JudgeStats> => {
      if (!address) return { totalSessions: 0, totalBounties: [], approvedOn: [] };

      // Get all JudgeApplied events for this address
      const applied = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE}::JudgeApplied` },
        limit: 50,
      });

      // Get all JudgeApproved events for this address
      const approved = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE}::JudgeApproved` },
        limit: 50,
      });

      const myApplications = applied.data.filter(
        e => (e.parsedJson as { applicant: string }).applicant === address
      ).map(e => (e.parsedJson as { bounty_id: string }).bounty_id);

      const myApprovals = approved.data.filter(
        e => (e.parsedJson as { judge: string }).judge === address
      ).map(e => (e.parsedJson as { bounty_id: string }).bounty_id);

      return {
        totalSessions: myApprovals.length,
        totalBounties: myApplications,
        approvedOn: myApprovals,
      };
    },
    enabled: !!address,
  });
}

function useVoteHistory(address: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["voteHistory", address],
    queryFn: async () => {
      if (!address) return [];
      const events = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE}::VoteRevealed` },
        limit: 50,
      });
      return events.data.filter(
        e => (e.parsedJson as { judge: string }).judge === address
      );
    },
    enabled: !!address,
  });
}

// ── Tier logic ─────────────────────────────────────────────────────────────

function getTier(sessions: number): { label: string; color: string; bg: string; next: number | null; desc: string } {
  if (sessions >= 10) return { label: "Elite", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", next: null, desc: "Full access. Any bounty, dispute resolution." };
  if (sessions >= 5)  return { label: "Verified", color: "text-koral-600", bg: "bg-koral-50 border-koral-200", next: 10, desc: "High-value bounties unlocked." };
  if (sessions >= 2)  return { label: "Trusted", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", next: 5, desc: "Most bounty types available." };
  return { label: "New", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", next: 2, desc: "Small bounties only. Build your track record." };
}

function getPoints(sessions: number): number {
  return sessions * 10;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function JudgeHubPage() {
  const account = useCurrentAccount();
  const { data: stats, isLoading } = useJudgeStats(account?.address);
  const { data: votes } = useVoteHistory(account?.address);

  if (!account) {
    return (
      <div className="min-h-screen bg-koral-50 font-syne flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-5xl mb-4">⚖️</p>
          <h1 className="font-syne font-bold text-xl text-koral-900 mb-2">Judge Hub</h1>
          <p className="text-[13px] text-koral-500 max-w-xs mb-6">
            Connect your wallet to see your judging history, reputation score, and tier.
          </p>
          <ConnectButton />
        </div>
        <Footer />
      </div>
    );
  }

  const sessions = stats?.totalSessions ?? 0;
  const points = getPoints(sessions);
  const tier = getTier(sessions);
  const voteCount = votes?.length ?? 0;

  return (
    <div className="min-h-screen bg-koral-50 font-syne flex flex-col">
      <Navbar />

      {/* Header */}
      {/* <div className="bg-koral-700 px-6 pt-10 pb-8 border-b border-koral-600">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-mono text-koral-200 tracking-widest uppercase mb-2">Judge hub</p>
          <h1 className="font-syne font-bold text-2xl text-white tracking-tight mb-1">Your judging profile</h1>
          <p className="text-[12px] text-koral-200/50 font-mono">
            {account.address.slice(0, 10)}…{account.address.slice(-6)}
          </p>
        </div>
      </div> */}

      <div className="max-w-3xl mx-auto px-6 py-8 flex-1 w-full">
        {isLoading ? (
          <div className="text-center py-16 font-mono text-[12px] text-koral-400">Loading your judge profile…</div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Tier card */}
            <div className="bg-koral-700 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono text-koral-200/50 uppercase tracking-widest mb-2">Current tier</p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${tier.bg} ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-koral-200/60 max-w-xs">{tier.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-mono text-koral-200/50 uppercase tracking-widest mb-1">Reputation</p>
                  <p className="font-mono text-[36px] font-bold text-white leading-none">{points}</p>
                  <p className="text-[11px] text-koral-200/50 font-mono">pts</p>
                </div>
              </div>

              {/* Progress to next tier */}
              {tier.next !== null && (
                <div className="mt-5">
                  <div className="flex justify-between text-[10px] font-mono text-koral-200/50 mb-1.5">
                    <span>{sessions} sessions completed</span>
                    <span>{tier.next} needed for next tier</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div
                      className="h-1.5 bg-koral-300 rounded-full transition-all"
                      style={{ width: `${Math.min((sessions / tier.next) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {tier.next === null && (
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-[12px] text-koral-200/60">Maximum tier reached. You're an Elite judge.</span>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: sessions.toString(), lbl: "Sessions approved", icon: "✓" },
                { val: voteCount.toString(), lbl: "Votes cast", icon: "⚖️" },
                { val: stats?.totalBounties.length.toString() ?? "0", lbl: "Applications sent", icon: "📋" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-koral-100 text-center">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="font-mono font-bold text-[22px] text-koral-900 leading-none mb-1">{s.val}</p>
                  <p className="text-[10px] text-koral-400">{s.lbl}</p>
                </div>
              ))}
            </div>

            {/* How points work */}
            <div className="bg-white rounded-xl p-5 border border-koral-100">
              <h2 className="font-syne font-bold text-[14px] text-koral-900 mb-4 pb-3 border-b border-koral-50">
                How reputation works
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { action: "Approved to judge a bounty", pts: "+10 pts", color: "text-green-600 bg-green-50" },
                  { action: "Completed judging on time", pts: "+10 pts", color: "text-green-600 bg-green-50" },
                  { action: "Vote aligned with panel majority", pts: "+5 pts", color: "text-green-600 bg-green-50" },
                  { action: "Judged high-value bounty (500+ SUI)", pts: "+20 pts", color: "text-green-600 bg-green-50" },
                  { action: "Missed judging deadline", pts: "−15 pts", color: "text-red-600 bg-red-50" },
                  { action: "Dispute lost", pts: "−30 pts", color: "text-red-600 bg-red-50" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-koral-600">{r.action}</span>
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${r.color}`}>
                      {r.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier ladder */}
            <div className="bg-white rounded-xl p-5 border border-koral-100">
              <h2 className="font-syne font-bold text-[14px] text-koral-900 mb-4 pb-3 border-b border-koral-50">
                Tier ladder
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { tier: "New",      range: "0–1 sessions",   desc: "Small bounties only",            active: sessions < 2 },
                  { tier: "Trusted",  range: "2–4 sessions",   desc: "Most bounty types",              active: sessions >= 2 && sessions < 5 },
                  { tier: "Verified", range: "5–9 sessions",   desc: "High-value bounties unlocked",   active: sessions >= 5 && sessions < 10 },
                  { tier: "Elite",    range: "10+ sessions",   desc: "Any bounty + dispute resolution", active: sessions >= 10 },
                ].map((t) => (
                  <div key={t.tier} className={`flex items-center justify-between p-3 rounded-lg border ${
                    t.active ? "border-koral-600 bg-koral-50" : "border-koral-100 bg-white"
                  }`}>
                    <div className="flex items-center gap-3">
                      {t.active && <div className="w-2 h-2 rounded-full bg-koral-600 shrink-0" />}
                      {!t.active && <div className="w-2 h-2 rounded-full bg-koral-100 shrink-0" />}
                      <div>
                        <p className={`font-syne font-bold text-[13px] ${t.active ? "text-koral-900" : "text-koral-400"}`}>{t.tier}</p>
                        <p className={`text-[11px] ${t.active ? "text-koral-500" : "text-koral-300"}`}>{t.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${t.active ? "text-koral-600" : "text-koral-300"}`}>
                      {t.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved bounties */}
            {stats && stats.approvedOn.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-koral-100">
                <h2 className="font-syne font-bold text-[14px] text-koral-900 mb-4 pb-3 border-b border-koral-50">
                  Bounties you've judged · {stats.approvedOn.length}
                </h2>
                <div className="flex flex-col gap-2">
                  {stats.approvedOn.map(id => (
                    <Link key={id} href={`/bounty/${id}`} className="no-underline">
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-koral-50 border border-koral-100 hover:border-koral-600 transition-colors">
                        <span className="text-[11px] font-mono text-koral-600">{id.slice(0, 20)}…</span>
                        <span className="text-[11px] text-koral-400">View →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA — find bounties to judge */}
            {sessions === 0 && (
              <div className="bg-koral-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-syne font-bold text-white text-[14px]">Start building your reputation</p>
                  <p className="text-[12px] text-white/50 mt-0.5">Apply to judge open bounties and earn points with every session.</p>
                </div>
                <Link
                  href="/bounties"
                  className="text-[13px] font-bold bg-white text-koral-700 px-5 py-2.5 rounded-lg no-underline hover:bg-koral-50 transition-colors shrink-0 font-syne"
                >
                  Browse bounties →
                </Link>
              </div>
            )}

          </div>
        )}
      </div>

     
    </div>
  );
}