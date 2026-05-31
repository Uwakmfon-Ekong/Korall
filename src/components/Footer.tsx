"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-koral-900 border-t border-koral-800 px-6 py-12 mt-auto">
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center no-underline shrink-0 mb-3">
              <img src="/koral-logo.png" alt="Koral" className="h-12 w-auto" />
            </Link>
            <p className="text-[12px] text-koral-200/60 leading-relaxed">
              On-chain bounties and contests built on Sui Network. Post tasks,
              submit work, get paid automatically. No middlemen.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-koral-300 animate-pulse" />
              <span className="text-[10px] font-mono text-koral-300 tracking-wider uppercase">
                Live on Sui Testnet
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-10 sm:gap-14">
            <div>
              <p className="text-[10px] font-mono font-bold text-koral-200/30 uppercase tracking-widest mb-4">
                Platform
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Explore bounties", href: "/" },
                  { label: "Post a bounty", href: "/create" },
                  { label: "My bounties", href: "/my-bounties" },
                  { label: "Judge hub", href: "/judge" },
                ].map((l) => (
                  <a key={l.href} href={l.href} className="text-[12px] text-koral-200/50 no-underline hover:text-white transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-koral-200/30 uppercase tracking-widest mb-4">
                Community
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "X (Twitter)", href: "https://x.com/whakee_" },
                  { label: "Telegram", href: "https://t.me/koralhq" },
                  { label: "Discord", href: "https://discord.gg/koralhq" },
                ].map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-koral-200/50 no-underline hover:text-koral-300 transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-koral-200/30 uppercase tracking-widest mb-4">
                Built with
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Sui Network", href: "https://sui.io" },
                  { label: "Walrus Storage", href: "https://docs.wal.app" },
                  { label: "CLAY Hackathon", href: "https://hackathon.lofitheyeti.com" },
                ].map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-koral-200/50 no-underline hover:text-white transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-koral-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] text-koral-200/25 font-mono">
            © 2026 Koral. Built on Sui.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://suiexplorer.com/object/0xa0a5146b398aade25bb511a0c367026ab150a7d5641ceadf6e1103db44c8cc15?network=testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-koral-200/25 font-mono no-underline hover:text-koral-300 transition-colors"
            >
              Contract ↗
            </a>
            <span className="text-koral-200/10">·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-koral-200/25 font-mono no-underline hover:text-koral-300 transition-colors"
            >
              GitHub ↗
            </a>
            <span className="text-koral-200/10">·</span>
            <span className="text-[11px] text-koral-200/25 font-mono">Testnet v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}