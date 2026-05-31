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

export function useBounties() {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["bounties", PACKAGE_ID],
    queryFn: async (): Promise<Bounty[]> => {
      // Step 1: get all BountyCreated events
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE}::BountyCreated`,
        },
        limit: 50,
      });

      if (!events.data.length) return [];

      // Step 2: extract bounty IDs from parsedJson
      const bountyIds = events.data.map(
        (e) => (e.parsedJson as { bounty_id: string }).bounty_id,
      );

      console.log("Found bounty IDs:", bountyIds);

      // Step 3: fetch each object individually to avoid batch issues
      const results: Bounty[] = [];

      for (const id of bountyIds) {
        try {
          const obj = await client.getObject({
            id,
            options: { showContent: true, showType: true },
          });

          console.log(
            "Object response for",
            id,
            ":",
            JSON.stringify(obj, null, 2),
          );

          if (obj.data?.content?.dataType !== "moveObject") {
            console.warn("Not a moveObject:", id, obj.data?.content?.dataType);
            continue;
          }

          const fields = (
            obj.data.content as {
              dataType: "moveObject";
              fields: Record<string, unknown>;
            }
          ).fields;

          console.log("Fields:", fields);

          // prize_pool is nested in Sui — it's an object with "value" field
          let prizePool = 0;
          if (
            typeof fields.prize_pool === "object" &&
            fields.prize_pool !== null
          ) {
            const pp = fields.prize_pool as {
              fields?: { value?: string };
              value?: string;
            };
            prizePool = mistToSui(
              BigInt(pp?.fields?.value ?? pp?.value ?? "0"),
            );
          } else if (typeof fields.prize_pool === "string") {
            prizePool = mistToSui(BigInt(fields.prize_pool));
          } else if (typeof fields.prize_pool === "number") {
            prizePool = mistToSui(BigInt(fields.prize_pool));
          }

          results.push({
            id: obj.data.objectId,
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
          });
        } catch (err) {
          console.error("Failed to fetch bounty object:", id, err);
        }
      }

      return results;
    },
    refetchInterval: 10_000,
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

      const fields = (
        obj.data.content as {
          dataType: "moveObject";
          fields: Record<string, unknown>;
        }
      ).fields;

      let prizePool = 0;
      if (typeof fields.prize_pool === "object" && fields.prize_pool !== null) {
        const pp = fields.prize_pool as {
          fields?: { value?: string };
          value?: string;
        };
        prizePool = mistToSui(BigInt(pp?.fields?.value ?? pp?.value ?? "0"));
      } else if (typeof fields.prize_pool === "string") {
        prizePool = mistToSui(BigInt(fields.prize_pool));
      }

      return {
        id: obj.data.objectId,
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
    },
    enabled: !!bountyId,
  });
}
