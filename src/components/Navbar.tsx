"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const account = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const linkBase =
    "text-[12px] transition font-medium tracking-wide no-underline";

  const linkInactive = "text-white/50 hover:text-white";
  const linkActive = "text-koral font-semibold";

  return (
    <>
      <nav className="bg-koral-700 border-b py-10 border-white/5 px-5 lg:px-20 h-14 flex items-center justify-between sticky top-0 z-50 font-syne">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/koral-logo.png" alt="Koral" className=" lg:w-20 w-14 " />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-8">

          <Link
            href="/"
            className={`${linkBase} ${
              isActive("/") ? linkActive : linkInactive
            }`}
          >
            Overview
          </Link>

          <Link
            href="/bounties"
            className={`${linkBase} ${
              isActive("/bounties") ? linkActive : linkInactive
            }`}
          >
            Bounties
          </Link>

         

          {account && (
            <>
              <Link
                href="/my-bounties"
                className={`${linkBase} ${
                  isActive("/my-bounties") ? linkActive : linkInactive
                }`}
              >
                My work
              </Link>

              <Link
                href="/judge"
                className={`${linkBase} ${
                  isActive("/judge") ? linkActive : linkInactive
                }`}
              >
                Judge
              </Link>
            </>
          )}
        </div>

        {/* Right */}
        <div className="hidden sm:flex items-center gap-3">
          {account && (
            <Link
              href="/create"
              className="text-[12px] font-semibold bg-koral text-white px-3.5 py-1.5 rounded-md hover:opacity-90 transition"
            >
              Post bounty
            </Link>
          )}

          <ConnectButton />
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <ConnectButton />

          <button
            onClick={() => setOpen(!open)}
            className="p-1 flex flex-col gap-1"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 transition ${
                open ? "bg-koral rotate-45 translate-y-1.5" : "bg-white/60"
              }`}
            />
            <span
              className={`block w-5 h-0.5 transition ${
                open ? "opacity-0" : "bg-white/60"
              }`}
            />
            <span
              className={`block w-5 h-0.5 transition ${
                open ? "bg-koral -rotate-45 -translate-y-1.5" : "bg-white/60"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-koral-700 border-b border-white/5 px-5 py-4 flex flex-col gap-4 font-syne">

          <Link href="/" onClick={() => setOpen(false)}
            className="text-sm text-white/70">
            Overview
          </Link>

          <Link href="/bounties" onClick={() => setOpen(false)}
            className="text-sm text-white/70">
            Bounties
          </Link>

          <Link href="/explore" onClick={() => setOpen(false)}
            className="text-sm text-white/70">
            Explore
          </Link>

          {account ? (
            <>
              <Link href="/my-bounties" onClick={() => setOpen(false)}
                className="text-sm text-white/70">
                My work
              </Link>

              <Link href="/judge" onClick={() => setOpen(false)}
                className="text-sm text-white/70">
                Judge
              </Link>

              <Link href="/create" onClick={() => setOpen(false)}
                className="text-sm font-semibold text-white bg-white text-koral-600 px-4 py-2 rounded-md text-center">
                Post bounty
              </Link>
            </>
          ) : (
            <div className="text-xs text-white/40 pt-2">
              Sign in to post or submit work
            </div>
          )}
        </div>
      )}
    </>
  );
}