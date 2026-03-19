import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { CLUSTER_URL, PROGRAM_ID } from "./constants";
import IDL from "../idl";

// ==========================================
// Anchor Context & Provider
// ==========================================

export const getProvider = (wallet: AnchorWallet) => {
  const connection = new Connection(CLUSTER_URL, "confirmed");
  return new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
};

export const getProgram = (wallet: AnchorWallet) => {
  const provider = getProvider(wallet);
  // Optional chaining or cast since we are using JSON IDL
  return new anchor.Program(IDL as any, provider) as any;
};

// ==========================================
// PDAs
// ==========================================

export const getGlobalStatePDA = () => {
  return PublicKey.findProgramAddressSync([Buffer.from("state")], PROGRAM_ID)[0];
};

export const getWorkspacePDA = (adminPubkey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("workspace"), adminPubkey.toBuffer()],
    PROGRAM_ID
  )[0];
};

export const getAuditorAssignmentPDA = (
  workspacePubkey: PublicKey,
  auditorPubkey: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("auditor"),
      workspacePubkey.toBuffer(),
      auditorPubkey.toBuffer(),
    ],
    PROGRAM_ID
  )[0];
};

export const getDocumentMetadataPDA = (
  workspacePubkey: PublicKey,
  documentHash: Uint8Array
) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("document"), workspacePubkey.toBuffer(), Buffer.from(documentHash)],
    PROGRAM_ID
  )[0];
};

// ==========================================
// Instructions
// ==========================================

export async function initializeProtocol(wallet: AnchorWallet) {
  const program = getProgram(wallet);
  const statePda = getGlobalStatePDA();

  const tx = await program.methods
    .initialize()
    .accounts({
      globalState: statePda,
      signer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function createWorkspace(wallet: AnchorWallet, companyName: string) {
  const program = getProgram(wallet);
  const statePda = getGlobalStatePDA();
  const workspacePda = getWorkspacePDA(wallet.publicKey);

  const tx = await program.methods
    .createWorkspace(companyName)
    .accounts({
      globalState: statePda,
      workspace: workspacePda,
      admin: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function assignAuditor(
  wallet: AnchorWallet,
  workspacePubkey: PublicKey,
  auditorPubkey: PublicKey,
  firmPubkey: PublicKey,
  expiry: number
) {
  const program = getProgram(wallet);
  const statePda = getGlobalStatePDA();
  const assignmentPda = getAuditorAssignmentPDA(workspacePubkey, auditorPubkey);

  const tx = await program.methods
    .assignAuditor(firmPubkey, new anchor.BN(expiry))
    .accounts({
      globalState: statePda,
      workspace: workspacePubkey,
      auditorAssignment: assignmentPda,
      admin: wallet.publicKey,
      auditor: auditorPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function uploadDocument(
  wallet: AnchorWallet,
  workspacePubkey: PublicKey,
  documentHash: Uint8Array,
  fileCid: string,
  category: number,
  visibility: number
) {
  const program = getProgram(wallet);
  
  let isAdmin = false;
  try {
    const workspaceData = await (program as any).account.workspace.fetch(workspacePubkey);
    isAdmin = workspaceData.admin.equals(wallet.publicKey);
  } catch (e) {
    console.log("Error fetching workspace or not admin:", e);
  }

  const statePda = getGlobalStatePDA();
  const documentPda = getDocumentMetadataPDA(workspacePubkey, documentHash);

  // If user is Admin, they don't have an auditor assignment. Passing an uninitialized PDA 
  // into an Option<Account> causes Anchor to fail with AccountNotInitialized or _bn on serialization.
  // We explicitly pass null if they are admin.
  const assignmentPda = isAdmin ? null : getAuditorAssignmentPDA(workspacePubkey, wallet.publicKey);

  const tx = await program.methods
    .uploadDocument(Array.from(documentHash), fileCid, category, visibility)
    .accounts({
      globalState: statePda,
      workspace: workspacePubkey,
      auditorAssignment: assignmentPda,
      document: documentPda,
      uploader: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function acknowledgeDocument(
  wallet: AnchorWallet,
  workspacePubkey: PublicKey,
  documentPda: PublicKey
) {
  const program = getProgram(wallet);

  const tx = await program.methods
    .acknowledgeDocument()
    .accounts({
      workspace: workspacePubkey,
      document: documentPda,
      admin: wallet.publicKey,
    })
    .rpc();

  return tx;
}

export async function flagDocument(
  wallet: AnchorWallet,
  documentPda: PublicKey
) {
  const program = getProgram(wallet);
  const statePda = getGlobalStatePDA();

  const tx = await program.methods
    .flagDocument()
    .accounts({
      globalState: statePda,
      document: documentPda,
      superadmin: wallet.publicKey,
    })
    .rpc();

  return tx;
}

// ==========================================
// Public Verification (Read-Only)
// ==========================================

export interface AuditRecordData {
  authority: PublicKey;
  industry: number; // mapped to category
  role: number;
  isSigned: boolean;
  isFlagged: boolean;
  createdAt: number;
}

export async function fetchAuditRecord(documentHash: Uint8Array): Promise<AuditRecordData | null> {
  const connection = new Connection(CLUSTER_URL, "confirmed");
  const dummyWallet: AnchorWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
  };
  const provider = new anchor.AnchorProvider(connection, dummyWallet, {});
  const program = new anchor.Program(IDL as any, provider) as any;

  try {
    const accounts = await program.account.documentMetadata.all([
      {
        memcmp: {
          offset: 8 + 32 + 32, // Discriminator(8) + Uploader(32) + Workspace(32)
          bytes: anchor.utils.bytes.bs58.encode(documentHash),
        },
      },
    ]);

    if (accounts.length === 0) return null;

    const doc = accounts[0].account;
    return {
      authority: doc.uploader,
      industry: doc.category,
      role: 1, // Defaults to 1 for Company uploads in this context
      isSigned: true, 
      isFlagged: doc.isFlagged,
      createdAt: doc.createdAt.toNumber() * 1000,
    };
  } catch (err) {
    console.error("fetchAuditRecord Error:", err);
    return null;
  }
}

export function getIndustryLabel(val: number) {
  const map = ["Financial", "Security", "Compliance"];
  return map[val] || "Unknown";
}

export function getRoleLabel(val: number) {
  const map = ["Auditor", "Company"];
  return map[val] || "Unknown";
}

export function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString();
}
