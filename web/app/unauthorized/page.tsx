import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

export default function UnauthorizedPage() {
  return (
    <>
      <TopBar title="Unauthorized Access" description="Security Enclosure" />
      <div className="flex h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 max-w-md text-gray-500">
          Your wallet does not have the required permissions to access this administrative zone. 
          If you believe this is an error, please contact your Protocol Administrator.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/user-dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
          <Link href="/login" className="btn-secondary">
            Switch Wallet
          </Link>
        </div>
      </div>
    </>
  );
}
