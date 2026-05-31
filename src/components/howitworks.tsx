"use client";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      role: "Poster",
      title: "Post a bounty",
      desc: "Lock your SUI reward in a smart contract. Set the task, deadlines, and how judges are weighted. Funds are guaranteed.",
      icon: "🎯",
      color: "bg-coral/10 text-coral border-coral/20",
    },
    {
      number: "02",
      role: "Hunter",
      title: "Submit your work",
      desc: "Browse open bounties, submit your work with a link. Your submission is recorded on-chain as an NFT — permanent proof of your work.",
      icon: "⚡",
      color: "bg-teal/10 text-teal border-teal/20",
    },
    {
      number: "03",
      role: "Judge",
      title: "Community judges review",
      desc: "A panel of the poster and community judges score submissions using blind voting — no one can see others' votes until reveal.",
      icon: "⚖️",
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    {
      number: "04",
      role: "Winner",
      title: "Get paid on-chain",
      desc: "The smart contract automatically pays the winner. No middlemen, no waiting, no trust required. Straight to your wallet.",
      icon: "💸",
      color: "bg-ocean-400/10 text-ocean-600 border-ocean-200",
    },
  ];

  return (
    <div className="bg-ocean-950 py-16 px-6 border-t border-coral/10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] text-coral font-mono font-bold tracking-widest uppercase mb-3">How it works</p>
          <h2 className="font-sans font-bold text-2xl text-white tracking-tight">Four steps. Fully on-chain.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map(s => (
            <div key={s.number} className="bg-white/5 border border-white/8 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{s.number} · {s.role}</p>
                  <p className="font-sans font-bold text-white text-[14px]">{s.title}</p>
                </div>
              </div>
              <p className="text-[12px] text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Built on */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <p className="text-[11px] text-white/30 font-mono uppercase tracking-wider">Built on</p>
          {["Sui Network", "Walrus Storage", "Move Language"].map(t => (
            <span key={t} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}