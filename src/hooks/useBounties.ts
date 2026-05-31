"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, MODULE, mistToSui } from "@/lib/constants";

export interface Bounty {
  id: string;
  poster: string;
  title: string;
  walrusBlobId: string;
  bountyType: number;
  state: number;
  prizePool: number;
  submissionDeadlineMs: number;
  judgingDeadlineMs: number;
  posterWeightBps: number;
  submissionCount: number;
  judgeCount: number;
}

const CACHE_KEY = "koral_bounties_cache";
const CACHE_TTL = 60_000; // 1 minute

function saveCache(bounties: Bounty[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: bounties, ts: Date.now() }));
  } catch { /* ignore */ }
}

function loadCache(): Bounty[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function parseFields(objectId: string, fields: Record<string, unknown>): Bounty {
  let prizePool = 0;
  if (typeof fields.prize_pool === "object" && fields.prize_pool !== null) {
    const pp = fields.prize_pool as { fields?: { value?: string }; value?: string };
    prizePool = mistToSui(BigInt(pp?.fields?.value ?? pp?.value ?? "0"));
  } else if (typeof fields.prize_pool === "string") {
    prizePool = mistToSui(BigInt(fields.prize_pool));
  } else if (typeof fields.prize_pool === "number") {
    prizePool = mistToSui(BigInt(fields.prize_pool));
  }
  return {
    id: objectId,
    poster: fields.poster as string,
    title: fields.title as string,
    walrusBlobId: fields.walrus_blob_id as string,
    bountyType: Number(fields.bounty_type),
    state: Number(fields.state),
    prizePool,
    submissionDeadlineMs: Number(fields.submission_deadline_ms),
    judgingDeadlineMs: Number(fields.judging_deadline_ms),
    posterWeightBps: Number(fields.poster_weight_bps),
    submissionCount: Number(fields.submission_count),
    judgeCount: Array.isArray(fields.judges) ? fields.judges.length : 0,
  };
}

export function useBounties() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["bounties", PACKAGE_ID],
    queryFn: async (): Promise<Bounty[]> => {
      const events = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE}::BountyCreated` },
        limit: 50,
      });

      if (!events.data.length) return [];

      const bountyIds = events.data.map(
        (e) => (e.parsedJson as { bounty_id: string }).bounty_id
      );

      const objects = await client.multiGetObjects({
        ids: bountyIds,
        options: { showContent: true },
      });

      const bounties = objects
        .filter((o) => o.data?.content?.dataType === "moveObject")
        .map((o) => {
          const fields = (o.data!.content as {
            dataType: "moveObject";
            fields: Record<string, unknown>;
          }).fields;
          return parseFields(o.data!.objectId, fields);
        });

      saveCache(bounties);
      return bounties;
    },
    initialData: () => loadCache() ?? undefined,
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
}

export function useBounty(bountyId: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["bounty", bountyId],
    queryFn: async (): Promise<Bounty | null> => {
      const obj = await client.getObject({
        id: bountyId,
        options: { showContent: true },
      });
      if (obj.data?.content?.dataType !== "moveObject") return null;
      const fields = (obj.data.content as {
        dataType: "moveObject";
        fields: Record<string, unknown>;
      }).fields;
      return parseFields(obj.data.objectId, fields);
    },
    enabled: !!bountyId,
    staleTime: 10_000,
  });
}