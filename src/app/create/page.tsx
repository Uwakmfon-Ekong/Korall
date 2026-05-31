"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCreateBounty } from "@/hooks/useTransactions";
import { BOUNTY_TYPE } from "@/lib/constants";

const BOUNTY_TYPES = [
  { id: BOUNTY_TYPE.FIXED,   label: "Fixed",   desc: "One winner takes all.", icon: "🎯" },
  { id: BOUNTY_TYPE.CONTEST, label: "Contest", desc: "Multiple winners, split prize.", icon: "🏆" },
  { id: BOUNTY_TYPE.GRANT,   label: "Grant",   desc: "Milestone-based payout.", icon: "🌱" },
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

  // Deliverables
  const addDeliverable = () => set("deliverables", [...form.deliverables, ""]);
  const updateDeliverable = (i: number, val: string) => {
    const d = [...form.deliverables]; d[i] = val; set("deliverables", d);
  };
  const removeDeliverable = (i: number) => set("deliverables", form.deliverables.filter((_, idx) => idx !== i));

  // Links
  const addLink = () => set("links", [...form.links, { label: "", url: "" }]);
  const updateLink = (i: number, k: "label" | "url", v: string) => {
    const l = [...form.links]; l[i] = { ...l[i], [k]: v }; set("links", l);
  };
  const removeLink = (i: number) => set("links", form.links.filter((_, idx) => idx !== i));

  // Skills
  const toggleSkill = (s: string) => {
    const cur = form.skills;
    set("skills", cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]);
  };

  // Winners
  const addWinner = () => {
    const next = form.winners.length + 1;
    const ordinals = ["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th"];
    set("winners", [...form.winners, { place: ordinals[next - 1] ?? `${next}th`, percentage: 0 }]);
  };
  const updateWinner = (i: number, val: number) => {
    const w = [...form.winners]; w[i] = { ...w[i], percentage: val }; set("winners", w);
  };
  const removeWinner = (i: number) => set("winners", form.winners.filter((_, idx) => idx !== i));
  const totalPct = form.winners.reduce((a, w) => a + w.percentage, 0);

  async function handleSubmit() {
    if (!form.title) { setError("Title is required."); return; }
    if (!form.prizeInSui || form.prizeInSui < 1) { setError("Prize amount is required."); return; }
    if (form.bountyType === BOUNTY_TYPE.CONTEST && totalPct !== 100) {
      setError(`Winner percentages must add up to 100%. Currently: ${totalPct}%`); return;
    }

    setLoading(true); setError("");
    try {
      // Build structured content for Walrus (stored as JSON string for now)
      const content = JSON.stringify({
        description: form.description,
        deliverables: form.deliverables.filter(Boolean),
        guidelines: form.guidelines,
        links: form.links.filter(l => l.label && l.url),
        skills: form.skills,
        winners: form.bountyType === BOUNTY_TYPE.CONTEST ? form.winners : null,
      });

      const now = Date.now();
      await createBounty({
        title: form.title,
        walrusBlobId: content, // In production: upload to Walrus, use blob ID
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

  const inputStyle = {
    width: "100%", fontSize: "13px", padding: "10px 14px",
    border: "1px solid rgba(24,95,165,0.2)", borderRadius: "8px",
    background: "white", color: "#042C53", fontFamily: "Syne, sans-serif",
    outline: "none", boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: 700 as const,
    color: "#185FA5", textTransform: "uppercase" as const,
    letterSpacing: "0.08em", marginBottom: "8px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f6fd" }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: "#042C53", padding: "40px 24px 36px", borderBottom: "1px solid rgba(55,138,221,0.15)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#378ADD", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>
            New bounty
          </p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "28px", fontWeight: 700, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
            Post a bounty
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "8px 0 0" }}>
            Fill in the details. Your SUI reward will be locked in the contract until a winner is selected.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Bounty type */}
          <Card title="Bounty type">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {BOUNTY_TYPES.map((t) => (
                <button key={t.id} onClick={() => set("bountyType", t.id)} style={{
                  padding: "14px 12px", borderRadius: "10px", border: "2px solid",
                  borderColor: form.bountyType === t.id ? "#378ADD" : "rgba(24,95,165,0.15)",
                  background: form.bountyType === t.id ? "#E6F1FB" : "white",
                  cursor: "pointer", textAlign: "left" as const, transition: "all 0.1s",
                }}>
                  <p style={{ fontSize: "18px", margin: "0 0 6px" }}>{t.icon}</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#042C53", margin: "0 0 3px", fontFamily: "Syne, sans-serif" }}>{t.label}</p>
                  <p style={{ fontSize: "11px", color: "#185FA5", margin: 0 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Basic info */}
          <Card title="Basic info">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} placeholder="e.g. Design a brand identity for our DeFi protocol"
                  value={form.title} onChange={(e) => set("title", e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#378ADD"}
                  onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                />
              </div>
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" as const, lineHeight: 1.7 }}
                  placeholder="Describe the task in detail. What problem are you solving? What does a great submission look like?"
                  value={form.description} onChange={(e) => set("description", e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#378ADD"}
                  onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                />
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card title="Skills required">
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px" }}>
              {SKILL_OPTIONS.map((s) => (
                <button key={s} onClick={() => toggleSkill(s)} style={{
                  fontSize: "12px", fontWeight: 500, padding: "5px 12px", borderRadius: "20px",
                  border: "1.5px solid", cursor: "pointer", fontFamily: "Syne, sans-serif",
                  borderColor: form.skills.includes(s) ? "#378ADD" : "rgba(24,95,165,0.15)",
                  background: form.skills.includes(s) ? "#E6F1FB" : "white",
                  color: form.skills.includes(s) ? "#0C447C" : "#185FA5",
                  transition: "all 0.1s",
                }}>
                  {form.skills.includes(s) ? "✓ " : ""}{s}
                </button>
              ))}
            </div>
          </Card>

          {/* Deliverables */}
          <Card title="Deliverables">
            <p style={{ fontSize: "12px", color: "#185FA5", margin: "0 0 12px" }}>
              List exactly what hunters must submit. Be specific.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {form.deliverables.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#378ADD", fontFamily: "JetBrains Mono, monospace", minWidth: "20px" }}>{i + 1}.</span>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder={`Deliverable ${i + 1}`}
                    value={d} onChange={(e) => updateDeliverable(i, e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#378ADD"}
                    onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                  />
                  {form.deliverables.length > 1 && (
                    <button onClick={() => removeDeliverable(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A32D2D", padding: "4px" }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addDeliverable} style={{ fontSize: "12px", fontWeight: 600, color: "#378ADD", background: "none", border: "1.5px dashed rgba(55,138,221,0.3)", borderRadius: "8px", padding: "8px", cursor: "pointer", fontFamily: "Syne, sans-serif" }}>
                + Add deliverable
              </button>
            </div>
          </Card>

          {/* Submission guidelines */}
          <Card title="Submission guidelines">
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const, lineHeight: 1.7 }}
              placeholder="How should hunters format their submission? Any file types, word counts, or other requirements?"
              value={form.guidelines} onChange={(e) => set("guidelines", e.target.value)}
              onFocus={e => e.target.style.borderColor = "#378ADD"}
              onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
            />
          </Card>

          {/* Resources & links */}
          <Card title="Resources & links">
            <p style={{ fontSize: "12px", color: "#185FA5", margin: "0 0 12px" }}>
              Add any docs, whitepapers, Figma files, or GitHub repos hunters might need.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {form.links.map((link, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input style={{ ...inputStyle, flex: "0 0 160px" }} placeholder="Label (e.g. Figma)"
                    value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#378ADD"}
                    onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                  />
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="https://…"
                    value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#378ADD"}
                    onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                  />
                  {form.links.length > 1 && (
                    <button onClick={() => removeLink(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A32D2D", padding: "4px" }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addLink} style={{ fontSize: "12px", fontWeight: 600, color: "#378ADD", background: "none", border: "1.5px dashed rgba(55,138,221,0.3)", borderRadius: "8px", padding: "8px", cursor: "pointer", fontFamily: "Syne, sans-serif" }}>
                + Add link
              </button>
            </div>
          </Card>

          {/* Prize & winners */}
          <Card title="Prize pool & rewards">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Total prize pool (SUI) *</label>
                <input type="number" min={1} style={inputStyle}
                  value={form.prizeInSui} onChange={(e) => set("prizeInSui", Number(e.target.value))}
                  onFocus={e => e.target.style.borderColor = "#378ADD"}
                  onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                />
                <p style={{ fontSize: "11px", color: "#185FA5", margin: "6px 0 0" }}>
                  This amount will be locked on-chain. 3% platform fee applies at payout.
                </p>
              </div>

              {/* Contest: winner split */}
              {form.bountyType === BOUNTY_TYPE.CONTEST && (
                <div>
                  <label style={labelStyle}>Winner split</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                    {form.winners.map((w, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#042C53", fontFamily: "JetBrains Mono, monospace", minWidth: "32px" }}>{w.place}</span>
                        <input type="range" min={0} max={100} step={5} value={w.percentage}
                          onChange={(e) => updateWinner(i, Number(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#042C53", fontFamily: "JetBrains Mono, monospace", minWidth: "40px" }}>{w.percentage}%</span>
                        <span style={{ fontSize: "12px", color: "#1D9E75", fontFamily: "JetBrains Mono, monospace", minWidth: "70px" }}>
                          ≈{((w.percentage / 100) * form.prizeInSui).toFixed(0)} SUI
                        </span>
                        {form.winners.length > 1 && (
                          <button onClick={() => removeWinner(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#A32D2D", padding: "4px" }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button onClick={addWinner} style={{ fontSize: "12px", fontWeight: 600, color: "#378ADD", background: "none", border: "1.5px dashed rgba(55,138,221,0.3)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontFamily: "Syne, sans-serif" }}>
                      + Add winner
                    </button>
                    <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: totalPct === 100 ? "#1D9E75" : "#A32D2D" }}>
                      Total: {totalPct}% {totalPct === 100 ? "✓" : `(need ${100 - totalPct}% more)`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Judging setup */}
          <Card title="Judging setup">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Your voting weight — {Math.round(form.posterWeightBps / 100)}%</label>
                <input type="range" min={30} max={70} step={5}
                  value={form.posterWeightBps / 100}
                  onChange={(e) => set("posterWeightBps", Number(e.target.value) * 100)}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#185FA5", fontFamily: "JetBrains Mono, monospace", marginTop: "4px" }}>
                  <span>30% — community-led</span>
                  <span>70% — poster-led</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Max community judges — {form.maxJudges}</label>
                <input type="range" min={1} max={10} step={1}
                  value={form.maxJudges}
                  onChange={(e) => set("maxJudges", Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <p style={{ fontSize: "11px", color: "#185FA5", margin: "4px 0 0" }}>
                  Community voting weight: {100 - Math.round(form.posterWeightBps / 100)}% split across {form.maxJudges} judge{form.maxJudges > 1 ? "s" : ""} ({Math.round((100 - form.posterWeightBps / 100) / form.maxJudges)}% each)
                </p>
              </div>
            </div>
          </Card>

          {/* Deadlines */}
          <Card title="Timelines">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Submission window (days)</label>
                <input type="number" min={1} style={inputStyle}
                  value={form.submissionDays} onChange={(e) => set("submissionDays", Number(e.target.value))}
                  onFocus={e => e.target.style.borderColor = "#378ADD"}
                  onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                />
              </div>
              <div>
                <label style={labelStyle}>Judging window (days)</label>
                <input type="number" min={1} style={inputStyle}
                  value={form.judgingDays} onChange={(e) => set("judgingDays", Number(e.target.value))}
                  onFocus={e => e.target.style.borderColor = "#378ADD"}
                  onBlur={e => e.target.style.borderColor = "rgba(24,95,165,0.2)"}
                />
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#185FA5", margin: "10px 0 0" }}>
              Total bounty duration: <strong style={{ color: "#042C53" }}>{form.submissionDays + form.judgingDays} days</strong>
            </p>
          </Card>

          {/* Error */}
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#FCEBEB", color: "#A32D2D", fontSize: "13px", fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "14px", background: loading ? "#185FA5" : "#042C53",
            color: "white", border: "none", borderRadius: "10px", fontSize: "14px",
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Syne, sans-serif", transition: "background 0.1s",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Submitting to Sui…" : `Create bounty & lock ${form.prizeInSui} SUI →`}
          </button>

        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1px solid rgba(24,95,165,0.1)" }}>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "14px", fontWeight: 700, color: "#042C53", margin: "0 0 16px", paddingBottom: "12px", borderBottom: "1px solid rgba(24,95,165,0.08)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}