"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SubmitModal from "@/components/submitmodal";
import { useBounty } from "@/hooks/useBounties";
import { useHasSubmitted, useHasAppliedToJudge } from "@/hooks/useHasSubmitted";
import SubmissionsList from "@/components/SubmissionsList";
import {
  useApplyToJudge, useApproveJudge, useStartReview,
  useCommitVote, useRevealVote, useFinalizeFixedBounty,
} from "@/hooks/useTransactions";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { STATE_LABELS, TYPE_LABELS, BOUNTY_STATE } from "@/lib/constants";
import { loadNonce } from "@/lib/voting";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeRemaining(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return "Deadline passed";
  const days = Math.floor(diff / 86_400_000);
  return days > 0 ? `${days} days left` : `${Math.floor(diff / 3_600_000)}h left`;
}

const STATE_BADGE: Record<number, string> = {
  0: "bg-green-50 text-green-700",
  1: "bg-purple-50 text-purple-700",
  2: "bg-gray-100 text-gray-500",
};

export default function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: bounty, isLoading, refetch } = useBounty(id);
  const account = useCurrentAccount();

  const { data: hasSubmitted, isLoading: checkingSubmission } = useHasSubmitted(id, account?.address);
  const { data: hasAppliedToJudge } = useHasAppliedToJudge(id, account?.address);

  const applyToJudge = useApplyToJudge();
  const approveJudge = useApproveJudge();
  const startReview = useStartReview();
  const commitVote = useCommitVote();
  const revealVote = useRevealVote();
  const finalize = useFinalizeFixedBounty();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState("");
  const [score, setScore] = useState(75);
  const [judgeToApprove, setJudgeToApprove] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  let content = {
    description: "",
    deliverables: [] as string[],
    guidelines: "",
    links: [] as { label: string; url: string }[],
    skills: [] as string[],
  };
  if (bounty) {
    try {
      const parsed = JSON.parse(bounty.walrusBlobId);
      content = { ...content, ...parsed };
    } catch {
      content.description = bounty.walrusBlobId;
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-koral-50 font-syne">
      <Navbar />
      <div className="text-center py-20 font-mono text-[12px] text-koral-400">Loading bounty…</div>
    </div>
  );

  if (!bounty) return (
    <div className="min-h-screen bg-koral-50 font-syne">
      <Navbar />
      <div className="text-center py-20">
        <p className="font-syne font-bold text-xl text-koral-900">Bounty not found</p>
        <a href="/" className="text-[13px] text-koral-600 mt-3 inline-block no-underline hover:underline">← Back to bounties</a>
      </div>
    </div>
  );

  const isPoster = account?.address === bounty.poster;
  const isOpen = bounty.state === BOUNTY_STATE.OPEN;
  const isReview = bounty.state === BOUNTY_STATE.REVIEW;
  const deadlinePassed = Date.now() >= bounty.submissionDeadlineMs;

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

  const renderSubmitArea = () => {
    if (!account) return (
      <div className="flex flex-col gap-2 text-center">
        <p className="text-[12px] text-white/50 mb-1">Connect your wallet to submit work.</p>
        <ConnectButton />
      </div>
    );
    if (isPoster) return <p className="text-[12px] text-white/40 text-center">You posted this bounty</p>;
    if (!isOpen || deadlinePassed) return <p className="text-[12px] text-white/40 text-center">Submissions are closed</p>;
    if (checkingSubmission) return <p className="text-[12px] text-white/40 text-center font-mono">Checking status…</p>;
    if (hasSubmitted) return (
      <div className="bg-green-50 rounded-xl px-4 py-3 text-center">
        <p className="text-[13px] font-bold text-green-700">✓ You've submitted</p>
        <p className="text-[11px] text-green-600 mt-0.5">Your work is recorded on-chain. Good luck!</p>
      </div>
    );
    if (hasAppliedToJudge) return (
      <div className="bg-koral-50 rounded-xl px-4 py-3 text-center">
        <p className="text-[13px] font-bold text-koral-700">You applied to judge</p>
        <p className="text-[11px] text-koral-500 mt-0.5">You can't submit to a bounty you're judging.</p>
      </div>
    );
    return (
      <button
        onClick={() => setShowSubmitModal(true)}
        className="w-full py-3 bg-koral-600 hover:bg-koral-500 text-white font-bold text-[13px] rounded-xl border-none cursor-pointer transition-colors font-syne"
      >
        Submit work →
      </button>
    );
  };

  const renderJudgeApply = () => {
    if (!account || isPoster || !isOpen) return null;
    if (hasSubmitted) return (
      <p className="text-[11px] text-koral-400 text-center py-1">
        You can't judge a bounty you submitted to.
      </p>
    );
    if (hasAppliedToJudge) return (
      <div className="w-full py-2.5 bg-koral-50 text-koral-500 font-bold text-[13px] rounded-xl text-center border border-koral-100">
        ✓ Application sent
      </div>
    );
    return (
      <button
        onClick={() => run(() => applyToJudge(id), "Application sent! The poster will review it.")}
        disabled={loading}
        className="w-full py-2.5 bg-white text-koral-900 font-bold text-[13px] rounded-xl border-2 border-koral-100 hover:border-koral-600 cursor-pointer transition-colors font-syne disabled:opacity-50"
      >
        Apply to judge
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-koral-50 font-syne">
      <Navbar />

      {/* Header */}
      <div className="bg-koral-700 px-6 pt-10 pb-8 border-b border-koral-600">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] text-koral-200/60 font-mono mb-4">
            <a href="/" className="text-koral-200/60 no-underline hover:text-white transition-colors">Bounties</a>
            {" / "}
            <span className="text-koral-200">{bounty.title.slice(0, 50)}{bounty.title.length > 50 ? "…" : ""}</span>
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATE_BADGE[bounty.state]}`}>
              {STATE_LABELS[bounty.state]}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-koral-200 uppercase tracking-wider">
              {TYPE_LABELS[bounty.bountyType]}
            </span>
            {content.skills.map(s => (
              <span key={s} className="text-[10px] px-2.5 py-1 rounded-full bg-white/8 text-white/50">{s}</span>
            ))}
          </div>
          <h1 className="font-syne font-bold text-2xl sm:text-3xl text-white leading-snug mb-4 tracking-tight">
            {bounty.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-[12px] text-koral-200/60 font-mono">
            <span>Posted by <span className="text-koral-200">{shortAddr(bounty.poster)}</span></span>
            <span>{timeRemaining(bounty.submissionDeadlineMs)}</span>
            <span>{bounty.submissionCount} submissions</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Left */}
        <div className="flex flex-col gap-5">
          {content.description && (
            <Section title="About this bounty">
              <p className="text-[13px] text-koral-600 leading-relaxed">{content.description}</p>
            </Section>
          )}
          {content.deliverables.length > 0 && (
            <Section title="Deliverables">
              <ol className="pl-4 flex flex-col gap-2.5 m-0">
                {content.deliverables.map((d, i) => (
                  <li key={i} className="text-[13px] text-koral-600 leading-relaxed">{d}</li>
                ))}
              </ol>
            </Section>
          )}
          {content.guidelines && (
            <Section title="Submission guidelines">
              <p className="text-[13px] text-koral-600 leading-relaxed">{content.guidelines}</p>
            </Section>
          )}
          {content.links.length > 0 && (
            <Section title="Resources & links">
              <div className="flex flex-col gap-2">
                {content.links.map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-koral-50 border border-koral-100 no-underline hover:border-koral-600 transition-colors">
                    <span className="text-[12px] font-bold text-koral-800">{link.label}</span>
                    <span className="text-[12px] text-koral-600">↗</span>
                  </a>
                ))}
              </div>
            </Section>
          )}

          <Section title={`Judges · ${bounty.judgeCount + 1} on panel`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-koral-50 border border-koral-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-koral-700 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white font-bold">P</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-koral-900 font-mono">{shortAddr(bounty.poster)}</p>
                    <p className="text-[10px] text-koral-500">Poster · {Math.round(bounty.posterWeightBps / 100)}% weight</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-koral-700 text-white uppercase tracking-wider">Poster</span>
              </div>
              {bounty.judgeCount === 0 && (
                <p className="text-[12px] text-koral-400 px-1 py-2">No community judges yet.</p>
              )}
            </div>
          </Section>

          {(isPoster || isReview) && (
            <SubmissionsList
              bountyId={id}
              isPoster={isPoster}
              isReview={isReview}
              onSelectForVoting={(submissionId) => setSelectedSubmission(submissionId)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Prize card */}
          <div className="bg-koral-700 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-koral-200/50 font-mono uppercase tracking-widest mb-1.5">Total reward</p>
            <p className="font-mono text-[40px] font-bold text-white leading-none mb-0.5">{bounty.prizePool.toLocaleString()}</p>
            <p className="font-mono text-[14px] font-bold text-koral-300 mb-5">SUI</p>
            {renderSubmitArea()}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-4 border border-koral-100">
            {[
              { lbl: "Submissions", val: bounty.submissionCount.toString() },
              { lbl: "Judges", val: (bounty.judgeCount + 1).toString() },
              { lbl: "Poster weight", val: `${Math.round(bounty.posterWeightBps / 100)}%` },
              { lbl: "Type", val: TYPE_LABELS[bounty.bountyType] },
            ].map((s, i) => (
              <div key={i} className={`flex justify-between items-center py-2 ${i < 3 ? "border-b border-koral-50" : ""}`}>
                <span className="text-[12px] text-koral-500">{s.lbl}</span>
                <span className="text-[13px] font-bold text-koral-900 font-mono">{s.val}</span>
              </div>
            ))}
          </div>

          {renderJudgeApply()}

          {/* Poster: approve judges */}
          {isPoster && isOpen && (
            <div className="bg-white rounded-xl p-4 border border-koral-100 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-koral-500 uppercase tracking-wider">Approve a judge</p>
              <input
                className="text-[11px] px-3 py-2 border border-koral-100 rounded-lg bg-koral-50 text-koral-900 font-mono outline-none focus:border-koral-500 transition-colors"
                placeholder="0x… wallet address"
                value={judgeToApprove}
                onChange={e => setJudgeToApprove(e.target.value)}
              />
              <button
                onClick={() => run(() => approveJudge(id, judgeToApprove), "Judge approved!")}
                disabled={loading || !judgeToApprove}
                className="py-2 bg-koral-700 text-white font-bold text-[12px] rounded-lg border-none cursor-pointer font-syne disabled:opacity-40 hover:bg-koral-600 transition-colors"
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
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[13px] rounded-xl border-none cursor-pointer font-syne disabled:opacity-50 transition-colors"
            >
              Start review phase →
            </button>
          )}

          {/* Voting */}
          {isReview && account && (
            <div className="bg-white rounded-xl p-4 border border-koral-100 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-koral-500 uppercase tracking-wider">Cast your vote</p>
              <input
                className="text-[11px] px-3 py-2 border border-koral-100 rounded-lg bg-koral-50 text-koral-900 font-mono outline-none focus:border-koral-500 transition-colors"
                placeholder="Submission ID (0x…)"
                value={selectedSubmission}
                onChange={e => setSelectedSubmission(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-koral-500">Score</span>
                <input type="range" min={1} max={100} value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="flex-1 accent-koral-600" />
                <span className="text-[13px] font-bold text-koral-900 font-mono w-7">{score}</span>
              </div>
              <button
                onClick={() => run(() => commitVote(id, selectedSubmission, score), "Vote committed!")}
                disabled={loading || !selectedSubmission}
                className="py-2 bg-koral-700 hover:bg-koral-600 text-white font-bold text-[12px] rounded-lg border-none cursor-pointer font-syne disabled:opacity-40 transition-colors"
              >
                Commit vote →
              </button>
              <button
                onClick={() => {
                  const nonce = loadNonce(id);
                  if (!nonce) { setMsg("No saved nonce."); setMsgType("error"); return; }
                  run(() => revealVote(id, selectedSubmission, score, nonce), "Vote revealed!");
                }}
                disabled={loading || !selectedSubmission}
                className="py-2 bg-koral-50 text-koral-700 font-bold text-[12px] rounded-lg border-none cursor-pointer font-syne disabled:opacity-40 hover:bg-koral-100 transition-colors"
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
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-[13px] rounded-xl border-none cursor-pointer font-syne disabled:opacity-50 transition-colors"
            >
              Finalize & pay winner →
            </button>
          )}

          {msg && (
            <div className={`px-4 py-3 rounded-xl text-[12px] font-medium ${
              msgType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              {msg}
            </div>
          )}
        </div>
      </div>

      {showSubmitModal && (
        <SubmitModal
          bountyId={id}
          bountyTitle={bounty.title}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            setMsg("Submission recorded on-chain! 🎉");
            setMsgType("success");
            refetch();
          }}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-koral-100">
      <h2 className="font-syne font-bold text-[14px] text-koral-900 mb-4 pb-3 border-b border-koral-50">{title}</h2>
      {children}
    </div>
  );
}