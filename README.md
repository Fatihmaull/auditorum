# Auditorum Protocol 🛡️

**The Web3 Trust Intelligence Infrastructure**

Auditorum is a next-generation corporate auditing and compliance platform. By merging **Solana Cryptographic Identity (Wallet RBAC)** with high-dimensional **Vector AI Intelligence (Gemini 2.5 + pgvector)**, Auditorum transforms abstract PDF reports into a dynamic, interconnected constellation of systemic risk factors and financial compliance metrics.

---

## 🌟 Key Features

1. **Cryptographic Role-Based Access Control (RBAC)**
   - Zero-password architecture. All access is inherently bound to asymmetric cryptographic keypairs (Solana Wallets). 
   - Strict middleware routing isolates multi-tenant workspaces, ensuring confidential corporate documents never cross boundaries unless explicitly authorized.

2. **Auditorum AI Pipeline (Gemini 2.5 Flash)**
   - **Automated Ingestion**: Uploaded PDFs are instantly processed, stripped of boilerplate, and mapped into 3072-dimensional vector embeddings.
   - **Smart Extraction**: Generates Executive Summaries, Fast Metrics (Revenue, Assets), and flags Critical Compliance risks automatically upon upload.

3. **Inter-Document Intelligence Graph**
   - A real-time physics-based constellation (Force Graph 2D) rendering across the workspace.
   - Dynamically links Documents, Risk Severities, and Compliance Flags together, illuminating overlapping structural vulnerabilities across the entire corporate registry.
   - Features dynamic hover spotlights and just-in-time context rendering to master complex data visually.

4. **Workspace AI Copilot (Cross-Document RAG)**
   - A persistent, Google-Drive-style sliding right-panel agent.
   - Bypasses traditional single-document chatbots. Users can ask macro-level questions (e.g., "What are our recurring security failures across all 2024 reports?"), and the Copilot instantly synthesizes answers across the entire workspace vector store.
   - Features **Target Context Pinning** to focus the AI on specific documents via visual attachment pills.

5. **Immutable File Verification**
   - SHA-256 local hashing and IPFS base32 CIDs guarantee that no document can be silently altered or modified post-audit without failing verification checks.

---

## 🎭 End-to-End Roles & Workflows

Auditorum is designed for a multi-layered ecosystem, segregating global platform maintenance from confidential corporate administration.

### 1. The Superadmin (`Bmk7...`)
*The ultimate protocol overseer.*
- **Flow**: Connects wallet -> Enters `/user-dashboard` -> Accesses **Superadmin Console**.
- **Capabilities**: Views macro-level platform health, live database transaction metrics, API rate limits, and global system activity.

### 2. The Chain Admin (`4rUh...`)
*The network provisioner and system operator.*
- **Flow**: Connects wallet -> Enters `/user-dashboard` -> Accesses **Network Admin Console**.
- **Capabilities**: Monitors decentralized indexer node health. Most importantly, the Chain Admin is responsible for **Onboarding New Workspaces**. They provision B2B subscription plans and assign the initial `admin_pubkey` (Company Admin) to a specific corporate wallet.

### 3. The Company Admin (e.g., Stripe Admin `3n9y...`)
*The owner of a specific corporate workspace.*
- **Flow**: Connects wallet -> Enters `/user-dashboard` -> Selects their specific **Company Admin** workspace routing to `/workspace/[pubkey]`.
- **Capabilities**: 
  - Views the macroscopic **Intelligence Graph** for systemic risk clusters.
  - Uploads new confidential financial/security audits to the workspace.
  - Speaks with the **Workspace Copilot** to analyze their entire document portfolio natively.
  - Uses the **Members** tab to invite external, third-party verifiers (Auditors) to inspect their files securely.

### 4. The Assigned Auditor (e.g., EY Associate `8w9V...`)
*The designated third-party compliance verifier.*
- **Flow**: Connects wallet -> Enters `/user-dashboard` -> Sees invitations for specific workspaces under the **Assigned Auditor** panel.
- **Capabilities**: Operates similarly to a Company Admin but restricted strictly to read-only views, validation checklists, and RAG Copilot querying to cross-examine financial statements accurately.

### 5. The Public Explorer (Unauthenticated / General Public)
*The retail investor or public verifier.*
- **Flow**: Lands on homepage -> Enters the **Public Explorer** (`/explore`) or **Verification Tool** (`/verify`).
- **Capabilities**: Can browse exclusively public-facing endpoints (e.g., ESG transparency reports). Can upload any PDF to the Verification tool to instantly check its cryptographic SHA-256 hash against the Auditorum blockchain registry to detect fraud or tampering.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS v3
- **Authentication**: Solana Web3.js (Wallet Adapter)
- **Database & Vector Store**: Supabase (PostgreSQL with `pgvector` & RPC matching)
- **AI Infrastructure**: Google Gemini (`gemini-2.5-flash` for reasoning, `gemini-embedding-001` for high-dimensional semantic routing)
- **Visualizations**: React Force Graph 2D (Canvas API)

---

## 🚀 Getting Started

1. Set your `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY` in `.env.local`.
2. Run `npm install`
3. Execute `npm run dev`
4. Connect a Phantom or Backpack wallet mapped to the test framework to enter the ecosystem.
