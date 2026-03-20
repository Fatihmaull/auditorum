import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  
  if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", wallet)
    .single();

  return NextResponse.json({ profile: data });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.wallet) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("users")
    .upsert({
      wallet_address: session.wallet,
      full_name: body.full_name,
      username: body.username || null,
      bio: body.bio,
      contact_email: body.contact_email,
      nonce: "synced_profile", // We can satisfy the NOT NULL constraint on nonce for legacy reasons
      updated_at: new Date().toISOString()
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
