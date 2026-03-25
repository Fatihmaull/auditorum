import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="flex min-h-[85vh] items-center justify-center bg-dark-900 pt-14 relative overflow-hidden">
        {/* Abstract blurred background shapes for Web3 vibe */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        
        <div className="section text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-dark-700 bg-dark-800/80 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-gray-300 shadow-xl shadow-brand-500/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Live on Solana Devnet
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm">
            Trust infrastructure for{" "}
            <span className="text-neon-blue drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">institutional reports</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Replace institutional trust with cryptographic verification.
            Anchor audit reports on-chain. Verify instantly.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/login" className="btn-primary btn-lg shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-dark-700 bg-dark-900 relative z-10 py-24">
        <div className="section">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Three steps to verifiable trust
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Anchor",
                desc: "Connect your wallet and upload your report. We hash it and store the cryptographic proof on Solana.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Share",
                desc: "Share your report with stakeholders. The on-chain proof travels with the document as a trust badge.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Verify",
                desc: "Authorized users can re-hash the file and check it against the blockchain. Secure and identity-first.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="card-hover glass-panel relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-dark-700/50 border border-dark-600 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                    {item.icon}
                  </div>
                  <span className="badge-blue mb-3">{item.step}</span>
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-dark-700 bg-dark-900 py-24 relative">
        <div className="absolute right-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-neon-blue/10 blur-[100px]" />
        
        <div className="section">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
            Protocol Features
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Built for enterprise trust
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Cryptographic Proofs", desc: "SHA-256 hashes anchored on Solana. Immutable and verifiable." },
              { title: "Identity-First", desc: "Every action is tied to a verified wallet. No anonymous tampering." },
              { title: "Tamper Detection", desc: "A single byte change produces a completely different hash." },
              { title: "Role-Based Access", desc: "Workspace-level permissions for companies, auditors, and admins." },
              { title: "Auditor Signatures", desc: "Auditors co-sign reports on-chain for additional trust." },
              { title: "Audit Trail", desc: "Every action is recorded and traceable. Full transparency." },
            ].map((f) => (
              <div key={f.title} className="card bg-dark-800/80 border-dark-700 hover:border-dark-600 transition-colors">
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-dark-700 bg-dark-900 py-24 relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="section text-center relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Ready to anchor your first report?
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Start using Auditorum Protocol today. Secure your enterprise intelligence with zero knowledge leaks.
          </p>
          <Link href="/login" className="btn-primary btn-lg mt-8 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-900 py-8">
        <div className="section flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]">
              A
            </div>
            <span className="text-xs font-medium text-gray-500">Auditorum Protocol</span>
          </div>
          <p className="text-xs text-brand-500/60 font-medium tracking-wide">Powered by Solana</p>
        </div>
      </footer>
    </>
  );
}
