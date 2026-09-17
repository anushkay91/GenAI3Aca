import React, { useState } from "react";
import { Settings as SettingsIcon, ShieldCheck, Download, CheckCircle2, Lock, EyeOff } from "lucide-react";
import { useJournal } from "../context/JournalContext";

export default function Settings() {
  const { entries } = useJournal();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `reflect-journal-export-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-amber-600" aria-hidden="true" />
          <span>Privacy Architecture & Preferences</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Understand how ReflectJournal protects your private reflections, identity, and AI processing.
        </p>
      </header>

      <div className="space-y-6">
        {/* Privacy by Design Card */}
        <section aria-labelledby="privacy-architecture-title" className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base mb-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 id="privacy-architecture-title">Privacy by Design Principles</h2>
          </div>
          <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
            Your journal is an intimate record of your thoughts. ReflectJournal is engineered from the ground up to prevent unauthorized exposure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1.5">
                <Lock className="w-4 h-4 text-neutral-700" />
                <span>Private Cloud Storage</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Reflections are persisted in Google Cloud Firestore with security rules guaranteeing that only the authenticated user UID matching the path can read or write documents.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1.5">
                <EyeOff className="w-4 h-4 text-neutral-700" />
                <span>Zero Tracking or Reselling</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                No third-party analytics trackers, advertising pixels, or telemetry scripts are installed. Your writing remains strictly yours.
              </p>
            </div>
          </div>
        </section>

        {/* AI Processing Disclosures */}
        <section aria-labelledby="ai-processing-title" className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
          <h2 id="ai-processing-title" className="text-base font-bold text-neutral-900 mb-2">
            How AI Processing Works
          </h2>
          <div className="space-y-2.5 text-xs text-neutral-600 leading-relaxed">
            <p>
              1. <strong>Server-Side Proxy:</strong> The browser never communicates with Gemini directly. Your Google Gemini API credentials remain locked inside the backend environment.
            </p>
            <p>
              2. <strong>Identity Isolation:</strong> When the backend sends your draft to Gemini for reflection, your email address, name, and user ID are <em>never</em> passed into the AI prompt. Only your reflection text and recent writing excerpts are provided.
            </p>
            <p>
              3. <strong>Prompt Hardening:</strong> Prompt templates treat journal text as untrusted data to protect against prompt injection and avoid system overrides.
            </p>
          </div>
        </section>

        {/* Data Portability Card */}
        <section aria-labelledby="data-portability-title" className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="data-portability-title" className="text-base font-bold text-neutral-900">
                Data Portability & Export
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Download a complete, offline JSON archive of all your saved reflections and AI responses.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              disabled={entries.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-40 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON ({entries.length})</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your reflection archive has been exported to your downloads folder.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
