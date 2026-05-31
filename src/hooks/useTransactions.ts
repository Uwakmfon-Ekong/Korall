"use client";

import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  PACKAGE_ID, MODULE, TREASURY_ID,
  suiToMist,
} from "@/lib/constants";
import {
  buildCommitHash, generateNonce, saveNonce,
} from "@/lib/voting";

/** Create a new bounty and lock SUI into it */
export function useCreateBounty() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  return async (params: {
    title: string;
    walrusBlobId: string;
    bountyType: number;
    posterWeightBps: number;
    maxJudges: number;
    submissionDeadlineMs: number;
    judgingDeadlineMs: number;
    prizeInSui: number;
  }) => {
    if (!account) throw new Error("Wallet not connected");

    const tx = new Transaction();

    // Split prize from gas coin
    const prizeCoin = tx.splitCoins(tx.gas, [suiToMist(params.prizeInSui)]);

    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::create_bounty`,
      arguments: [
        tx.pure.string(params.title),
        tx.pure.string(params.walrusBlobId),
        tx.pure.u8(params.bountyType),
        tx.pure.u64(params.posterWeightBps),
        tx.pure.u64(params.maxJudges),
        tx.pure.u64(params.submissionDeadlineMs),
        tx.pure.u64(params.judgingDeadlineMs),
        prizeCoin,
      ],
    });

    return signAndExecute({ transaction: tx });
  };
}

/** Hunter submits work to a bounty */
export function useSubmitWork() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  return async (bountyId: string, walrusBlobId: string, clockId: string) => {
    if (!account) throw new Error("Wallet not connected");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::submit_work`,
      arguments: [
        tx.object(bountyId),
        tx.pure.string(walrusBlobId),
        tx.object(clockId), // Sui clock object: 0x6
      ],
    });

    return signAndExecute({ transaction: tx });
  };
}

/** Apply to be a community judge */
export function useApplyToJudge() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  return async (bountyId: string) => {
    if (!account) throw new Error("Wallet not connected");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::apply_to_judge`,
      arguments: [tx.object(bountyId)],
    });

    return signAndExecute({ transaction: tx });
  };
}

/** Poster approves a judge applicant */
export function useApproveJudge() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  return async (bountyId: string, judgeAddress: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::approve_judge`,
      arguments: [
        tx.object(bountyId),
        tx.pure.address(judgeAddress),
      ],
    });
    return signAndExecute({ transaction: tx });
  };
}

/** Move bounty from OPEN → REVIEW after submission deadline */
export function useStartReview() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  return async (bountyId: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::start_review`,
      arguments: [tx.object(bountyId), tx.object("0x6")], // 0x6 = Sui clock
    });
    return signAndExecute({ transaction: tx });
  };
}

/**
 * Phase 1 — commit a blind vote.
 * Generates a nonce, builds the hash, saves nonce locally, then submits.
 */
export function useCommitVote() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  return async (bountyId: string, submissionId: string, score: number) => {
    const nonce = generateNonce();
    const commitHash = buildCommitHash(submissionId, score, nonce);

    // Save nonce so user can reveal later
    saveNonce(bountyId, nonce);

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::commit_vote`,
      arguments: [
        tx.object(bountyId),
        tx.pure(commitHash),
  
      ],
    });

    return signAndExecute({ transaction: tx });
  };
}

/**
 * Phase 2 — reveal the vote.
 * Loads the saved nonce and reveals the actual vote on-chain.
 */
export function useRevealVote() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  return async (
    bountyId: string,
    submissionId: string,
    score: number,
    nonce: Uint8Array
  ) => {

    
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::reveal_vote`,
      arguments: [
        tx.object(bountyId),
        tx.pure.id(submissionId),
        tx.pure.u8(score),
        tx.pure(nonce),
      
      ],
    });

    return signAndExecute({ transaction: tx });
  };
}

/** Finalize a fixed bounty and pay out the winner */
export function useFinalizeFixedBounty() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  return async (bountyId: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::finalize_fixed_bounty`,
      arguments: [
        tx.object(bountyId),
        tx.object(TREASURY_ID),
        tx.object("0x6"),
      ],
    });
    return signAndExecute({ transaction: tx });
  };
}
