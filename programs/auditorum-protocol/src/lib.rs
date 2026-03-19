use anchor_lang::prelude::*;

declare_id!("2Vp8UoxngxFcGZi8iFd8SpQYhyfniANvBt7w2srE8Y6o");

#[program]
pub mod auditorum_protocol {
    use super::*;

    // ========================================================
    // 1. Initialize Protocol
    // ========================================================
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.global_state;
        state.superadmin = ctx.accounts.signer.key();
        state.is_paused = false;
        state.total_workspaces = 0;
        state.bump = ctx.bumps.global_state;

        msg!("Auditorum Protocol Initialized");
        Ok(())
    }

    // ========================================================
    // 2. Create Workspace
    // ========================================================
    pub fn create_workspace(ctx: Context<CreateWorkspace>, company_name: String) -> Result<()> {
        let state = &mut ctx.accounts.global_state;
        require!(!state.is_paused, AuditorumError::ProtocolPaused);
        require!(company_name.len() <= 50, AuditorumError::NameTooLong);

        let workspace = &mut ctx.accounts.workspace;
        workspace.admin = ctx.accounts.admin.key();
        workspace.company_name = company_name;
        workspace.subscription_active = true;
        workspace.created_at = Clock::get()?.unix_timestamp;
        workspace.bump = ctx.bumps.workspace;

        state.total_workspaces = state.total_workspaces.checked_add(1).unwrap();

        msg!("Workspace created: {:?}", workspace.key());
        Ok(())
    }

    // ========================================================
    // 3. Assign Auditor
    // ========================================================
    pub fn assign_auditor(
        ctx: Context<AssignAuditor>,
        firm: Pubkey,
        expiry: i64,
    ) -> Result<()> {
        let state = &ctx.accounts.global_state;
        require!(!state.is_paused, AuditorumError::ProtocolPaused);
        
        let assignment = &mut ctx.accounts.auditor_assignment;
        assignment.auditor = ctx.accounts.auditor.key();
        assignment.workspace = ctx.accounts.workspace.key();
        assignment.firm = firm;
        assignment.expiry = expiry;
        assignment.created_at = Clock::get()?.unix_timestamp;
        assignment.bump = ctx.bumps.auditor_assignment;

        msg!("Auditor {:?} assigned to workspace {:?}", assignment.auditor, assignment.workspace);
        Ok(())
    }

    // ========================================================
    // 4. Upload Document
    // ========================================================
    pub fn upload_document(
        ctx: Context<UploadDocument>,
        document_hash: [u8; 32],
        file_cid: String,
        category: u8,
        visibility: u8,
    ) -> Result<()> {
        let state = &ctx.accounts.global_state;
        require!(!state.is_paused, AuditorumError::ProtocolPaused);
        require!(file_cid.len() <= 64, AuditorumError::CidTooLong);
        require!(category <= 2, AuditorumError::InvalidCategory); // 0=Financial, 1=Security, 2=Compliance
        require!(visibility <= 2, AuditorumError::InvalidVisibility); // 0=Public, 1=Internal, 2=Restricted

        // RBAC CHECK
        let signer = ctx.accounts.uploader.key();
        let is_admin = signer == ctx.accounts.workspace.admin;
        
        let is_valid_auditor = if let Some(assignment) = &ctx.accounts.auditor_assignment {
            let now = Clock::get()?.unix_timestamp;
            assignment.auditor == signer && assignment.workspace == ctx.accounts.workspace.key() && assignment.expiry > now
        } else {
            false
        };

        require!(is_admin || is_valid_auditor, AuditorumError::UnauthorizedUpload);

        let doc = &mut ctx.accounts.document;
        doc.uploader = signer;
        doc.workspace = ctx.accounts.workspace.key();
        doc.document_hash = document_hash;
        doc.file_cid = file_cid;
        doc.category = category;
        doc.visibility = visibility;
        doc.is_flagged = false;
        doc.is_acknowledged = false;
        doc.created_at = Clock::get()?.unix_timestamp;
        doc.bump = ctx.bumps.document;

        msg!("Document uploaded by {:?} for workspace {:?}", signer, doc.workspace);
        Ok(())
    }

    // ========================================================
    // 5. Acknowledge Document (Company Admin Only)
    // ========================================================
    pub fn acknowledge_document(ctx: Context<AcknowledgeDocument>) -> Result<()> {
        let doc = &mut ctx.accounts.document;
        doc.is_acknowledged = true;
        msg!("Document {:?} acknowledged by admin", doc.key());
        Ok(())
    }

    // ========================================================
    // 6. Flag Document (Chain Admin / Superadmin Only)
    // ========================================================
    pub fn flag_document(ctx: Context<FlagDocument>) -> Result<()> {
        let doc = &mut ctx.accounts.document;
        doc.is_flagged = true;
        msg!("Document {:?} flagged by superadmin", doc.key());
        Ok(())
    }
}

// ============================================================
// Accounts Contexts
// ============================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = [b"state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateWorkspace<'info> {
    #[account(mut, seeds = [b"state"], bump = global_state.bump)]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = admin,
        space = 8 + Workspace::INIT_SPACE,
        seeds = [b"workspace", admin.key().as_ref()],
        bump
    )]
    pub workspace: Account<'info, Workspace>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignAuditor<'info> {
    #[account(seeds = [b"state"], bump = global_state.bump)]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut, has_one = admin)]
    pub workspace: Account<'info, Workspace>,

    #[account(
        init,
        payer = admin,
        space = 8 + AuditorAssignment::INIT_SPACE,
        seeds = [b"auditor", workspace.key().as_ref(), auditor.key().as_ref()],
        bump
    )]
    pub auditor_assignment: Account<'info, AuditorAssignment>,

    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// CHECK: Target auditor pubkey
    pub auditor: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(document_hash: [u8; 32])]
pub struct UploadDocument<'info> {
    #[account(seeds = [b"state"], bump = global_state.bump)]
    pub global_state: Account<'info, GlobalState>,

    pub workspace: Account<'info, Workspace>,

    // Optional assignment verify (will be null if admin uploads)
    // Anchor doesn't uniquely support Optional state validation purely via macro in this way without custom logic.
    // So we use an Option<Account> and check in logic.
    #[account(
        seeds = [b"auditor", workspace.key().as_ref(), uploader.key().as_ref()],
        bump,
    )]
    pub auditor_assignment: Option<Account<'info, AuditorAssignment>>,

    #[account(
        init,
        payer = uploader,
        space = 8 + DocumentMetadata::INIT_SPACE,
        seeds = [b"document", workspace.key().as_ref(), document_hash.as_ref()],
        bump
    )]
    pub document: Account<'info, DocumentMetadata>,

    #[account(mut)]
    pub uploader: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcknowledgeDocument<'info> {
    #[account(has_one = admin)]
    pub workspace: Account<'info, Workspace>,

    #[account(mut, has_one = workspace)]
    pub document: Account<'info, DocumentMetadata>,

    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct FlagDocument<'info> {
    #[account(has_one = superadmin)]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub document: Account<'info, DocumentMetadata>,

    pub superadmin: Signer<'info>,
}


// ============================================================
// State Structs
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub superadmin: Pubkey,    // 32
    pub is_paused: bool,       // 1
    pub total_workspaces: u64, // 8
    pub bump: u8,              // 1
}

#[account]
#[derive(InitSpace)]
pub struct Workspace {
    pub admin: Pubkey,                     // 32
    #[max_len(50)]
    pub company_name: String,              // 4 + 50
    pub subscription_active: bool,         // 1
    pub created_at: i64,                   // 8
    pub bump: u8,                          // 1
}

#[account]
#[derive(InitSpace)]
pub struct AuditorAssignment {
    pub auditor: Pubkey,       // 32
    pub workspace: Pubkey,     // 32
    pub firm: Pubkey,          // 32
    pub expiry: i64,           // 8
    pub created_at: i64,       // 8
    pub bump: u8,              // 1
}

#[account]
#[derive(InitSpace)]
pub struct DocumentMetadata {
    pub uploader: Pubkey,                  // 32
    pub workspace: Pubkey,                 // 32
    pub document_hash: [u8; 32],           // 32 (SHA-256 of the unencrypted file)
    #[max_len(64)]
    pub file_cid: String,                  // 4 + 64 (IPFS CID of the encrypted payload)
    pub category: u8,                      // 1
    pub visibility: u8,                    // 1
    pub is_flagged: bool,                  // 1
    pub is_acknowledged: bool,             // 1
    pub created_at: i64,                   // 8
    pub bump: u8,                          // 1
}

// ============================================================
// Errors
// ============================================================

#[error_code]
pub enum AuditorumError {
    #[msg("Protocol is paused.")]
    ProtocolPaused,
    #[msg("Company name must be 50 characters or less.")]
    NameTooLong,
    #[msg("CID must be 64 characters or less.")]
    CidTooLong,
    #[msg("Invalid Category: 0=Financial, 1=Security, 2=Compliance.")]
    InvalidCategory,
    #[msg("Invalid Visibility: 0=Public, 1=Internal, 2=Restricted.")]
    InvalidVisibility,
    #[msg("Unauthorized: You must be the Workspace Admin or an active assigned Auditor to upload here.")]
    UnauthorizedUpload,
}
