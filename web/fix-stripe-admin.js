require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixStripeAdmin() {
  const stripeAdminWallet = '3n9ybHpGCnT1SuP6hGy5jw8NLy8y7RgyacVFkoHn4sSj';
  const stripeWorkspaceId = '15955bda-f671-4c01-8aee-217a077065fd';

  console.log("Restoring Stripe Workspace assignment...");
  const { error: wsError } = await supabase
    .from('workspaces')
    .update({ admin_pubkey: stripeAdminWallet })
    .eq('pubkey', stripeWorkspaceId);

  if (wsError) console.error("WS Error:", wsError);

  console.log("Restoring Stripe Admin Profile...");
  const { error: userError } = await supabase
    .from('users')
    .update({ 
      full_name: 'Stripe Admin 1',
      bio: 'Lead Corporate Administrator for Stripe. Managing financial disclosures and platform integrity.'
    })
    .eq('wallet_address', stripeAdminWallet);

  if (userError) console.error("User Error:", userError);

  console.log("✅ Repair complete.");
}

fixStripeAdmin();
