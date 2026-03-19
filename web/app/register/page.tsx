"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="w-full max-w-sm text-center">
          <div className="card">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-500">
              We sent a confirmation link to <strong>{email}</strong>.
              Click it to activate your account.
            </p>
          </div>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-[#0B3D91] hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3D91] text-sm font-bold text-white">
              A
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Auditorum
            </span>
          </Link>
        </div>

        <div className="card">
          <h1 className="mb-1 text-lg font-semibold text-gray-900">
            Create an account
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Sign up to start managing your audit workspace.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="input-label">Full Name</label>
              <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Jane Doe" required />
            </div>
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" required />
            </div>
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min. 6 characters" minLength={6} required />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#0B3D91] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
