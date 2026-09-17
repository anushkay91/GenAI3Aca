import React from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { User as UserIcon, Shield, Key, Mail, CheckCircle2, LogOut } from "lucide-react";
import { useJournal } from "../context/JournalContext";

export default function Profile({ user }: { user: User }) {
  const { stats } = useJournal();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
          <UserIcon className="w-6 h-6 text-amber-600" aria-hidden="true" />
          <span>User Profile & Security</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review your account identity, security posture, and active session details.
        </p>
      </header>

      <div className="space-y-6">
        {/* Account Info Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
            Authenticated Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-neutral-400 mt-1 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-neutral-500 font-medium">Email Address</p>
                <p className="font-semibold text-neutral-900">{user.email || "No email available"}</p>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Provider
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Key className="w-4 h-4 text-neutral-400 mt-1 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-neutral-500 font-medium">User Identifier (UID)</p>
                <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded-sm font-mono text-neutral-800 break-all">
                  {user.uid}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Data Safeguards */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Active Security Safeguards</span>
          </h2>

          <ul className="space-y-3 text-xs text-neutral-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Owner-Bound Firestore Rules:</strong> Only you can read, modify, or delete reflections stored under your account root path.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Cryptographic Token Verification:</strong> All reflection requests to the backend require a cryptographically verified Firebase ID token via standard Bearer headers.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Total Journal Volume:</strong> Currently protecting {stats.totalEntries} private journal entries.
              </div>
            </li>
          </ul>
        </div>

        {/* Sign Out Card */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Sign Out of Session</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              End your current authenticated session on this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
