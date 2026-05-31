export const PACKAGE_ID = "0xa0a5146b398aade25bb511a0c367026ab150a7d5641ceadf6e1103db44c8cc15";
export const MODULE = "bountyboard";
export const TREASURY_ID = "0xaa08f70462e888f4953b5b827a0c76b5d32ccd52850607e827bfdfc054389fc2";

export const BOUNTY_TYPE = { FIXED: 0, CONTEST: 1, GRANT: 2 } as const;
export const BOUNTY_STATE = { OPEN: 0, REVIEW: 1, CLOSED: 2 } as const;
export const STATE_LABELS: Record<number, string> = { 0: "Open", 1: "In review", 2: "Closed" };
export const TYPE_LABELS: Record<number, string> = { 0: "Fixed", 1: "Contest", 2: "Grant" };

export const MIST_PER_SUI = 1_000_000_000n;
export const suiToMist = (sui: number) => BigInt(Math.floor(sui * Number(MIST_PER_SUI)));
export const mistToSui = (mist: bigint) => Number(mist) / Number(MIST_PER_SUI);
