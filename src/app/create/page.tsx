"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadToWalrus } from "@/lib/useWalrusUpload";
import Navbar from "@/components/Navbar";
import { useCreateBounty } from "@/hooks/useTransactions";
import { BOUNTY_TYPE } from "@/lib/constants";

const BOUNTY_TYPES = [
  { id: BOUNTY_TYPE.FIXED, label: "Fixed", desc: "One winner takes all.", icon: "🎯" },
  { id: BOUNTY_TYPE.CONTEST, label: "Contest", desc: "Multiple winners, split prize.", icon: "🏆" },
  { id: BOUNTY_TYPE.GRANT, label: "Grant", desc: "Milestone-based payout.", icon: "🌱" },
];

const SKILL_OPTIONS = [
  "Move", "Rust", "React", "Next.js", "TypeScript", "Solidity",
  "UI/UX", "Design", "Branding", "Illustration",
  "Writing", "Content", "Research", "Marketing", "Community",
  "Video", "Photography", "Data", "DevOps", "Security",
];

interface Winner { place: string; percentage: number; }

const DEFAULT_WINNERS: Winner[] = [
  { place: "1st", percentage: 60 },
  { place: "2nd", percentage: 25 },
  { place: "3rd", percentage: 15 },
];

export default function CreatePage() {
  const router = useRouter();
  const createBounty = useCreateBounty();

  const [form, setForm] = useState({
    title: "",
    description: "",
    bountyType: BOUNTY_TYPE.FIXED as number,
    posterWeightBps: 5000,
    maxJudges: 3,
    prizeInSui: 100,
    submissionDays: 7,
    judgingDays: 3,
    skills: [] as string[],
    deliverables: [""] as string[],
    links: [{ label: "", url: "" }] as { label: string; url: string }[],
    guidelines: "",
    winners: DEFAULT_WINNERS as Winner[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addDeliverable = () => set("deliverables", [...form.deliverables, ""]);
  const updateDeliverable = (i: number, val: string) => {
    const d = [...form.deliverables]; d[i] = val; set("deliverables", d);
  };
  const removeDeliverable = (i: number) =>
    set("deliverables", form.deliverables.filter((_, idx) => idx !== i));

  const addLink = () => set("links", [...form.links, { label: "", url: "" }]);
  const updateLink = (i: number, k: "label" | "url", v: string) => {
    const l = [...form.links]; l[i] = { ...l[i], [k]: v }; set("links", l);
  };
  const removeLink = (i: number) =>
    set("links", form.links.filter((_, idx) => idx !== i));

  const toggleSkill = (s: string) => {
    const cur = form.skills;
    set("skills", cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  };

  const addWinner = () => {
    const next = form.winners.length + 1;
    const ordinals = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th"];
    set("winners", [...form.winners, { place: ordinals[next - 1] ?? `${next}th`, percentage: 0 }]);
  };
  const updateWinner = (i: number, val: number) => {
    const w = [...form.winners]; w[i] = { ...w[i], percentage: val }; set("winners", w);
  };
  const removeWinner = (i: number) =>
    set("winners", form.winners.filter((_, idx) => idx !== i));
  const totalPct = form.winners.reduce((a, w) => a + w.percentage, 0);

  async function handleSubmit() {
    if (!form.title) { setError("Title is required."); return; }
    if (!form.prizeInSui || form.prizeInSui < 1) { setError("Prize amount is required."); return; }
    if (form.bountyType === BOUNTY_TYPE.CONTEST && totalPct !== 100) {
      setError(`Winner percentages must add up to 100%. Currently: ${totalPct}%`); return;
    }
    setLoading(true); setError("");
    try {
      const content = {
        description: form.description,
        deliverables: form.deliverables.filter(Boolean),
        guidelines: form.guidelines,
        links: form.links.filter((l) => l.label && l.url),
        skills: form.skills,
        winners: form.bountyType === BOUNTY_TYPE.CONTEST ? form.winners : null,
      };
      setError("Uploading to Walrus…");
      const walrusResult = await uploadToWalrus(content);
      setError("");
      const now = Date.now();
      await createBounty({
        title: form.title,
        walrusBlobId: walrusResult.blobId,
        bountyType: form.bountyType,
        posterWeightBps: form.posterWeightBps,
        maxJudges: form.maxJudges,
        submissionDeadlineMs: now + form.submissionDays * 86_400_000,
        judgingDeadlineMs: now + (form.submissionDays + form.judgingDays) * 86_400_000,
        prizeInSui: form.prizeInSui,
      });
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-koral-50 font-syne">
      <Navbar />

      {/* Header */}
      <div className="bg-koral-700 px-6 pt-10 pb-8 border-b border-koral-600">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-mono text-koral-200 tracking-widest uppercase mb-2">
            New bounty
          </p>
          <h1 className="font-syne font-bold text-2xl text-white tracking-tight">
            Post a bounty
          </h1>
          <p className="text-[13px] text-white/50 mt-1">
            Fill in the details. Your SUI reward will be locked in the contract until a winner is selected.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-20">
        <div className="flex flex-col gap-5">

          {/* Bounty type */}
          <Card title="Bounty type">
            <div className="grid grid-cols-3 gap-3">
              {BOUNTY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => set("bountyType", t.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer text-left transition-all ${
                    form.bountyType === t.id
                      ? "border-koral-600 bg-koral-50"
                      : "border-koral-100 bg-white hover:border-koral-300"
                  }`}
                >
                  <p className="text-lg mb-1.5">{t.icon}</p>
                  <p className="font-syne font-bold text-[13px] text-koral-900 mb-0.5">{t.label}</p>
                  <p className="text-[11px] text-koral-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Basic info */}
          <Card title="Basic info">
            <div className="flex flex-col gap-4">
              <Field label="Title *">
                <input
                  className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors"
                  placeholder="e.g. Design a brand identity for our DeFi protocol"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Description *">
                <textarea
                  className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors resize-y min-h-[120px] leading-relaxed"
                  placeholder="Describe the task in detail. What problem are you solving? What does a great submission look like?"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {/* Skills */}
          <Card title="Skills required">
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all font-syne ${
                    form.skills.includes(s)
                      ? "border-koral-600 bg-koral-600 text-white"
                      : "border-koral-100 bg-white text-koral-600 hover:border-koral-400"
                  }`}
                >
                  {form.skills.includes(s) ? "✓ " : ""}{s}
                </button>
              ))}
            </div>
          </Card>

          {/* Deliverables */}
          <Card title="Deliverables">
            <p className="text-[12px] text-koral-500 mb-3">List exactly what hunters must submit. Be specific.</p>
            <div className="flex flex-col gap-2">
              {form.deliverables.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[12px] text-koral-400 font-mono min-w-[20px]">{i + 1}.</span>
                  <input
                    className="flex-1 text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors"
                    placeholder={`Deliverable ${i + 1}`}
                    value={d}
                    onChange={(e) => updateDeliverable(i, e.target.value)}
                  />
                  {form.deliverables.length > 1 && (
                    <button onClick={() => removeDeliverable(i)} className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-lg px-1">×</button>
                  )}
                </div>
              ))}
              <button
                onClick={addDeliverable}
                className="text-[12px] font-semibold text-koral-600 bg-transparent border-2 border-dashed border-koral-200 hover:border-koral-400 rounded-lg py-2 cursor-pointer transition-colors font-syne"
              >
                + Add deliverable
              </button>
            </div>
          </Card>

          {/* Submission guidelines */}
          <Card title="Submission guidelines">
            <textarea
              className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors resize-y min-h-[80px] leading-relaxed"
              placeholder="How should hunters format their submission? Any file types, word counts, or other requirements?"
              value={form.guidelines}
              onChange={(e) => set("guidelines", e.target.value)}
            />
          </Card>

          {/* Resources & links */}
          <Card title="Resources & links">
            <p className="text-[12px] text-koral-500 mb-3">Add any docs, whitepapers, Figma files, or GitHub repos hunters might need.</p>
            <div className="flex flex-col gap-2">
              {form.links.map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="w-36 shrink-0 text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                  />
                  <input
                    className="flex-1 text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors"
                    placeholder="https://…"
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                  />
                  {form.links.length > 1 && (
                    <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-lg px-1">×</button>
                  )}
                </div>
              ))}
              <button
                onClick={addLink}
                className="text-[12px] font-semibold text-koral-600 bg-transparent border-2 border-dashed border-koral-200 hover:border-koral-400 rounded-lg py-2 cursor-pointer transition-colors font-syne"
              >
                + Add link
              </button>
            </div>
          </Card>

          {/* Prize & winners */}
          <Card title="Prize pool & rewards">
            <div className="flex flex-col gap-4">
              <Field label="Total prize pool (SUI) *">
                <input
                  type="number"
                  min={1}
                  className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors font-mono"
                  value={form.prizeInSui}
                  onChange={(e) => set("prizeInSui", Number(e.target.value))}
                />
                <p className="text-[11px] text-koral-400 mt-1.5">This amount will be locked on-chain. 3% platform fee applies at payout.</p>
              </Field>

              {form.bountyType === BOUNTY_TYPE.CONTEST && (
                <div>
                  <label className="block text-[11px] font-bold text-koral-500 uppercase tracking-wider mb-3">Winner split</label>
                  <div className="flex flex-col gap-2.5 mb-3">
                    {form.winners.map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[13px] text-koral-900 min-w-[32px]">{w.place}</span>
                        <input
                          type="range" min={0} max={100} step={5}
                          value={w.percentage}
                          onChange={(e) => updateWinner(i, Number(e.target.value))}
                          className="flex-1 accent-koral-600"
                        />
                        <span className="font-mono font-bold text-[13px] text-koral-900 min-w-[40px]">{w.percentage}%</span>
                        <span className="font-mono text-[12px] text-green-600 min-w-[70px]">
                          ≈{((w.percentage / 100) * form.prizeInSui).toFixed(0)} SUI
                        </span>
                        {form.winners.length > 1 && (
                          <button onClick={() => removeWinner(i)} className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-lg px-1">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={addWinner}
                      className="text-[12px] font-semibold text-koral-600 bg-transparent border-2 border-dashed border-koral-200 hover:border-koral-400 rounded-lg px-4 py-1.5 cursor-pointer font-syne"
                    >
                      + Add winner
                    </button>
                    <span className={`text-[12px] font-bold font-mono ${totalPct === 100 ? "text-green-600" : "text-red-500"}`}>
                      Total: {totalPct}% {totalPct === 100 ? "✓" : `(need ${100 - totalPct}% more)`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Judging setup */}
          <Card title="Judging setup">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-koral-500 uppercase tracking-wider mb-2">
                  Your voting weight — {Math.round(form.posterWeightBps / 100)}%
                </label>
                <input
                  type="range" min={30} max={70} step={5}
                  value={form.posterWeightBps / 100}
                  onChange={(e) => set("posterWeightBps", Number(e.target.value) * 100)}
                  className="w-full accent-koral-600"
                />
                <div className="flex justify-between text-[10px] text-koral-400 font-mono mt-1">
                  <span>30% — community-led</span>
                  <span>70% — poster-led</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-koral-500 uppercase tracking-wider mb-2">
                  Max community judges — {form.maxJudges}
                </label>
                <input
                  type="range" min={1} max={10} step={1}
                  value={form.maxJudges}
                  onChange={(e) => set("maxJudges", Number(e.target.value))}
                  className="w-full accent-koral-600"
                />
                <p className="text-[11px] text-koral-400 mt-1">
                  Community voting weight: {100 - Math.round(form.posterWeightBps / 100)}% split across {form.maxJudges} judge{form.maxJudges > 1 ? "s" : ""} ({Math.round((100 - form.posterWeightBps / 100) / form.maxJudges)}% each)
                </p>
              </div>
            </div>
          </Card>

          {/* Timelines */}
          <Card title="Timelines">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Submission window (days)">
                <input
                  type="number" min={1}
                  className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors font-mono"
                  value={form.submissionDays}
                  onChange={(e) => set("submissionDays", Number(e.target.value))}
                />
              </Field>
              <Field label="Judging window (days)">
                <input
                  type="number" min={1}
                  className="w-full text-[13px] px-3.5 py-2.5 border border-koral-100 rounded-lg bg-white text-koral-900 outline-none focus:border-koral-500 transition-colors font-mono"
                  value={form.judgingDays}
                  onChange={(e) => set("judgingDays", Number(e.target.value))}
                />
              </Field>
            </div>
            <p className="text-[11px] text-koral-400 mt-2">
              Total bounty duration: <strong className="text-koral-900">{form.submissionDays + form.judgingDays} days</strong>
            </p>
          </Card>

          {/* Error */}
          {error && (
            <div className={`px-4 py-3 rounded-xl text-[13px] font-medium ${
              error === "Uploading to Walrus…"
                ? "bg-koral-50 text-koral-700 border border-koral-200"
                : "bg-red-50 text-red-600"
            }`}>
              {error === "Uploading to Walrus…" ? "⏳ " : "⚠️ "}{error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-koral-600 hover:bg-koral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-xl border-none cursor-pointer transition-colors font-syne"
          >
            {loading
              ? error === "Uploading to Walrus…"
                ? "Uploading to Walrus…"
                : "Submitting to Sui…"
              : `Create bounty & lock ${form.prizeInSui} SUI →`}
          </button>

        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-koral-100">
      <h2 className="font-syne font-bold text-[14px] text-koral-900 mb-4 pb-3 border-b border-koral-50">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-koral-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}