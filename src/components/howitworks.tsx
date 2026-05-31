"use client";

const steps = [
  {
    number: "01",
    role: "Poster",
    title: "Post a bounty",
    desc: "Lock your SUI reward in a smart contract. Set the task, deadlines, and how judges are weighted. Funds are guaranteed.",
    icon: "🎯",
  },
  {
    number: "02",
    role: "Hunter",
    title: "Submit your work",
    desc: "Browse open bounties, submit your work with a link. Your submission is recorded on-chain as an NFT — permanent proof of your work.",
    icon: "⚡",
  },
  {
    number: "03",
    role: "Judge",
    title: "Community judges review",
    desc: "A panel of the poster and community judges score submissions using blind voting — no one can see others' votes until reveal.",
    icon: "⚖️",
  },
  {
    number: "04",
    role: "Winner",
    title: "Get paid on-chain",
    desc: "The smart contract automatically pays the winner. No middlemen, no waiting, no trust required. Straight to your wallet.",
    icon: "💸",
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-koral-700 py-16 px-6 border-t border-koral-600">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] text-koral-200 font-mono font-bold tracking-widest uppercase mb-3">
            How it works
          </p>
          <h2 className="font-syne font-bold text-2xl text-white tracking-tight">
            Four steps. Fully on-chain.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {steps.map((s) => (
            <div
              key={s.number}
              className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-[10px] font-mono text-koral-200 uppercase tracking-wider">
                    {s.number} · {s.role}
                  </p>
                  <p className="font-syne font-bold text-white text-[14px]">{s.title}</p>
                </div>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Built on */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <p className="text-[11px] text-koral-200 font-mono uppercase tracking-wider">Built on</p>
          {["Sui Network", "Walrus Storage", "Move Language"].map((t) => (
            <span
              key={t}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}