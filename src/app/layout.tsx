"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import Footer from "@/components/Footer";

const queryClient = new QueryClient();

const networks = {
  testnet: {
    network: "testnet",
    url: "https://fullnode.testnet.sui.io:443",
  },
  mainnet: {
    network: "mainnet",
    url: "https://fullnode.mainnet.sui.io:443",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Koral — On-chain bounties on Sui</title>
        <meta name="description" content="Post bounties, submit work, get paid on-chain. Transparent hybrid judging. No middlemen. Built on Sui Network." />
        <meta property="og:title" content="Koral — On-chain bounties on Sui" />
        <meta property="og:description" content="Post bounties, submit work, get paid on-chain. Transparent hybrid judging. No middlemen." />
        <meta property="og:image" content="/koral-logo.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Koral — On-chain bounties on Sui" />
        <meta name="twitter:description" content="Post bounties, submit work, get paid on-chain. Built on Sui." />
        <meta name="twitter:image" content="/koral-logo.jpg" />
        <meta name="theme-color" content="#2447CC" />
        <link rel="icon" href="/koral-logo.jpg" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networks} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              {children}
              <Footer />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}