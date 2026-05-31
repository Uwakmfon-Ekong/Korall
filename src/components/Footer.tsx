"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ocean-950 border-t border-white/5 px-6 py-12 mt-auto">
      <div className="max-w-2xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/"
                className="flex items-center no-underline shrink-0"
              >
                <img
                  src="/koral-logo.jpg"
                  alt="Koral"
                  className="h-14 w-auto"
                />
              </Link>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed">
              On-chain bounties and contests built on Sui Network. Post tasks,
              submit work, get paid automatically. No middlemen.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
              <span className="text-[10px] font-mono text-coral/70 tracking-wider uppercase">
                Live on Sui Testnet
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mb-4">
                Platform
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="/"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  Explore bounties
                </a>
                <a
                  href="/create"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  Post a bounty
                </a>
                <a
                  href="/my-bounties"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  My bounties
                </a>
                <a
                  href="/judge"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  Judge hub
                </a>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mb-4">
                Community
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://x.com/whakee_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-white/50 no-underline hover:text-coral transition-colors"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://t.me/koralhq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-white/50 no-underline hover:text-coral transition-colors"
                >
                  Telegram
                </a>
                <a
                  href="https://discord.gg/koralhq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-white/50 no-underline hover:text-coral transition-colors"
                >
                  Discord
                </a>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mb-4">
                Built with
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://sui.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  Sui Network
                </a>
                <a
                  href="https://docs.wal.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  Walrus Storage
                </a>
                <a
                  href="https://clay.lofi.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-white/50 no-underline hover:text-white transition-colors"
                >
                  CLAY Hackathon
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[11px] text-white/25 font-mono">
            © 2026 Koral. Built on Sui.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`https://suiexplorer.com/object/0xa0a5146b398aade25bb511a0c367026ab150a7d5641ceadf6e1103db44c8cc15?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-white/25 font-mono no-underline hover:text-coral transition-colors"
            >
              Contract ↗
            </a>
            <span className="text-white/10">·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-white/25 font-mono no-underline hover:text-coral transition-colors"
            >
              GitHub ↗
            </a>
            <span className="text-white/10">·</span>
            <span className="text-[11px] text-white/25 font-mono">
              Testnet v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
