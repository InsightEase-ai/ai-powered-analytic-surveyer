import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Pencil,
  RotateCcw,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import Header from "../componet/header";
import {
  closeSurvey,
  getPublicSurveyUrl,
  getResponseCount,
  getResponsesForSurvey,
  getSurvey,
  reopenSurvey,
  type StoredSurvey,
} from "../lib/surveyStorage";

function statusBadgeClass(status: StoredSurvey["status"]) {
  switch (status) {
    case "published":
      return "bg-teal-50 text-teal-700";
    case "closed":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function statusLabel(status: StoredSurvey["status"]) {
  switch (status) {
    case "published":
      return "open";
    case "closed":
      return "complete";
    default:
      return status;
  }
}

function SurveyManage() {
  const { id = "" } = useParams();
  const [survey, setSurvey] = useState<StoredSurvey | null>(() => getSurvey(id));
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const responses = survey ? getResponsesForSurvey(survey.id) : [];
  const responseCount = survey ? getResponseCount(survey.id) : 0;

  if (!survey) {
    return (
      <div className="min-h-dvh bg-[#F4F6F8] font-sans">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-gray-900">Survey not found</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 text-sm text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = survey.publicSlug
    ? getPublicSurveyUrl(survey.publicSlug)
    : null;
  const realQuestions = survey.questions.filter((q) => q.type !== "page_break");
  const surveyTitle = survey.title;
  const surveyId = survey.id;
  const isPublished = survey.status === "published";
  const isClosed = survey.status === "closed";
  const canShare = (isPublished || isClosed) && !!shareUrl;

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyTitle,
          text: `Please take this survey: ${surveyTitle}`,
          url: shareUrl,
        });
        return;
      } catch {
        // cancelled
      }
    }
    await copyLink();
  }

  function handleCloseSurvey() {
    setActionError(null);
    const updated = closeSurvey(surveyId);
    if (!updated) {
      setActionError("Could not close this survey. Please try again.");
      return;
    }
    setSurvey(updated);
  }

  function handleReopenSurvey() {
    setActionError(null);
    const updated = reopenSurvey(surveyId);
    if (!updated) {
      setActionError("Could not reopen this survey. Please try again.");
      return;
    }
    setSurvey(updated);
  }

  return (
    <div className="min-h-dvh bg-[#F4F6F8] font-sans text-sm flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {survey.title}
              </h1>
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${statusBadgeClass(survey.status)}`}
              >
                {statusLabel(survey.status)}
              </span>
            </div>
            {survey.description && (
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                {survey.description}
              </p>
            )}
            {isClosed && (
              <p className="text-sm text-amber-700 mt-2">
                This survey is complete. Respondents can no longer submit
                answers.
                {survey.closedAt
                  ? ` Closed ${new Date(survey.closedAt).toLocaleString()}.`
                  : ""}
              </p>
            )}
            {actionError && (
              <p className="text-sm text-red-500 mt-2" role="alert">
                {actionError}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isPublished && (
              <button
                type="button"
                onClick={handleCloseSurvey}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Close survey
              </button>
            )}
            {isClosed && (
              <button
                type="button"
                onClick={handleReopenSurvey}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-800 hover:bg-teal-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reopen survey
              </button>
            )}
            <Link
              to={`/survey?id=${survey.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit survey
            </Link>
          </div>
        </div>

        {canShare && shareUrl && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400">
              PUBLIC SURVEY LINK
            </p>
            {isClosed && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Link remains available, but visitors will see that this survey is
                complete until you reopen it.
              </p>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="flex-1 text-sm text-gray-700 break-all font-medium">
                {shareUrl}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-teal-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>
              {isPublished && (
                <button
                  type="button"
                  onClick={shareLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share link
                </button>
              )}
              <Link
                to={`/survey/${survey.publicSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Preview as respondent
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Responses
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {responseCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-gray-500 text-sm">Questions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {realQuestions.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" /> AI Insights
            </p>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {responseCount === 0
                ? "Collect responses to unlock AI-generated insights."
                : `${responseCount} response${responseCount === 1 ? "" : "s"} ready for analysis. View Insights when available.`}
            </p>
            <Link
              to="/insights"
              className="inline-block mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View insights →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Collected responses</h2>
            <span className="text-xs text-gray-400">{responses.length} total</span>
          </div>

          {responses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-500">
                No responses yet. Share your survey link to start collecting
                answers.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {responses.map((response, index) => (
                <li key={response.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      Response #{responses.length - index}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(response.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {realQuestions.map((q) => {
                      const answer = response.answers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="rounded-xl bg-gray-50 px-3 py-2.5"
                        >
                          <p className="text-[11px] font-medium text-gray-500 mb-0.5">
                            {q.title}
                          </p>
                          <p className="text-sm text-gray-800">
                            {answer === undefined || answer === ""
                              ? "—"
                              : String(answer)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default SurveyManage;
