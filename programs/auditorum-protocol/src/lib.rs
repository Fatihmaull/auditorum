use anchor_lang::prelude::*;

// Replace with your actual program ID after running `anchor keys list`
declare_id!("AUDTRMxKvMbFCPn3KhUmD9FwPsAqkJx2RMwUG8gu4wnc");

#[program]
pub mod auditorum_protocol {
    use super::*;

    // ========================================================
    // 1. Create Audit Record
    // ========================================================

    /// Stores a SHA-256 hash of an audit report on-chain.
    /// PDA: ["audit_record", hash]
    pub fn create_audit_record(
        ctx: Context<CreateAuditRecord>,
        hash: [u8; 32],
        industry: u8,
        role: u8,
    ) -> Result<()> {
        require!(industry <= 2, AuditorumError::InvalidIndustry);
        require!(role <= 1, AuditorumError::InvalidRole);

        let record = &mut ctx.accounts.audit_record;
        record.authority = ctx.accounts.authority.key();
        record.hash = hash;
        record.industry = industry;
        record.role = role;
        record.is_signed = false;
        record.is_flagged = false;
        record.created_at = Clock::get()?.unix_timestamp;
        record.bump = ctx.bumps.audit_record;

        msg!("Audit record created by {:?}", ctx.accounts.authority.key());
        Ok(())
    }

    // ========================================================
    // 2. Sign Audit Record (Auditor co-signature)
    // ========================================================

    /// An auditor co-signs an existing audit record.
    /// PDA: ["audit_signature", audit_record, signer]
    pub fn sign_audit_record(ctx: Context<SignAuditRecord>) -> Result<()> {
        let sig = &mut ctx.accounts.audit_signature;
        sig.signer = ctx.accounts.signer.key();
        sig.audit_record = ctx.accounts.audit_record.key();
        sig.created_at = Clock::get()?.unix_timestamp;
        sig.bump = ctx.bumps.audit_signature;

        // Mark the parent record as signed
        let record = &mut ctx.accounts.audit_record;
        record.is_signed = true;

        msg!(
            "Audit record {:?} signed by {:?}",
            ctx.accounts.audit_record.key(),
            ctx.accounts.signer.key()
        );
        Ok(())
    }

    // ========================================================
    // 3. Flag Audit Record (Chain Admin)
    // ========================================================

    /// A chain admin flags a suspicious audit record.
    /// PDA: ["audit_flag", audit_record, flagger]
    pub fn flag_audit_record(
        ctx: Context<FlagAuditRecord>,
        reason: [u8; 128],
    ) -> Result<()> {
        let flag = &mut ctx.accounts.audit_flag;
        flag.flagger = ctx.accounts.flagger.key();
        flag.audit_record = ctx.accounts.audit_record.key();
        flag.reason = reason;
        flag.created_at = Clock::get()?.unix_timestamp;
        flag.bump = ctx.bumps.audit_flag;

        // Mark the parent record as flagged
        let record = &mut ctx.accounts.audit_record;
        record.is_flagged = true;

        msg!(
            "Audit record {:?} flagged by {:?}",
            ctx.accounts.audit_record.key(),
            ctx.accounts.flagger.key()
        );
        Ok(())
    }
}

// ============================================================
// Instruction Accounts
// ============================================================

#[derive(Accounts)]
#[instruction(hash: [u8; 32])]
pub struct CreateAuditRecord<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + AuditRecord::INIT_SPACE,
        seeds = [b"audit_record", hash.as_ref()],
        bump,
    )]
    pub audit_record: Account<'info, AuditRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SignAuditRecord<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + AuditSignature::INIT_SPACE,
        seeds = [
            b"audit_signature",
            audit_record.key().as_ref(),
            signer.key().as_ref(),
        ],
        bump,
    )]
    pub audit_signature: Account<'info, AuditSignature>,

    #[account(mut)]
    pub audit_record: Account<'info, AuditRecord>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FlagAuditRecord<'info> {
    #[account(
        init,
        payer = flagger,
        space = 8 + AuditFlag::INIT_SPACE,
        seeds = [
            b"audit_flag",
            audit_record.key().as_ref(),
            flagger.key().as_ref(),
        ],
        bump,
    )]
    pub audit_flag: Account<'info, AuditFlag>,

    #[account(mut)]
    pub audit_record: Account<'info, AuditRecord>,

    #[account(mut)]
    pub flagger: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================
// State Accounts
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct AuditRecord {
    /// Wallet that anchored this record
    pub authority: Pubkey,      // 32
    /// SHA-256 hash of the audit report
    pub hash: [u8; 32],         // 32
    /// 0 = Cybersecurity, 1 = Finance, 2 = Governance
    pub industry: u8,           // 1
    /// 0 = Auditor, 1 = Company Admin
    pub role: u8,               // 1
    /// Whether an auditor has co-signed
    pub is_signed: bool,        // 1
    /// Whether a chain admin has flagged
    pub is_flagged: bool,       // 1
    /// Unix timestamp
    pub created_at: i64,        // 8
    /// PDA bump
    pub bump: u8,               // 1
}

#[account]
#[derive(InitSpace)]
pub struct AuditSignature {
    /// Auditor wallet that signed
    pub signer: Pubkey,         // 32
    /// The audit record being signed
    pub audit_record: Pubkey,   // 32
    /// Unix timestamp
    pub created_at: i64,        // 8
    /// PDA bump
    pub bump: u8,               // 1
}

#[account]
#[derive(InitSpace)]
pub struct AuditFlag {
    /// Chain admin who flagged
    pub flagger: Pubkey,        // 32
    /// The audit record being flagged
    pub audit_record: Pubkey,   // 32
    /// Reason (UTF-8, max 128 bytes)
    #[max_len(128)]
    pub reason: [u8; 128],      // 128
    /// Unix timestamp
    pub created_at: i64,        // 8
    /// PDA bump
    pub bump: u8,               // 1
}

// ============================================================
// Errors
// ============================================================

#[error_code]
pub enum AuditorumError {
    #[msg("Invalid industry. Must be 0 (Cybersecurity), 1 (Finance), or 2 (Governance).")]
    InvalidIndustry,

    #[msg("Invalid role. Must be 0 (Auditor) or 1 (Company Admin).")]
    InvalidRole,
}
