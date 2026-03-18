use anchor_lang::prelude::*;

// Replace with your actual program ID after running `anchor keys list`
declare_id!("AUDTRMxKvMbFCPn3KhUmD9FwPsAqkJx2RMwUG8gu4wnc");

#[program]
pub mod auditorum_protocol {
    use super::*;

    /// Creates an on-chain audit record by storing a SHA-256 hash
    /// of the audit report along with metadata.
    ///
    /// The record is stored at a PDA derived from the hash,
    /// so it can be looked up by anyone who has the original file.
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
        record.created_at = Clock::get()?.unix_timestamp;
        record.bump = ctx.bumps.audit_record;

        msg!("Audit record created: {:?}", ctx.accounts.audit_record.key());
        msg!("Authority: {:?}", ctx.accounts.authority.key());

        Ok(())
    }
}

// ============================================================
// Accounts
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

// ============================================================
// State
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct AuditRecord {
    /// The wallet that anchored this record
    pub authority: Pubkey,      // 32 bytes

    /// SHA-256 hash of the audit report file
    pub hash: [u8; 32],         // 32 bytes

    /// Industry: 0 = Cybersecurity, 1 = Finance, 2 = Governance
    pub industry: u8,           // 1 byte

    /// Role: 0 = Auditor, 1 = Company
    pub role: u8,               // 1 byte

    /// Unix timestamp when the record was created
    pub created_at: i64,        // 8 bytes

    /// PDA bump seed
    pub bump: u8,               // 1 byte
}

// ============================================================
// Errors
// ============================================================

#[error_code]
pub enum AuditorumError {
    #[msg("Invalid industry value. Must be 0 (Cybersecurity), 1 (Finance), or 2 (Governance).")]
    InvalidIndustry,

    #[msg("Invalid role value. Must be 0 (Auditor) or 1 (Company).")]
    InvalidRole,
}
