"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID, MODULE } from "@/lib/constants";

export interface Submission {
  id: string;
  hunter: string;
  name: string;
  projectLink: string;
  comments: string;
  submittedAt: string;
  walrusBlobId: string;
}

export function useSubmissions(bountyId: string) {
  const client = useSuiClient();

  return useQuery({
    queryKey: ["submissions", bountyId],
    queryFn: async (): Promise<Submission[]> => {
      if (!bountyId) return [];

      // Get all SubmissionMade events for this bounty
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${MODULE}::SubmissionMade`,
        },
        limit: 50,
      });

      const bountyEvents = events.data.filter(
        e => (e.parsedJson as { bounty_id: string }).bounty_id === bountyId
      );

      if (!bountyEvents.length) return [];

      const results: Submission[] = [];

      for (const e of bountyEvents) {
        const json = e.parsedJson as {
          bounty_id: string;
          submission_id: string;
          hunter: string;
        };

        try {
          // Fetch the submission object for the walrus blob
          const obj = await client.getObject({
            id: json.submission_id,
            options: { showContent: true },
          });

          const f = obj.data?.content?.dataType === "moveObject"
            ? (obj.data.content as { dataType: "moveObject"; fields: Record<string, unknown> }).fields
            : null;

          const walrusBlobId = (f?.walrus_blob_id as string) ?? "";

          // Parse structured content from blob
          let name = "Anonymous";
          let projectLink = "";
          let comments = "";

          try {
            const parsed = JSON.parse(walrusBlobId);
            name = parsed.name ?? name;
            projectLink = parsed.projectLink ?? "";
            comments = parsed.comments ?? "";
          } catch {
            // plain blob id — not JSON
            projectLink = walrusBlobId;
          }

          results.push({
            id: json.submission_id,
            hunter: json.hunter,
            name,
            projectLink,
            comments,
            submittedAt: e.timestampMs
              ? new Date(Number(e.timestampMs)).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "—",
            walrusBlobId,
          });
        } catch { /* skip failed fetches */ }
      }

      return results;
    },
    enabled: !!bountyId,
    refetchInterval: 15_000,
  });
}