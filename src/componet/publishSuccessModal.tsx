import { Check, Copy, ExternalLink, Link2, Share2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { getPublicSurveyUrl } from "../lib/surveyStorage";

type PublishSuccessModalProps = {
  open: boolean;
  surveyTitle: string;
  publicSlug: string;
  surveyId: string;
  onClose: () => void;
};

function PublishSuccessModal({
  open,
  surveyTitle,
  publicSlug,
  surveyId,
  onClose,
}: PublishSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getPublicSurveyUrl(publicSlug);

  if (!open) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyTitle,
          text: `Please take this survey: ${surveyTitle}`,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    await copyLink();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-success-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-teal-600" />
            </div>
            <div className="min-w-0">
              <h2
                id="publish-success-title"
                className="text-lg font-bold text-gray-900"
              >
                Survey Published Successfully!
              </h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {surveyTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400 mb-2">
              SHARE THIS LINK
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <Link2 className="w-4 h-4 text-teal-600 shrink-0" />
              <p className="flex-1 text-sm text-gray-700 break-all font-medium">
                {shareUrl}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/40 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-teal-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={shareLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/40 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share link
            </button>
            <Link
              to={`/survey/${publicSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/40 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </Link>
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Link
            to={`/surveys/${surveyId}`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View published survey
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-[#0B192C] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#152a40] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishSuccessModal;
