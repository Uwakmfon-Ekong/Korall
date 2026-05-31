"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useBounty } from "@/hooks/useBounties";
import {
  useSubmitWork, useApplyToJudge, useApproveJudge,
  useStartReview, useCommitVote, useRevealVote, useFinalizeFixedBounty,
} from "@/hooks/useTransactions";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { STATE_LABELS, TYPE_LABELS, BOUNTY_STATE } from "@/lib/constants";
import { loadNonce } from "@/lib/voting";

const SUI_CLOCK = "0x6";

// Mock structured content — in production this comes from Walrus blob
const MOCK_CONTENT = {
  description: "We're looking for a talented developer or team to build a clean, responsive landing page for BountyBoard — the first hybrid-judging bounty platform on Sui Network. The page should clearly communicate the platform's value proposition to both bounty posters and hunters.",
  deliverables: [
    "Fully responsive landing page (mobile + desktop)",
    "Hero section with headline, subheadline, and CTA buttons",
    "How it works section (3-step flow)",
    "Features section highlighting on-chain escrow, hybrid judging, and Submission NFTs",
    "Footer with social links",
    "Source code pushed to a public GitHub repo",
  ],
  guidelines: "Submit your work as a Walrus blob ID containing a ZIP of your source code. Include a short Loom or YouTube video (max 3 mins) walking through the design and code. Work must be original — no templates.",
  links: [
    { label: "Project GitHub", url: "https://github.com" },
    { label: "Design Brief (Figma)", url: "https://figma.com" },
    { label: "Sui Docs", url: "https://docs.sui.io" },
  ],
  skills: ["Next.js", "Tailwind CSS", "UI/UX", "Frontend"],
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeRemaining(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return "Deadline passed";
  const days = Math.floor(diff / 86_400_000);
  return days > 0 ? `${days} days left` : `${Math.floor(diff / 3_600_000)}h left`;
}

export default function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: bounty, isLoading, refetch } = useBounty(id);
  const account = useCurrentAccount();

  const submitWork = useSubmitWork();
  const applyToJudge = useApplyToJudge();
  const approveJudge = useApproveJudge();
  const startReview = useStartReview();
  const commitVote = useCommitVote();
  const revealVote = useRevealVote();
  const finalize = useFinalizeFixedBounty();

  const [submissionBlob, setSubmissionBlob] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState("");
  const [score, setScore] = useState(75);
  const [judgeToApprove, setJudgeToApprove] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#f0f6fd" }}>
      <Navbar />
      <div style={{ padding: "80px 24px", textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#185FA5" }}>
        Loading bounty…
      </div>
    </div>
  );

  if (!bounty) return (
    <div style={{ minHeight: "100vh", background: "#f0f6fd" }}>
      <Navbar />
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "20px", color: "#042C53" }}>Bounty not found</p>
      </div>
    </div>
  );

  const isPoster = account?.address === bounty.poster;
  const isOpen = bounty.state === BOUNTY_STATE.OPEN;
  const isReview = bounty.state === BOUNTY_STATE.REVIEW;
  const deadlinePassed = Date.now() >= bounty.submissionDeadlineMs;

  const STATE_COLOR: Record<number, { bg: string; color: string }> = {
    0: { bg: "#e1f5ee", color: "#0F6E56" },
    1: { bg: "#eeedfe", color: "#3C3489" },
    2: { bg: "#f1efe8", color: "#5F5E5A" },
  };
  const stateStyle = STATE_COLOR[bounty.state];

  async function run(fn: () => Promise<unknown>, successMsg: string) {
    setLoading(true); setMsg("");
    try {
      await fn();
      setMsg(successMsg); setMsgType("success");
      refetch();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Transaction failed.");
      setMsgType("error");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f6fd" }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: "#042C53", padding: "40px 24px 36px", borderBottom: "1px solid rgba(55,138,221,0.15)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "16px", fontFamily: "JetBrains Mono, monospace" }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Bounties</a>
            {" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>{bounty.title.slice(0, 40)}…</span>
          </p>

          {/* Badges */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: stateStyle.bg, color: stateStyle.color, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {STATE_LABELS[bounty.state]}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: "rgba(55,138,221,0.2)", color: "#85B7EB", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {TYPE_LABELS[bounty.bountyType]}
            </span>
            {MOCK_CONTENT.skills.map(s => (
              <span key={s} style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                {s}
              </span>
            ))}
          </div>

          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 700, color: "white", margin: "0 0 16px", lineHeight: 1.2 }}>
            {bounty.title}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: "JetBrains Mono, monospace" }}>
              Posted by <span style={{ color: "#378ADD" }}>{shortAddr(bounty.poster)}</span>
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: "JetBrains Mono, monospace" }}>
              {timeRemaining(bounty.submissionDeadlineMs)}
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: "JetBrains Mono, monospace" }}>
              {bounty.submissionCount} submissions
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }} className="detail-grid">

        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* About */}
          <Section title="About this bounty">
            <p style={{ fontSize: "13px", color: "#185FA5", lineHeight: 1.8, margin: 0 }}>
              {MOCK_CONTENT.description}
            </p>
          </Section>

          {/* Deliverables */}
          <Section title="Deliverables">
            <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {MOCK_CONTENT.deliverables.map((d, i) => (
                <li key={i} style={{ fontSize: "13px", color: "#185FA5", lineHeight: 1.6 }}>
                  {d}
                </li>
              ))}
            </ol>
          </Section>

          {/* Submission guidelines */}
          <Section title="Submission guidelines">
            <p style={{ fontSize: "13px", color: "#185FA5", lineHeight: 1.8, margin: 0 }}>
              {MOCK_CONTENT.guidelines}
            </p>
          </Section>

          {/* Links */}
          <Section title="Resources & links">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {MOCK_CONTENT.links.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: "8px", background: "#E6F1FB",
                  textDecoration: "none", border: "1px solid rgba(24,95,165,0.1)",
                }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#0C447C" }}>{link.label}</span>
                  <span style={{ fontSize: "12px", color: "#378ADD" }}>↗</span>
                </a>
              ))}
            </div>
          </Section>

          {/* Judges panel */}
          <Section title={`Judges panel · ${bounty.judgeCount} approved`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Poster always first */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", background: "#f0f6fd", border: "1px solid rgba(24,95,165,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#042C53", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", color: "white", fontWeight: 700 }}>P</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#042C53", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>{shortAddr(bounty.poster)}</p>
                    <p style={{ fontSize: "10px", color: "#185FA5", margin: 0 }}>Poster · {Math.round(bounty.posterWeightBps / 100)}% weight</p>
                  </div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "#042C53", color: "white" }}>POSTER</span>
              </div>
              {bounty.judgeCount === 0 && (
                <p style={{ fontSize: "12px", color: "#185FA5", margin: 0, padding: "8px 0" }}>No community judges yet.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Prize card */}
          <div style={{ background: "#042C53", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono, monospace", margin: "0 0 6px", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Total reward</p>
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "36px", fontWeight: 700, color: "white", margin: "0 0 2px", lineHeight: 1 }}>
              {bounty.prizePool.toLocaleString()}
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#378ADD", margin: "0 0 20px", fontFamily: "JetBrains Mono, monospace" }}>SUI</p>

            {/* Submit action */}
            {!account ? (
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Connect wallet to submit</p>
            ) : isOpen && !isPoster && !deadlinePassed ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  style={{ width: "100%", fontSize: "11px", padding: "9px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontFamily: "JetBrains Mono, monospace", outline: "none", boxSizing: "border-box" as const }}
                  placeholder="Walrus blob ID"
                  value={submissionBlob}
                  onChange={(e) => setSubmissionBlob(e.target.value)}
                />
                <button
                  onClick={() => run(() => submitWork(id, submissionBlob, SUI_CLOCK), "Submission minted!")}
                  disabled={loading || !submissionBlob}
                  style={{ width: "100%", padding: "11px", background: "#378ADD", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif", opacity: loading || !submissionBlob ? 0.5 : 1 }}
                >
                  {loading ? "Submitting…" : "Submit work →"}
                </button>
              </div>
            ) : isOpen && !isPoster ? (
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Submissions closed</p>
            ) : isPoster ? (
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>You posted this bounty</p>
            ) : null}
          </div>

          {/* Stats */}
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", border: "1px solid rgba(24,95,165,0.1)" }}>
            {[
              { lbl: "Submissions", val: bounty.submissionCount.toString() },
              { lbl: "Judges", val: bounty.judgeCount.toString() },
              { lbl: "Poster weight", val: `${Math.round(bounty.posterWeightBps / 100)}%` },
              { lbl: "Max judges", val: "7" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(24,95,165,0.08)" : "none" }}>
                <span style={{ fontSize: "12px", color: "#185FA5" }}>{s.lbl}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#042C53", fontFamily: "JetBrains Mono, monospace" }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Apply to judge */}
          {isOpen && !isPoster && account && (
            <button
              onClick={() => run(() => applyToJudge(id), "Application sent!")}
              disabled={loading}
              style={{ width: "100%", padding: "11px", background: "white", color: "#042C53", border: "1.5px solid rgba(24,95,165,0.25)", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif" }}
            >
              Apply to judge
            </button>
          )}

          {/* Poster actions */}
          {isPoster && isOpen && (
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", border: "1px solid rgba(24,95,165,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#185FA5", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0 }}>Approve a judge</p>
              <input
                style={{ fontSize: "11px", padding: "8px 10px", border: "1px solid rgba(24,95,165,0.2)", borderRadius: "6px", background: "#f0f6fd", color: "#042C53", fontFamily: "JetBrains Mono, monospace", outline: "none" }}
                placeholder="0x… wallet address"
                value={judgeToApprove}
                onChange={(e) => setJudgeToApprove(e.target.value)}
              />
              <button
                onClick={() => run(() => approveJudge(id, judgeToApprove), "Judge approved!")}
                disabled={loading || !judgeToApprove}
                style={{ padding: "9px", background: "#042C53", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif", opacity: loading || !judgeToApprove ? 0.5 : 1 }}
              >
                Approve →
              </button>
            </div>
          )}

          {/* Start review */}
          {isOpen && deadlinePassed && bounty.submissionCount > 0 && (
            <button
              onClick={() => run(() => startReview(id), "Review phase started!")}
              disabled={loading}
              style={{ width: "100%", padding: "11px", background: "#534AB7", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif" }}
            >
              Start review phase →
            </button>
          )}

          {/* Voting */}
          {isReview && account && (
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", border: "1px solid rgba(24,95,165,0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#185FA5", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0 }}>Cast your vote</p>
              <input
                style={{ fontSize: "11px", padding: "8px 10px", border: "1px solid rgba(24,95,165,0.2)", borderRadius: "6px", background: "#f0f6fd", color: "#042C53", fontFamily: "JetBrains Mono, monospace", outline: "none" }}
                placeholder="Submission ID (0x…)"
                value={selectedSubmission}
                onChange={(e) => setSelectedSubmission(e.target.value)}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", color: "#185FA5" }}>Score</span>
                <input type="range" min={1} max={100} step={1} value={score} onChange={(e) => setScore(Number(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#042C53", fontFamily: "JetBrains Mono, monospace", minWidth: "28px" }}>{score}</span>
              </div>
              <button
                onClick={() => run(() => commitVote(id, selectedSubmission, score), "Vote committed!")}
                disabled={loading || !selectedSubmission}
                style={{ padding: "9px", background: "#042C53", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif", opacity: !selectedSubmission ? 0.5 : 1 }}
              >
                Commit vote →
              </button>
              <button
                onClick={() => {
                  const nonce = loadNonce(id);
                  if (!nonce) { setMsg("No saved nonce found."); setMsgType("error"); return; }
                  run(() => revealVote(id, selectedSubmission, score, nonce), "Vote revealed!");
                }}
                disabled={loading || !selectedSubmission}
                style={{ padding: "9px", background: "#E6F1FB", color: "#0C447C", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif", opacity: !selectedSubmission ? 0.5 : 1 }}
              >
                Reveal vote →
              </button>
            </div>
          )}

          {/* Finalize */}
          {isReview && (
            <button
              onClick={() => run(() => finalize(id), "Bounty finalized! Winner paid.")}
              disabled={loading}
              style={{ width: "100%", padding: "11px", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif" }}
            >
              Finalize &amp; pay winner →
            </button>
          )}

          {/* Message */}
          {msg && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, background: msgType === "success" ? "#e1f5ee" : "#FCEBEB", color: msgType === "success" ? "#0F6E56" : "#A32D2D" }}>
              {msg}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1px solid rgba(24,95,165,0.1)" }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "14px", fontWeight: 700, color: "#042C53", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid rgba(24,95,165,0.08)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}