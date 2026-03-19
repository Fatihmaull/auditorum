import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Future enhancement: fetch role/profile from DB using the wallet in session
  return NextResponse.json({
    user: {
      wallet: session.wallet,
    },
  });
}
