"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSubmitWork } from "@/hooks/useTransactions";
import { uploadToWalrus } from "@/lib/useWalrusUpload";

const SUI_CLOCK = "0x6";

const COMMUNITY_LINKS = {
  x: "https://x.com/whakee_",
  telegram: "https://t.me/koralhq",
  discord: "https://discord.gg/koralhq",
};

interface Props {
  bountyId: string;
  bountyTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitModal({ bountyId, bountyTitle, onClose, onSuccess }: Props) {
  const account = useCurrentAccount();
  const submitWork = useSubmitWork();

  const [form, setForm] = useState({
    name: "",
    projectLink: "",
    comments: "",
    followedX: false,
    joinedTelegram: false,
    joinedDiscord: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "community">("form");

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  function goToCommunity() {
    if (!form.name) { setError("Please enter your name."); return; }
    if (!form.projectLink) { setError("Please add a link to your work."); return; }
    if (!form.projectLink.startsWith("http")) { setError("Project link must start with http:// or https://"); return; }
    setError("");
    setStep("community");
  }

  async function handleSubmit() {
    if (!form.followedX || !form.joinedTelegram || !form.joinedDiscord) {
      setError("Please join all our community channels before submitting.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const submissionData = JSON.stringify({
        name: form.name,
        wallet: account?.address ?? "",
        projectLink: form.projectLink,
        comments: form.comments,
        community: {
          followedX: form.followedX,
          joinedTelegram: form.joinedTelegram,
          joinedDiscord: form.joinedDiscord,
        },
        submittedAt: new Date().toISOString(),
      });

      // Upload to Walrus — single call
      const walrusResult = await uploadToWalrus(submissionData);

      // Submit on-chain — single call
      await submitWork(bountyId, walrusResult.blobId, SUI_CLOCK);

      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-koral-900/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-koral-700 rounded-t-2xl px-6 py-5 sticky top-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${step === "form" ? "bg-koral-300" : "bg-green-400"}`} />
                <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">
                  {step === "form" ? "Step 1 of 2 — Your work" : "Step 2 of 2 — Join community"}
                </p>
              </div>
              <h2 className="font-syne font-bold text-white text-[15px] leading-snug max-w-xs">
                {bountyTitle}
              </h2>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl bg-transparent border-none cursor-pointer leading-none">×</button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/10 rounded-full">
            <div className={`h-1 bg-koral-300 rounded-full transition-all duration-300 ${step === "form" ? "w-1/2" : "w-full"}`} />
          </div>
        </div>

        {step === "form" ? (
          <div className="px-6 py-5 flex flex-col gap-4">

            <Field label="Your name *">
              <input
                className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-koral-50 text-koral-900 outline-none focus:border-koral-500 transition-colors font-syne"
                placeholder="e.g. Ada Obi"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>

            <Field label="Wallet address">
              <input
                className="w-full text-[11px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-koral-100 text-koral-500 font-mono outline-none cursor-not-allowed"
                value={account?.address ?? "Connect wallet"}
                readOnly
              />
              <p className="text-[10px] text-koral-400 mt-1">Prize goes here automatically if you win.</p>
            </Field>

            <Field label="Link to your work *">
              <input
                className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-koral-50 text-koral-900 outline-none focus:border-koral-500 transition-colors font-syne"
                placeholder="GitHub, Figma, Loom, YouTube, Google Drive…"
                value={form.projectLink}
                onChange={(e) => set("projectLink", e.target.value)}
              />
              <p className="text-[10px] text-koral-400 mt-1">Any public link works. Make sure it's accessible.</p>
            </Field>

            <Field label="Notes to judges (optional)">
              <textarea
                className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-koral-50 text-koral-900 outline-none focus:border-koral-500 transition-colors font-syne resize-none"
                placeholder="Anything the judges should know about your submission..."
                rows={3}
                value={form.comments}
                onChange={(e) => set("comments", e.target.value)}
              />
            </Field>

            {error && <div className="text-[12px] font-medium bg-red-50 text-red-600 px-3.5 py-2.5 rounded-lg">{error}</div>}

            <button
              onClick={goToCommunity}
              className="w-full py-3 bg-koral-700 hover:bg-koral-600 text-white font-bold text-[13px] rounded-xl border-none cursor-pointer transition-colors font-syne"
            >
              Next — Join community →
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-[13px] text-koral-600 leading-relaxed">
              Koral is powered by its community. Before submitting, join us on our channels — this is how you stay updated on results, new bounties, and payouts.
            </p>

            {[
              { key: "followedX", platform: "X (Twitter)", handle: "@whakee_", url: COMMUNITY_LINKS.x, checked: form.followedX, icon: "𝕏", action: "Follow us" },
              { key: "joinedTelegram", platform: "Telegram", handle: "@koralhq", url: COMMUNITY_LINKS.telegram, checked: form.joinedTelegram, icon: "✈️", action: "Join group" },
              { key: "joinedDiscord", platform: "Discord", handle: "discord.gg/koralhq", url: COMMUNITY_LINKS.discord, checked: form.joinedDiscord, icon: "💬", action: "Join server" },
            ].map((item) => (
              <div
                key={item.key}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  item.checked ? "border-koral-600 bg-koral-50" : "border-koral-100 bg-white"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-koral-900 font-syne">{item.platform}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-koral-600 no-underline hover:underline font-mono"
                    onClick={() => set(item.key, true)}
                  >
                    {item.action} — {item.handle} ↗
                  </a>
                </div>
                <button
                  onClick={() => set(item.key, !item.checked)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all bg-transparent ${
                    item.checked ? "border-koral-600 text-koral-600" : "border-koral-200 text-transparent"
                  }`}
                >
                  ✓
                </button>
              </div>
            ))}

            <p className="text-[11px] text-koral-400 text-center">Click each link to join, then check the box to confirm.</p>

            {error && <div className="text-[12px] font-medium bg-red-50 text-red-600 px-3.5 py-2.5 rounded-lg">{error}</div>}

            <div className="flex gap-2">
              <button
                onClick={() => { setStep("form"); setError(""); }}
                className="flex-1 py-3 bg-koral-50 text-koral-700 font-bold text-[13px] rounded-xl border-none cursor-pointer font-syne hover:bg-koral-100 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] py-3 bg-koral-600 hover:bg-koral-700 text-white font-bold text-[13px] rounded-xl border-none cursor-pointer transition-colors font-syne disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Submit work →"}
              </button>
            </div>

            <p className="text-[10px] text-koral-400 text-center">
              Your submission is stored on Walrus and recorded on Sui. Prize is paid automatically if you win.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-koral-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}