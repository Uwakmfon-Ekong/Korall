import { sha3_256 } from "@noble/hashes/sha3";

export function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function buildCommitHash(
  submissionIdHex: string,
  score: number,
  nonce: Uint8Array
): Uint8Array {
  const idBytes = hexToBytes(submissionIdHex.replace("0x", ""));
  const preimage = new Uint8Array([...idBytes, score, ...nonce]);
  return sha3_256(preimage);
}

export function saveNonce(bountyId: string, nonce: Uint8Array) {
  localStorage.setItem(`bb_nonce_${bountyId}`, bytesToHex(nonce));
}

export function loadNonce(bountyId: string): Uint8Array | null {
  const hex = localStorage.getItem(`bb_nonce_${bountyId}`);
  if (!hex) return null;
  return hexToBytes(hex);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
