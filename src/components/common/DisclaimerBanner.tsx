import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp, LifeBuoy } from "lucide-react";

export const DisclaimerBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Service disclaimer and support resources"
      className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-neutral-900">
              Reflective Support Notice
            </p>
            <p className="mt-0.5 leading-relaxed text-neutral-600">
              This AI companion offers general reflective support for personal journaling. It does not provide therapy, medical advice, psychiatric diagnosis, or clinical intervention.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="crisis-resources-panel"
          className="inline-flex items-center gap-1 font-medium text-neutral-800 hover:text-neutral-950 px-2 py-1 rounded-md hover:bg-neutral-200/60 transition shrink-0"
        >
          <span>{isExpanded ? "Hide Resources" : "Crisis Resources"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div
          id="crisis-resources-panel"
          className="mt-3 pt-3 border-t border-neutral-200 text-neutral-700 space-y-1.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
            <LifeBuoy className="w-3.5 h-3.5 text-neutral-700" aria-hidden="true" />
            <span>Immediate Support & Emergency Resources</span>
          </div>
          <p className="text-neutral-600 leading-relaxed">
            If you or someone you know is experiencing severe distress, emotional crisis, or thoughts of self-harm, please reach out to trusted humans or specialized free resources:
          </p>
          <ul className="list-disc list-inside space-y-1 text-neutral-700 mt-1 pl-1">
            <li>
              <strong>US / Canada:</strong> Call or text <a href="tel:988" className="underline font-bold text-neutral-900">988</a> for the Suicide & Crisis Lifeline (24/7, free, confidential).
            </li>
            <li>
              <strong>UK:</strong> Call <a href="tel:111" className="underline font-bold text-neutral-900">111</a> for NHS mental health services, or <a href="tel:116123" className="underline font-bold text-neutral-900">116 123</a> for the Samaritans.
            </li>
            <li>
              <strong>International:</strong> Visit <span className="font-semibold text-neutral-900">findahelpline.com</span> to find free, local crisis lines worldwide.
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
};
