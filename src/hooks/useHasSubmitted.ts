"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, MODULE } from "@/lib/constants";

/**
 * Check if a wallet address has already submitted to a bounty
 * by querying SubmissionMade events filtered by bounty ID and hunter address
 */
export function useHasSubmitted(bountyId: string, walletAddress: string | undefined) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["hasSubmitted", bountyId, walletAddress],
    queryFn: async (): Promise<boolean> => {
      if (!walletAddress || !bountyId) return false;

      // Query SubmissionMade events for this bounty
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE}::SubmissionMade`,
        },
        limit: 50,
      });

      // Check if any event matches this bounty + this hunter
      return events.data.some(e => {
        const json = e.parsedJson as {
          bounty_id: string;
          hunter: string;
        };
        return (
          json.bounty_id === bountyId &&
          json.hunter === walletAddress
        );
      });
    },
    enabled: !!walletAddress && !!bountyId,
    staleTime: 30_000,
  });
}

/**
 * Check if a wallet has applied to judge this bounty
 * by querying JudgeApplied events
 */
export function useHasAppliedToJudge(bountyId: string, walletAddress: string | undefined) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["hasAppliedToJudge", bountyId, walletAddress],
    queryFn: async (): Promise<boolean> => {
      if (!walletAddress || !bountyId) return false;

      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE}::JudgeApplied`,
        },
        limit: 50,
      });

      return events.data.some(e => {
        const json = e.parsedJson as {
          bounty_id: string;
          applicant: string;
        };
        return (
          json.bounty_id === bountyId &&
          json.applicant === walletAddress
        );
      });
    },
    enabled: !!walletAddress && !!bountyId,
    staleTime: 30_000,
  });
}