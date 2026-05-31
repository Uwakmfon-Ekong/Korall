"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, MODULE, mistToSui, STATE_LABELS, TYPE_LABELS } from "@/lib/constants";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MyBounty {
  id: string;
  title: string;
  prizePool: number;
  state: number;
  bountyType: number;
  submissionCount: number;
  submissionDeadlineMs: number;
}

interface MySubmission {
  id: string;
  bountyId: string;
  bountyTitle: string;
  submittedAt: string;
  projectLink: string;
  name: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useMyBounties(address: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["myBounties", address],
    queryFn: async (): Promise<MyBounty[]> => {
      if (!address) return [];
      const events = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE}::BountyCreated` },
        limit: 50,
      });
      const mine = events.data.filter(
        e => (e.parsedJson as { poster: string }).poster === address
      );
      if (!mine.length) return [];
      const ids = mine.map(e => (e.parsedJson as { bounty_id: string }).bounty_id);
      const results: MyBounty[] = [];
      for (const id of ids) {
        try {
          const obj = await client.getObject({ id, options: { showContent: true } });
          if (obj.data?.content?.dataType !== "moveObject") continue;
          const f = (obj.data.content as { dataType: "moveObject"; fields: Record<string, unknown> }).fields;
          let prizePool = 0;
          if (typeof f.prize_pool === "string") prizePool = mistToSui(BigInt(f.prize_pool));
          else if (typeof f.prize_pool === "object" && f.prize_pool !== null) {
            const pp = f.prize_pool as { fields?: { value?: string } };
            prizePool = mistToSui(BigInt(pp?.fields?.value ?? "0"));
          }
          results.push({
            id: obj.data.objectId,
            title: f.title as string,
            prizePool,
            state: Number(f.state),
            bountyType: Number(f.bounty_type),
            submissionCount: Number(f.submission_count),
            submissionDeadlineMs: Number(f.submission_deadline_ms),
          });
        } catch { /* skip */ }
      }
      return results;
    },
    enabled: !!address,
  });
}

function useMySubmissions(address: string | undefined) {
  const client = useSuiClient();
  return useQuery({
    queryKey: ["mySubmissions", address],
    queryFn: async (): Promise<MySubmission[]> => {
      if (!address) return [];
      const events = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE}::SubmissionMade` },
        limit: 50,
      });
      const mine = events.data.filter(
        e => (e.parsedJson as { hunter: string }).hunter === address
      );
      if (!mine.length) return [];

      const results: MySubmission[] = [];
      for (const e of mine) {
        const json = e.parsedJson as { bounty_id: string; submission_id: string };
        // Fetch submission object for details
        try {
          const subObj = await client.getObject({
            id: json.submission_id,
            options: { showContent: true },
          });
          const f = subObj.data?.content?.dataType === "moveObject"
            ? (subObj.data.content as { dataType: "moveObject"; fields: Record<string, unknown> }).fields
            : null;

          // Parse submission content from walrus blob
          let name = "Anonymous";
          let projectLink = "";
          if (f?.walrus_blob_id) {
            try {
              const parsed = JSON.parse(f.walrus_blob_id as string);
              name = parsed.name ?? name;
              projectLink = parsed.projectLink ?? "";
            } catch { /* plain blob id */ }
          }

          // Fetch bounty title
          let bountyTitle = json.bounty_id.slice(0, 16) + "…";
          try {
            const bountyObj = await client.getObject({
              id: json.bounty_id,
              options: { showContent: true },
            });
            const bf = bountyObj.data?.content?.dataType === "moveObject"
              ? (bountyObj.data.content as { dataType: "moveObject"; fields: Record<string, unknown> }).fields
              : null;
            if (bf?.title) bountyTitle = bf.title as string;
          } catch { /* skip */ }

          results.push({
            id: json.submission_id,
            bountyId: json.bounty_id,
            bountyTitle,
            submittedAt: e.timestampMs
              ? new Date(Number(e.timestampMs)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "—",
            projectLink,
            name,
          });
        } catch { /* skip */ }
      }
      return results;
    },
    enabled: !!address,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeLeft(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86_400_000);
  return days > 0 ? `${days}d left` : `${Math.floor(diff / 3_600_000)}h left`;
}

const STATE_STYLE: Record<number, string> = {
  0: "bg-teal-light text-teal",
  1: "bg-purple-100 text-purple-700",
  2: "bg-gray-100 text-gray-500",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyBountiesPage() {
  const account = useCurrentAccount();
  const [tab, setTab] = useState<"posted" | "submitted">("posted");

  const { data: myBounties, isLoading: loadingBounties } = useMyBounties(account?.address);
  const { data: mySubmissions, isLoading: loadingSubmissions } = useMySubmissions(account?.address);

  if (!account) {
    return (
      <div className="min-h-screen bg-ocean-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-4xl mb-4">🪸</p>
          <h1 className="font-sans font-bold text-xl text-ocean-900 mb-2">Connect your wallet</h1>
          <p className="text-[13px] text-ocean-500 max-w-xs">Connect your Sui wallet to see your posted bounties and submissions.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-50 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-ocean-900 px-6 pt-10 pb-8 border-b border-coral/15">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-mono text-coral font-bold tracking-widest uppercase mb-2">My activity</p>
          <h1 className="font-sans font-bold text-2xl text-white tracking-tight mb-1">My Bounties</h1>
          <p className="text-[12px] text-white/40 font-mono">
            {account.address.slice(0, 10)}…{account.address.slice(-6)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-ocean-100 px-6">
        <div className="max-w-2xl mx-auto flex gap-0">
          {[
            { key: "posted", label: "Posted", count: myBounties?.length ?? 0 },
            { key: "submitted", label: "Submitted", count: mySubmissions?.length ?? 0 },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "posted" | "submitted")}
              className={`px-5 py-3.5 text-[13px] font-bold font-sans border-b-2 transition-colors bg-transparent cursor-pointer flex items-center gap-2 ${
                tab === t.key
                  ? "border-coral text-ocean-900"
                  : "border-transparent text-ocean-400 hover:text-ocean-700"
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                tab === t.key ? "bg-coral-light text-coral-dark" : "bg-ocean-50 text-ocean-400"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 flex-1 w-full">

        {/* Posted bounties */}
        {tab === "posted" && (
          <>
            {loadingBounties ? (
              <Loading />
            ) : !myBounties?.length ? (
              <Empty
                emoji="🎯"
                title="No bounties posted yet"
                desc="Post your first bounty and lock funds on-chain."
                cta="Post a bounty →"
                href="/create"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {myBounties.map(b => (
                  <Link key={b.id} href={`/bounty/${b.id}`} className="no-underline">
                    <div className="bg-white rounded-xl border border-ocean-100 p-5 hover:border-coral transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${STATE_STYLE[b.state]}`}>
                              {STATE_LABELS[b.state]}
                            </span>
                            <span className="text-[10px] text-ocean-400 font-mono">{TYPE_LABELS[b.bountyType]}</span>
                          </div>
                          <h3 className="font-sans font-bold text-[14px] text-ocean-900 leading-snug truncate mb-2">{b.title}</h3>
                          <div className="flex gap-4 text-[11px] text-ocean-400 font-mono">
                            <span>{b.submissionCount} submissions</span>
                            <span>{timeLeft(b.submissionDeadlineMs)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-ocean-400 font-mono mb-0.5">prize</p>
                          <p className="font-mono font-bold text-[16px] text-ocean-900">{b.prizePool.toLocaleString()}</p>
                          <p className="font-mono text-[11px] font-bold text-coral">SUI</p>
                        </div>
                      </div>

                      {/* Actions for poster */}
                      {b.state === 0 && (
                        <div className="mt-3 pt-3 border-t border-ocean-50 flex gap-2">
                          <span className="text-[11px] text-ocean-500">
                            {b.submissionCount === 0
                              ? "Waiting for submissions"
                              : `${b.submissionCount} submission${b.submissionCount > 1 ? "s" : ""} to review`}
                          </span>
                          <span className="ml-auto text-[11px] text-coral font-medium">Manage →</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Post another */}
                <Link href="/create" className="no-underline">
                  <div className="bg-ocean-50 rounded-xl border-2 border-dashed border-ocean-200 p-5 flex items-center justify-center gap-2 hover:border-coral transition-colors cursor-pointer">
                    <span className="text-[13px] font-bold text-ocean-400 hover:text-coral transition-colors">+ Post another bounty</span>
                  </div>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Submissions */}
        {tab === "submitted" && (
          <>
            {loadingSubmissions ? (
              <Loading />
            ) : !mySubmissions?.length ? (
              <Empty
                emoji="⚡"
                title="No submissions yet"
                desc="Browse open bounties and submit your work to start earning SUI."
                cta="Browse bounties →"
                href="/"
              />
            ) : (
              <div className="flex flex-col gap-3">
                {mySubmissions.map(s => (
                  <Link key={s.id} href={`/bounty/${s.bountyId}`} className="no-underline">
                    <div className="bg-white rounded-xl border border-ocean-100 p-5 hover:border-coral transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono text-ocean-400 mb-1">Submitted {s.submittedAt}</p>
                          <h3 className="font-sans font-bold text-[14px] text-ocean-900 leading-snug mb-2 truncate">{s.bountyTitle}</h3>
                          {s.projectLink && (
                            <a
                              href={s.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] text-coral no-underline hover:underline font-medium"
                            >
                              View submission ↗
                            </a>
                          )}
                        </div>
                        <div className="shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-light text-teal uppercase tracking-wider">
                            Submitted
                          </span>
                        </div>
                      </div>

                      {/* Submission NFT note */}
                      <div className="mt-3 pt-3 border-t border-ocean-50 flex items-center gap-2">
                        <span className="text-[10px]">🪸</span>
                        <span className="text-[11px] text-ocean-400">Submission NFT recorded on-chain</span>
                        <span className="ml-auto text-[11px] text-ocean-500 font-mono">{s.id.slice(0, 10)}…</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      
    </div>
  );
}

function Loading() {
  return (
    <div className="text-center py-16 font-mono text-[12px] text-ocean-400">Loading…</div>
  );
}

function Empty({ emoji, title, desc, cta, href }: { emoji: string; title: string; desc: string; cta: string; href: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="font-sans font-bold text-lg text-ocean-900 mb-2">{title}</p>
      <p className="text-[13px] text-ocean-500 mb-6 max-w-xs mx-auto">{desc}</p>
      <Link href={href} className="text-[13px] font-bold bg-coral text-white px-6 py-3 rounded-lg no-underline hover:bg-coral-dark transition-colors">
        {cta}
      </Link>
    </div>
  );
}