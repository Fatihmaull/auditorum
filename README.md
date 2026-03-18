# Auditorum Protocol

> Trust infrastructure for institutional reports. Anchor cryptographic proofs on Solana. Verify with math, not authority.

## Project Structure

```
auditorum-init/
├── programs/auditorum-protocol/  # Anchor smart contract (Rust)
│   ├── Cargo.toml
│   └── src/lib.rs
├── Anchor.toml                   # Anchor config (devnet)
├── Cargo.toml                    # Rust workspace
└── web/                          # Next.js frontend
    ├── app/
    │   ├── page.tsx              # Landing page
    │   ├── upload/page.tsx       # Upload + anchor on-chain
    │   └── verify/page.tsx       # Verify report hash
    ├── components/
    ├── lib/
    ├── package.json
    └── ...configs
```

---

## Quick Start — Frontend

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend connects to **Solana devnet** by default. You can change this in `lib/constants.ts`.

---

## Smart Contract Deployment (Anchor)

### Prerequisites

1. **Rust** — https://rustup.rs
2. **Solana CLI** — https://docs.solanalabs.com/cli/install
3. **Anchor** — https://www.anchor-lang.com/docs/installation

### Steps

```bash
# 1. Configure Solana CLI for devnet
solana config set --url devnet

# 2. Create a keypair (if you don't have one)
solana-keygen new

# 3. Airdrop devnet SOL
solana airdrop 2

# 4. Build the program
anchor build

# 5. Get the program ID
anchor keys list
# Copy the program ID

# 6. Update the program ID in TWO places:
#    a. programs/auditorum-protocol/src/lib.rs → declare_id!(...)
#    b. Anchor.toml → [programs.devnet] section

# 7. Build again with the correct ID
anchor build

# 8. Deploy to devnet
anchor deploy

# 9. Update the frontend program ID
#    web/lib/constants.ts → PROGRAM_ID
```

### After Deployment

Once deployed, the program ID in `web/lib/constants.ts` must match the deployed program. The frontend will then be able to create and verify audit records on devnet.

---

## How It Works

### Upload Flow
1. User connects their Solana wallet (Phantom, Solflare)
2. User uploads an audit report file
3. Frontend computes SHA-256 hash of the file (client-side, Web Crypto API)
4. User selects role (Auditor/Company) and industry (Cybersecurity/Finance/Governance)
5. Frontend creates a `create_audit_record` transaction
6. Transaction stores the hash at a PDA derived from `["audit_record", hash]`
7. User receives a transaction signature with Solana Explorer link

### Verify Flow
1. User uploads the report file they want to verify (no wallet needed)
2. Frontend computes SHA-256 hash
3. Frontend derives the PDA from the hash
4. Frontend queries Solana for the account at that PDA
5. If found → **Verified** (shows authority, industry, role, timestamp)
6. If not found → **Not Found** (report hasn't been anchored)

### Smart Contract (Anchor)
- **Program:** `auditorum_protocol`
- **Account:** `AuditRecord` (authority, hash, industry, role, created_at, bump)
- **Instruction:** `create_audit_record(hash, industry, role)`
- **PDA Seeds:** `["audit_record", hash]` — one record per unique file hash

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Anchor 0.30.1 |
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Wallet | @solana/wallet-adapter (Phantom, Solflare) |
| Hashing | SHA-256 (Web Crypto API) |
| Network | Solana Devnet |

---

## Environment Variables (Optional)

Create `web/.env.local`:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## License

MIT
