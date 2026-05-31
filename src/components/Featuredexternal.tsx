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
    status: "Recent",
  },
];

const TAG_STYLE: Record<string, string> = {
  Hackathon: "bg-koral-100 text-koral-700",
  Grant: "bg-koral-50 text-koral-600",
};

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-green-50 text-green-700",
  Quarterly: "bg-purple-50 text-purple-700",
  Ongoing: "bg-koral-50 text-koral-600",
  Recent: "bg-gray-100 text-gray-500",
};

export default function FeaturedExternal() {
  return (
    <div className="bg-white border-t border-koral-100">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[10px] font-mono font-bold text-koral-400 tracking-widest uppercase mb-1">
              Sui ecosystem
            </p>
            <h2 className="font-syne font-bold text-[18px] text-koral-900 tracking-tight">
              Bounties & programs not yet on Koral
            </h2>
          </div>
          <span className="text-[11px] text-koral-300 font-mono hidden sm:block shrink-0 mt-1">
            External ↗
          </span>
        </div>

        <p className="text-[13px] text-koral-500 leading-relaxed mb-6 max-w-xl">
          Great Sui opportunities running outside Koral. Running a program and want transparent on-chain judging?{" "}
          <a
            href="https://x.com/whakee_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-koral-600 no-underline hover:underline font-medium"
          >
            Talk to us →
          </a>
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {FEATURED.map((f) => (
            <a
              key={f.project}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline bg-koral-50 hover:bg-koral-100 border border-koral-100 hover:border-koral-300 rounded-xl p-4 transition-all flex items-start gap-3 group"
            >
              {/* Logo */}
              <div className="w-9 h-9 rounded-lg bg-white border border-koral-100 flex items-center justify-center text-lg shrink-0">
                {f.logo}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="font-syne font-bold text-[13px] text-koral-900">{f.project}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${TAG_STYLE[f.tag] ?? "bg-koral-100 text-koral-600"}`}>
                    {f.tag}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_STYLE[f.status]}`}>
                    {f.status}
                  </span>
                </div>
                <p className="text-[11px] text-koral-400 font-medium mb-1">{f.org}</p>
                <p className="text-[12px] text-koral-600 leading-relaxed line-clamp-2">{f.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <a
                    href={f.xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-koral-500 no-underline hover:text-koral-700 font-medium"
                  >
                    Follow on X ↗
                  </a>
                  <span className="text-[11px] font-bold font-mono text-koral-700">{f.prize}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-koral-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-syne font-bold text-white text-[14px]">
              Running a Sui bounty or hackathon?
            </p>
            <p className="text-[12px] text-white/60 mt-0.5">
              Bring it on-chain. Funds locked in escrow, judging transparent, payouts automatic.
            </p>
          </div>
          <a
            href="/create"
            className="text-[13px] font-bold bg-white text-koral-700 px-5 py-2.5 rounded-lg no-underline hover:bg-koral-50 transition-colors shrink-0 whitespace-nowrap font-syne"
          >
            Post on Koral →
          </a>
        </div>
      </div>
    </div>
  );
}