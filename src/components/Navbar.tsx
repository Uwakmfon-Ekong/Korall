"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function Navbar() {
  const account = useCurrentAccount();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="bg-ocean-900 border-b border-white/8 px-5 py-14 h-14 flex items-center justify-between sticky top-0 z-50">
        {/* Logo */}
        
         <Link href="/" className="flex items-center no-underline shrink-0">
  <img
    src="/koral-logo.jpg"
    alt="Koral"
    className="h-14 w-auto"
  />
</Link>
       

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-[12px] text-white/50 hover:text-white transition-colors no-underline font-medium">Explore</Link>
          {account && (
            <>
              <Link href="/my-bounties" className="text-[12px] text-white/50 hover:text-white transition-colors no-underline font-medium">My bounties</Link>
              <Link href="/judge" className="text-[12px] text-white/50 hover:text-white transition-colors no-underline font-medium">Judge hub</Link>
            </>
          )}
        </div>

        {/* Desktop right */}
        <div className="hidden sm:flex items-center gap-3">
          {account && (
            <Link href="/create" className="text-[12px] font-bold bg-coral text-white px-3.5 py-1.5 rounded-md no-underline hover:bg-coral-dark transition-colors">
              + Post bounty
            </Link>
          )}
          <ConnectButton />
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <ConnectButton />
          <button onClick={() => setOpen(!open)} className="bg-transparent border-none cursor-pointer p-1 flex flex-col gap-1" aria-label="Toggle menu">
            <span className={`block w-5 h-0.5 transition-all ${open ? "bg-coral rotate-45 translate-x-1 translate-y-1.5" : "bg-white/70"}`} />
            <span className={`block w-5 h-0.5 bg-white/70 transition-all ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`block w-5 h-0.5 transition-all ${open ? "bg-coral -rotate-45 translate-x-1 -translate-y-1.5" : "bg-white/70"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden bg-ocean-900 border-b border-coral/20 px-5 pt-3 pb-5 flex flex-col gap-4 sticky top-14 z-49">
          <Link href="/" onClick={() => setOpen(false)} className="text-sm text-white/70 no-underline font-medium">Explore</Link>
          {account && (
            <>
              <Link href="/my-bounties" onClick={() => setOpen(false)} className="text-sm text-white/70 no-underline font-medium">My bounties</Link>
              <Link href="/judge" onClick={() => setOpen(false)} className="text-sm text-white/70 no-underline font-medium">Judge hub</Link>
              <Link href="/create" onClick={() => setOpen(false)} className="text-sm font-bold bg-coral text-white px-4 py-2.5 rounded-md no-underline text-center">
                + Post bounty
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}