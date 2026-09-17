import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Sparkles, Shield, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error?.code !== "auth/popup-closed-by-user") {
        setAuthError(
          error?.message || "Failed to complete sign-in. Please try again or check your browser popup settings."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
      <main className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-8 shadow-md">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            ReflectJournal
          </h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            A private sanctuary to write personal reflections, explore emotional clarity, and receive gentle AI-assisted perspectives.
          </p>
        </div>

        {/* Error notification */}
        {authError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Sign In Button */}
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-neutral-900 text-white font-semibold text-sm rounded-xl hover:bg-neutral-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-60 shadow-xs min-h-[48px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Security & Trust highlights */}
        <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-3 text-left">
          <div className="flex items-start gap-2 text-xs text-neutral-600">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Owner-scoped Firestore encryption</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-neutral-600">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Zero ad tracking or data reselling</span>
          </div>
        </div>
      </main>
    </div>
  );
}
