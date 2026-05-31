"use client";

const FEATURED = [
  {
    project: "Sui Overflow 2026",
    org: "Sui Foundation",
    description: "Sui's global hackathon — $500K+ in prizes across AI agents, DeFi, gaming, and infra tracks. 5,000+ registrants across two editions.",
    tag: "Hackathon",
    prize: "$500K+",
    xUrl: "https://x.com/SuiNetwork",
    url: "https://overflow.sui.io",
    logo: "🌊",
    color: "border-blue-200 hover:border-blue-400",
    tagColor: "bg-blue-100 text-blue-700",
    status: "Active",
  },
  {
    project: "CLAY Hackathon",
    org: "Lofi Foundation",
    description: "Code Like a Yeti — quarterly Sui hackathon for developers and vibe coders alike. Build with the Sui Stack, ship real products. Growing prize pool every quarter.",
    tag: "Hackathon",
    prize: "Growing pool",
    xUrl: "https://x.com/lofitheYeti",
    url: "https://hackathon.lofitheyeti.com/",
    logo: "🐾",
    color: "border-purple-200 hover:border-purple-400",
    tagColor: "bg-purple-100 text-purple-700",
    status: "Quarterly",
  },
  {
    project: "Sui Foundation Grants",
    org: "Sui Foundation",
    description: "$50M committed to developers building on Sui. Developer grants from $10K–$100K, accelerator program, DeFi liquidity incentives up to $500K, and research awards.",
    tag: "Grant",
    prize: "$10K–$500K",
    xUrl: "https://x.com/SuiFoundation",
    url: "https://sui.io/programs-funding",
    logo: "🏛️",
    color: "border-ocean-200 hover:border-ocean-400",
    tagColor: "bg-ocean-100 text-ocean-600",
    status: "Ongoing",
  },
  {
    project: "Walrus Grant Program",
    org: "Mysten Labs",
    description: "Grants for projects building on Walrus decentralised storage — the storage layer powering Koral. Open to devs, researchers, and content creators.",
    tag: "Grant",
    prize: "Varies",
    xUrl: "https://x.com/WalrusProtocol",
    url: "https://docs.wal.app",
    logo: "🦭",
    color: "border-teal-200 hover:border-teal-400",
    tagColor: "bg-teal-100 text-teal-700",
    status: "Ongoing",
  },
  {
    project: "Sui x HackMoney 2026",
    org: "ETHGlobal × Sui",
    description: "Sui's DeFi track at HackMoney — best overall project plus notable project prizes. Winners get access to the Sui Moonshot Program for long-term ecosystem support.",
    tag: "Hackathon",
    prize: "Prizes + Moonshot",
    xUrl: "https://x.com/SuiNetwork",
    url: "https://ethglobal.com/events/hackmoney2026/prizes/sui",
    logo: "💰",
    color: "border-green-200 hover:border-green-400",
    tagColor: "bg-green-100 text-green-700",
    status: "Recent",
  },
];

const STATUS_COLOR: Record<string, string> = {
  Active: "bg-teal-light text-teal",
  Quarterly: "bg-purple-100 text-purple-600",
  Ongoing: "bg-ocean-100 text-ocean-600",
  Recent: "bg-gray-100 text-gray-500",
};

export default function FeaturedExternal() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 border-t border-ocean-100">

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] font-mono font-bold text-coral tracking-widest uppercase mb-1">Sui ecosystem</p>
          <h2 className="font-sans font-bold text-[16px] text-ocean-900 tracking-tight">
            Bounties & programs not yet on Koral
          </h2>
        </div>
        <span className="text-[11px] text-ocean-400 font-mono hidden sm:block shrink-0 mt-1">External ↗</span>
      </div>

      <p className="text-[12px] text-ocean-500 leading-relaxed mb-5">
        Great Sui opportunities running outside Koral. We've linked each one directly.
        Running a program and want transparent on-chain judging?{" "}
        <a href="https://x.com/whakee_" target="_blank" rel="noopener noreferrer" className="text-coral no-underline hover:underline font-medium">
          Talk to us →
        </a>
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {FEATURED.map(f => (
          <a
            key={f.project}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`no-underline bg-white rounded-xl border-2 p-4 transition-all flex items-start gap-4 group ${f.color}`}
          >
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-ocean-50 flex items-center justify-center text-xl shrink-0">
              {f.logo}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-sans font-bold text-[13px] text-ocean-900">{f.project}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[f.status]}`}>{f.status}</span>
              </div>
              <p className="text-[11px] text-ocean-400 mb-1.5 font-medium">{f.org}</p>
              <p className="text-[12px] text-ocean-600 leading-relaxed">{f.description}</p>

              {/* X link */}
              <a
                href={f.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 mt-2 text-[11px] text-coral no-underline hover:underline font-medium"
              >
                Follow on X ↗
              </a>
            </div>

            {/* Prize */}
            <div className="text-right shrink-0">
              <p className="text-[10px] text-ocean-400 font-mono mb-0.5">prize</p>
              <p className="text-[12px] font-bold text-ocean-900 font-mono">{f.prize}</p>
              <span className="text-coral text-sm mt-2 block group-hover:translate-x-0.5 transition-transform">↗</span>
            </div>
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-5 p-4 bg-ocean-900 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-sans font-bold text-white text-[13px]">Running a Sui bounty or hackathon?</p>
          <p className="text-[11px] text-white/50 mt-0.5">Bring it on-chain. Funds locked in escrow, judging transparent, payouts automatic.</p>
        </div>
        <a
          href="/create"
          className="text-[12px] font-bold bg-coral text-white px-4 py-2 rounded-lg no-underline hover:bg-coral-dark transition-colors shrink-0 whitespace-nowrap"
        >
          Post on Koral →
        </a>
      </div>
    </div>
  );
}