import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ====== HERO ====== */}
      <section className="glow relative flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        {/* Grid bg */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="badge mx-auto mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-light animate-pulse" />
            Built on Solana
          </div>

          <h1 className="font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
            Trust Reports with{" "}
            <em className="text-accent-light">Math,</em>
            <br />
            Not Authority
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/50">
            Anchor audit reports on Solana. Verify authenticity with
            cryptographic proofs. No middlemen, no guesswork.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/upload" className="btn-primary">
              Upload Report
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link href="/verify" className="btn-secondary">
              Verify Report
            </Link>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="border-t border-white/5 py-24">
        <div className="section">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/30">
            How It Works
          </p>
          <h2 className="mt-4 text-center font-serif text-3xl sm:text-4xl">
            Three Steps to Verifiable Trust
          </h2>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                num: "01",
                title: "Anchor",
                desc: "Upload your audit report. We hash it with SHA-256 and store the proof on Solana — immutably.",
              },
              {
                num: "02",
                title: "Share",
                desc: "Share your report with stakeholders. The on-chain proof travels with it as a verification badge.",
              },
              {
                num: "03",
                title: "Verify",
                desc: "Anyone can re-hash the file and check it against the blockchain. Instant, trustless verification.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="card group transition-all hover:-translate-y-1 hover:border-white/10"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 font-mono text-sm font-semibold text-accent-light transition-colors group-hover:bg-accent/20">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="border-t border-white/5 py-24">
        <div className="section">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🔐",
                title: "Cryptographic Proofs",
                desc: "SHA-256 hashes anchored on Solana. Immutable and publicly verifiable.",
              },
              {
                icon: "⚡",
                title: "Instant Verification",
                desc: "Verify any report in under 3 seconds. No account needed.",
              },
              {
                icon: "🛡️",
                title: "Tamper Detection",
                desc: "A single byte change produces a completely different hash.",
              },
              {
                icon: "🏛️",
                title: "Multi-Industry",
                desc: "Cybersecurity, Finance, and Governance audit types supported.",
              },
              {
                icon: "👥",
                title: "Role-Based",
                desc: "Auditors and Companies both have first-class workflows.",
              },
              {
                icon: "🌐",
                title: "On-Chain Forever",
                desc: "Solana's ledger ensures your proofs persist permanently.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card transition-all hover:-translate-y-1 hover:border-white/10"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h4 className="mb-1 text-sm font-semibold">{f.title}</h4>
                <p className="text-sm text-white/40">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="glow relative border-t border-white/5 py-24 text-center">
        <div className="section relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl">
            Ready to Anchor Your First Report?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/40">
            Connect your wallet, upload a report, and create a tamper-proof
            on-chain record in under a minute.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/upload" className="btn-accent">
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-white/5 py-12">
        <div className="section flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold text-white">
              A
            </div>
            <span className="font-serif text-sm text-white/60">
              Auditorum Protocol
            </span>
          </div>
          <p className="text-xs text-white/30">
            © 2026 Auditorum Protocol. Built on Solana.
          </p>
        </div>
      </footer>
    </>
  );
}
