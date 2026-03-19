import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PROGRAM_ID, CLUSTER_URL } from "./constants";

// ============================================================
// PDA derivation
// ============================================================

export function getAuditRecordPDA(hash: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("audit_record"), Buffer.from(hash)],
    PROGRAM_ID
  );
}

// ============================================================
// Anchor discriminator
// SHA-256("global:<ix_name>")[..8]
// ============================================================

async function getInstructionDiscriminator(
  ixName: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`global:${ixName}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer).slice(0, 8);
}

// ============================================================
// Instruction: create_audit_record
// ============================================================

function encodeCreateAuditRecordData(
  discriminator: Uint8Array,
  hash: Uint8Array,
  industry: number,
  role: number
): Buffer {
  const buffer = Buffer.alloc(8 + 32 + 1 + 1);
  buffer.set(discriminator, 0);
  buffer.set(hash, 8);
  buffer.writeUInt8(industry, 40);
  buffer.writeUInt8(role, 41);
  return buffer;
}

export async function createAuditRecord(
  wallet: AnchorWallet,
  hash: Uint8Array,
  industry: number,
  role: number
): Promise<string> {
  const connection = new Connection(CLUSTER_URL, "confirmed");
  const [auditRecordPDA] = getAuditRecordPDA(hash);

  const discriminator = await getInstructionDiscriminator("create_audit_record");
  const data = encodeCreateAuditRecordData(discriminator, hash, industry, role);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: auditRecordPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = wallet.publicKey;

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;

  const signed = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

// ============================================================
// Queries
// ============================================================

export interface AuditRecordData {
  authority: PublicKey;
  hash: number[];
  industry: number;
  role: number;
  isSigned: boolean;
  isFlagged: boolean;
  createdAt: number;
  bump: number;
}

export async function fetchAuditRecord(
  hash: Uint8Array
): Promise<AuditRecordData | null> {
  const connection = new Connection(CLUSTER_URL, "confirmed");
  const [pda] = getAuditRecordPDA(hash);

  const accountInfo = await connection.getAccountInfo(pda);
  if (!accountInfo) return null;

  const data = accountInfo.data;
  // Anchor account: 8-byte discriminator + fields
  // authority(32) + hash(32) + industry(1) + role(1) + is_signed(1) + is_flagged(1) + created_at(8) + bump(1) = 77
  if (data.length < 8 + 77) return null;

  const offset = 8;
  const authority = new PublicKey(data.slice(offset, offset + 32));
  const hashBytes = Array.from(data.slice(offset + 32, offset + 64));
  const industry = data[offset + 64];
  const role = data[offset + 65];
  const isSigned = data[offset + 66] === 1;
  const isFlagged = data[offset + 67] === 1;

  const createdAtLow = data.readUInt32LE(offset + 68);
  const createdAtHigh = data.readInt32LE(offset + 72);
  const createdAt = createdAtHigh * 4294967296 + createdAtLow;

  const bump = data[offset + 76];

  return { authority, hash: hashBytes, industry, role, isSigned, isFlagged, createdAt, bump };
}

// ============================================================
// Display helpers
// ============================================================

export function getIndustryLabel(value: number): string {
  const labels = ["Cybersecurity", "Finance", "Governance"];
  return labels[value] ?? "Unknown";
}

export function getRoleLabel(value: number): string {
  const labels = ["Auditor", "Company Admin"];
  return labels[value] ?? "Unknown";
}

export function formatTimestamp(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString();
}
