import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production"
);

// Use a global singleton for nonces to prevent scoping issues in Next.js Dev/Middleware
const globalForNonces = globalThis as unknown as { activeNonces: Set<string> };
export const activeNonces = globalForNonces.activeNonces || new Set<string>();
if (process.env.NODE_ENV !== "production") globalForNonces.activeNonces = activeNonces;

export const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  wallet: string;
  [key: string]: any;
}

// Administrative Wallets (Dev Pack)
export const SUPERADMIN_WALLETS = [
  "Bmk7RrSYFm3DfLvGEouaVjfcK13HAKXftmmnwhSkjgCA",
  "5Y89jKBiW5eJNrtBhqPpfrVp6zLSvhvVm8sJa1xhUf7j",
  "3VWwpWFE3gRsb5MSKRcPosjwjUEuFAo3sVMNyeJBGqDP"
];

export const CHAIN_ADMIN_WALLETS = [
  "4rUhv3ApQHmHWz8vhg6J3B1xFTE5KYBx4ZCA3kvxwDZH",
  "AAt9gtmwEdc4tCrGErrWeWyVKob4Goi3YESZi4S3dRNW",
  "4DrkMx5bMJrbRpED3xdUQzkexVTiKsFNZGQE6zFhELrP",
  "HsXVL9Zra8q7LVzop7EshRyrZybawp4A7DdZH24dsczb",
  "Gn2uHyXWkGmSA5fFoM3VFcCGZGBaE9NgdKVw6hEaYuVc",
  "6V72BGYMMLuBaVwQ2Mn9qV1BPtC61FpMYem7TdHheyw"
];

export function isSuperAdmin(wallet: string | undefined): boolean {
  if (!wallet) return false;
  return SUPERADMIN_WALLETS.includes(wallet);
}

export function isChainAdmin(wallet: string | undefined): boolean {
  if (!wallet) return false;
  return CHAIN_ADMIN_WALLETS.includes(wallet);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY}s`)
    .sign(JWT_SECRET);

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch (err) {
    return null;
  }
}

export function clearSession() {
  cookies().delete("session");
}
