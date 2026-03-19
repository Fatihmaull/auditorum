import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="flex min-h-[85vh] items-center justify-center bg-[#FAFAF8] pt-14">
        <div className="section text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Live on Solana Devnet
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-gray-900">
            Trust infrastructure for{" "}
            <span className="text-[#0B3D91]">institutional reports</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Replace institutional trust with cryptographic verification.
            Anchor audit reports on-chain. Verify instantly.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/login" className="btn-primary btn-lg">
              Get Started
            </Link>
            <Link href="/explore" className="btn-secondary btn-lg">
              Explore Audits
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-100 bg-white py-20">
        <div className="section">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            How It Works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            Three steps to verifiable trust
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Anchor",
                desc: "Upload your audit report. We hash it with SHA-256 and store the cryptographic proof on Solana — immutably.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B3D91" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Share",
                desc: "Share your report with stakeholders. The on-chain proof travels with the document as a trust badge.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B3D91" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Verify",
                desc: "Anyone can re-hash the file and check it against the blockchain. Instant, trustless verification.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B3D91" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="card">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  {item.icon}
                </div>
                <span className="badge-blue mb-2">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-[#FAFAF8] py-20">
        <div className="section">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Protocol Features
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
            Built for enterprise trust
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Cryptographic Proofs", desc: "SHA-256 hashes anchored on Solana. Immutable and publicly verifiable." },
              { title: "Instant Verification", desc: "Verify any report in under 3 seconds. No account needed." },
              { title: "Tamper Detection", desc: "A single byte change produces a completely different hash." },
              { title: "Role-Based Access", desc: "Workspace-level permissions for companies, auditors, and admins." },
              { title: "Auditor Signatures", desc: "Auditors co-sign reports on-chain for additional trust." },
              { title: "Audit Trail", desc: "Every action is recorded and traceable. Full transparency." },
            ].map((f) => (
              <div key={f.title} className="card">
                <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-white py-20">
        <div className="section text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Ready to anchor your first report?
          </h2>
          <p className="mt-2 text-gray-500">
            Start using Auditorum Protocol today. No credit card required.
          </p>
          <Link href="/login" className="btn-primary btn-lg mt-6">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-[#FAFAF8] py-8">
        <div className="section flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0B3D91] text-[10px] font-bold text-white">
              A
            </div>
            <span className="text-xs text-gray-400">Auditorum Protocol</span>
          </div>
          <p className="text-xs text-gray-400">Powered by Solana</p>
        </div>
      </footer>
    </>
  );
}
