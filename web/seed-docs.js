const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

/**
 * CONFIGURATION
 */
const SOURCE_DIR = path.join(__dirname, 'auditorium-docs');
const METADATA_FILE = path.join(__dirname, 'seed-documents.json');
const OUTPUT_FILE = path.join(__dirname, 'seeded-results.json');

// Supabase Credentials (from .env.local)
const SUPABASE_URL = "https://udiqusswsojtuwgnleru.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXF1c3N3c29qdHV3Z25sZXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNTcwMiwiZXhwIjoyMDg5NDgxNzAyfQ.YCjPIn23nwZrPPFAaK_bL1BnIxhalM0NniHlmTYlJ4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Real wallets from the Auditorum Protocol demo environment
const UPLOADERS = [
  '3n9ybHpGCnT1SuP6hGy5jw8NLy8y7RgyacVFkoHn4sSj', // Stripe B2B Admin
  '8w9VvGyw3TsgLnambxFMet2u69GPXeepCDT4UUkB5B3p', // EY Auditor Associate
  '4rUhv3ApQHmHWz8vhg6J3B1xFTE5KYBx4ZCA3kvxwDZH', // Chain Admin Lead
  'Bmk7RrSYFm3DfLvGEouaVjfcK13HAKXftmmnwhSkjgCA'  // Protocol Superadmin
];

// Mapping Company names to their Pubkeys (Workspace IDs)
const COMPANY_MAP = {
  "Stripe": "15955bda-f671-4c01-8aee-217a077065fd",
  "Cloudflare": "e6f88034-7a32-4d21-965b-6f8a4869894e",
  "Notion": "a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d",
  "Figma": "f1g2m3a4-e5f6-4a5b-bc6d-7e8f9a0b1c2d",
  "Datadog": "d0d0g0d0-e5f6-4a5b-bc6d-7e8f9a0b1c2d"
};

/**
 * HELPERS
 */
function generateHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function mockUpload(fileName, hash) {
  // Simulate IPFS CID generation (v1 base32)
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  return `bafybeig${randomSuffix}${hash.slice(0, 10)}auditorum`;
}

/**
 * DATABASE HELPERS
 */
async function ensureUser(wallet) {
  const { error } = await supabase.from('users').upsert([{ 
    wallet_address: wallet,
    nonce: Math.random().toString(36).slice(2)
  }], { onConflict: 'wallet_address' });
  if (error) console.error(`[ERR] User upsert for ${wallet}:`, error.message);
}

async function ensureWorkspace(pubkey, name, admin) {
  await ensureUser(admin);
  const { error } = await supabase.from('workspaces').upsert([{
    pubkey,
    company_name: name,
    admin_pubkey: admin
  }], { onConflict: 'pubkey' });
  if (error) console.error(`[ERR] Workspace upsert for ${name}:`, error.message);
}

/**
 * DATABASE INSERT
 */
async function insertIntoDatabase(doc) {
  console.log(`[DB] Uploading: ${doc.file_name} (${doc.category}) -> ${doc.assigned_company}`);
  
  // 1. Ensure relations exist (referential integrity)
  const defaultAdmin = UPLOADERS[0];
  const workspaceId = COMPANY_MAP[doc.assigned_company] || doc.assigned_company;
  
  await ensureWorkspace(workspaceId, doc.assigned_company, defaultAdmin);
  await ensureUser(doc.uploaded_by);

  // 2. Insert document metadata
  const { error: docError } = await supabase
    .from('documents')
    .insert([{
      pubkey: doc.id,
      workspace_pubkey: workspaceId,
      document_hash: doc.hash,
      file_cid: doc.ipfs_cid,
      category: doc.category === 'finance' ? 'financial' : doc.category,
      visibility: doc.visibility,
      uploader_pubkey: doc.uploaded_by,
      anchored_at: new Date().toISOString()
    }]);

  if (docError) {
    console.error(`[ERROR] Failed to insert ${doc.file_name}:`, docError.message);
    return false;
  }

  // 3. Insert Activity Log (Real signatures!)
  const signature = "5" + crypto.randomBytes(32).toString('hex').slice(0, 87); // Mocking a real signature for UI
  const { error: logError } = await supabase
    .from('activity_logs')
    .insert([{
        workspace_pubkey: workspaceId,
        actor_pubkey: doc.uploaded_by,
        action: "document_uploaded",
        target_pubkey: doc.id,
        signature: signature,
        metadata: {
            file_name: doc.file_name,
            company: doc.assigned_company,
            file_type: "PDF"
        }
    }]);

  if (logError) {
    console.error(`[ERROR] Activity log failed for ${doc.file_name}:`, logError.message);
  }

  return true;
}


/**
 * MAIN EXECUTION
 */
async function seed() {
  console.log('--- Auditorum Document Seeder Starting (REAL UPLOAD) ---');
  
  if (!fs.existsSync(METADATA_FILE)) {
    console.error('Error: seed-documents.json not found!');
    process.exit(1);
  }

  const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  const seededDocuments = [];

  for (const item of metadata) {
    // Resolve file path
    const folderName = item.category === 'finance' ? 'finance' : item.category;
    const filePath = path.join(SOURCE_DIR, folderName, item.file_name);

    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}. Skipping.`);
      continue;
    }

    // 1. Process File
    const hash = generateHash(filePath);
    const cid = mockUpload(item.file_name, hash);
    const uploader = UPLOADERS[Math.floor(Math.random() * UPLOADERS.length)];
    const id = crypto.randomUUID();

    const documentData = {
      id,
      title: item.file_name.replace('.pdf', '').replace(/-/g, ' '),
      file_name: item.file_name,
      hash: hash,
      category: item.category,
      visibility: item.visibility,
      assigned_company: item.assigned_company,
      ipfs_cid: cid,
      uploaded_by: uploader,
      created_at: new Date().toISOString()
    };

    // 2. REAL Insert into Supabase
    const success = await insertIntoDatabase(documentData);
    if (success) {
      seededDocuments.push(documentData);
    }
  }

  // Save the results for review
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(seededDocuments, null, 2));
  
  console.log('\n--- Seeding Complete ---');
  console.log(`Successfully indexed ${seededDocuments.length} documents in Supabase.`);
  console.log(`Full log saved to: ${OUTPUT_FILE}`);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
});

