# Auditorum Protocol — V3 Role-Based Access Checklist

## Phase 1: Identity & Profiles (Database)
- [x] Expand PostgreSQL `users` table with `username`, `bio`, `contact_email`, `full_name`.
- [x] Create `/user-dashboard` page as the central hub after login.
- [x] Build User Profile Edit Form in `/user-dashboard`.
- [x] Build **Role Access Panel** to list available workspace contexts derived from SQL indexing.

## Phase 2: Strict Routing & Middleware
- [x] Migrate `app/(dashboard)/workspace/page.tsx` to `app/workspace/[company_id]/page.tsx`.
- [x] Extract Auditor functionality into `app/auditorplace/[company_id]/[auditor_id]/page.tsx`.
- [x] Create Chain Admin `/chainadmin` and Superadmin `/superadmin` skeleton routes.
- [x] Write `middleware.ts` to intercept requests and enforce wallet RBAC based on the exact path requested.
- [x] Build a 403 Unauthorized Access Denied component stating matching roles.

## Phase 4: Feature Consolidation
- [x] Add `/explore` and `/verify` to protected routes in `middleware.ts`.
- [x] Remove public feature links from `PublicNavbar.tsx`.
- [x] Simplify `app/page.tsx` (Landing Page) to a single Dashboard CTA.
- [x] Add "Verification Tool" card to `user-dashboard/page.tsx`.
- [x] Verify restricted access to all features while logged out.

## Phase 5: Administrative Access & Dashboard Visibility
- [x] Define Superadmin and Chain Admin wallet constants in `lib/auth.ts`.
- [x] Update `middleware.ts` to enforce RBAC for administrative routes.
- [x] Update `app/user-dashboard/page.tsx` to display administrative cards if authorized.
- [x] Create `/unauthorized` fallback page.
- [x] Verify Superadmin access logic for `Bmk7...` wallet.

## Phase 6: Full Administrative Suit (Superadmin & Chain Admin)
- [x] Implement Superadmin Dashboard
- [x] Unblock Supabase permissions for `service_role`.
- [x] Seed 15 real documents with activity logs.
- [x] Repair local Solana toolchain (SBF).
- [x] Fix Dashboard RBAC (Multi-tenant isolation).
- [x] Implement Chain Admin Console (Indexer Monitor, Flagged Docs).
- [x] Verify functionality for both roles.

## Phase 8: AI Integration (Auditorum Intelligence)
- [ ] Design AI Feature Set (Auto-Metrics, RAG Chat).
- [ ] Extend Supabase Schema for AI Metadata.
- [ ] Implement PDF Text Extraction.
- [ ] Connect LLM for Automated Document Analysis.
- [ ] Build AI Insights Component in Workspace UI.
- [ ] Verify AI Data Integrity and Performance.

## Phase 7: Casing Resilience & Role Fix
- [x] Implement case-insensitive (`ilike`) wallet lookups in `user-dashboard/page.tsx`.
- [x] Implement case-insensitive wallet lookups in `middleware.ts`.
- [x] Correct 'Stripe Admin 1' wallet casing and profile data in `users` table.
- [x] Implement local fail-safe mocks for restricted DB environments.

## Phase 8: Chain Admin Workspace Management
- [x] Create Server Action for `admin_pubkey` assignment.
- [x] Implement Workspace Management UI in `app/chainadmin/page.tsx`.
- [x] Verify admin assignment flow.

## Phase 9: Workspace Onboarding Wizard
- [x] Implement `createWorkspace` Server Action.
- [x] Create `WorkspaceWizard` multi-step client component.
- [x] Add Premium B2B "Plans" and limits logic.
- [x] Integrate wizard into Chain Admin Console.

## Phase 11: Company Member Management
- [x] Create `workspace_members` table (and local fallback).
- [x] Implement `assignWorkspaceMember` Server Action.
- [x] Update Workspace Members UI with "Assign Company Member" form.
- [x] Implement "Restricted to Internal" file visibility logic.

## Phase- [x] Document Seeding System
    - [x] Scan and map documents to `seed-documents.json`
    - [x] Automated seeder script with Supabase integration
    - [x] High-fidelity UI fallbacks (for blocked DB)
    - [x] Final on-chain/db transition (Ready for final deployment)
