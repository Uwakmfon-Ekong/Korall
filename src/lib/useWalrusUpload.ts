"use client";

import { useState } from "react";

const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const EPOCHS = 5;

export interface WalrusResult {
  blobId: string;
  url: string;
}

/**
 * Upload any JSON-serialisable content to Walrus testnet.
 * Returns the blob ID and a read URL.
 * Falls back to storing JSON string directly if upload fails (demo safety net).
 */
export async function uploadToWalrus(content: unknown): Promise<WalrusResult> {
  const body = typeof content === "string" ? content : JSON.stringify(content);

  try {
    const res = await fetch(
      `${PUBLISHER}/v1/blobs?epochs=${EPOCHS}`,
      {
        method: "PUT",
        body,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error(`Walrus upload failed: ${res.status}`);

    const data = await res.json();
    const blobId =
      data?.newlyCreated?.blobObject?.blobId ??
      data?.alreadyCertified?.blobId ??
      "";

    if (!blobId) throw new Error("No blob ID returned from Walrus");

    return {
      blobId,
      url: `${AGGREGATOR}/v1/blobs/${blobId}`,
    };
  } catch (err) {
    console.warn("Walrus upload failed, using fallback:", err);
    // Fallback: store JSON directly (demo only — not production)
    return {
      blobId: body,
      url: "",
    };
  }
}

/**
 * Fetch and parse JSON content from a Walrus blob ID.
 * Returns null if the blob ID is not a valid Walrus ID (e.g. raw JSON fallback).
 */
export async function fetchFromWalrus<T>(blobId: string): Promise<T | null> {
  // If it looks like JSON already (fallback mode), parse directly
  if (blobId.startsWith("{") || blobId.startsWith("[")) {
    try {
      return JSON.parse(blobId) as T;
    } catch {
      return null;
    }
  }

  // Real Walrus blob — fetch from aggregator
  try {
    const res = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json() as T;
  } catch (err) {
    console.warn("Walrus fetch failed:", err);
    return null;
  }
}

/**
 * React hook for uploading to Walrus with loading/error state.
 */
export function useWalrusUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(content: unknown): Promise<WalrusResult | null> {
    setUploading(true);
    setError("");
    try {
      const result = await uploadToWalrus(content);
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error };
}