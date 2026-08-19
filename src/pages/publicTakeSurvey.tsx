import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Calendar,
  Check,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import {
  isQuestionRequired,
  type SurveyQuestion,
} from "../lib/surveyStorage";

function PublicTakeSurvey() {
  const { slug = "" } = useParams();
  const survey = useQuery(
    api.surveys.getSurveyBySlug,
    slug ? { slug } : "skip",
  );
  const questions = (survey?.questions ?? []).filter(
    (q) => q.type !== "page_break",
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitResponse = useMutation(api.surveys.submitSurveyResponse);

  if (survey === undefined) {
    return (
      <div className="min-h-dvh bg-[#F4F6F8] flex items-center justify-center p-6 font-sans">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (survey === null) {
    return (
      <div className="min-h-dvh bg-[#F4F6F8] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Survey not found</h1>
          <p className="text-sm text-gray-500 mt-2">
            This survey link is invalid or the survey is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (survey.status === "closed") {
    return (
      <div className="min-h-dvh bg-[#F4F6F8] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            This survey is complete
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            &ldquo;{survey.title}&rdquo; is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  const activeSurvey = survey ?? null;
  const current = questions[step];
  const isLast = questions.length > 0 && step >= questions.length - 1;

  function setAnswer(questionId: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  }

  function validateCurrent(): boolean {
    if (!current) return true;
    if (!isQuestionRequired(current)) return true;
    const value = answers[current.id];
    if (value === undefined || value === "") {
      setError("This question is required. Please provide an answer.");
      return false;
    }
    return true;
  }

  async function goNext() {
    if (!validateCurrent()) return;
    if (isLast) {
      try {
        await submitResponse({ surveyId: activeSurvey._id, answers });
        setSubmitted(true);
      } catch {
        setError("Could not submit your response. Please try again.");
      }
      return;
    }
    setStep((s) => s + 1);
  }

  function goPrev() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  if (submitted) {
    return (
      <div className="min-h-dvh bg-[#F4F6F8] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Thank you for completing this survey.
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Your response to &ldquo;{survey.title}&rdquo; has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F4F6F8] font-sans text-sm flex flex-col">
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <p className="text-sm font-bold text-[#0B192C]">InsightEase</p>
        <p className="text-[11px] text-gray-400">Public survey</p>
      </header>

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="text-sm text-gray-500 mt-2">{survey.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              {questions.length === 0
                ? "No questions"
                : `Question ${step + 1} of ${questions.length}`}
            </p>
          </div>

          <div className="px-5 sm:px-8 py-6 min-h-[220px]">
            {questions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                This survey has no questions yet.
              </p>
            ) : (
              current && (
                <QuestionField
                  question={current}
                  value={answers[current.id]}
                  onChange={(value) => setAnswer(current.id, value)}
                />
              )
            )}
            {error && (
              <p className="mt-4 text-xs text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>

          {questions.length > 0 && (
            <div className="px-5 sm:px-8 pb-6 sm:pb-8 flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="shrink-0 p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  aria-label="Previous question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                className="flex-1 bg-[#0B192C] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#152a40] transition-colors"
              >
                {isLast ? "Submit" : "Next"}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 py-4 text-center text-[11px] text-gray-400">
        Powered by InsightEase ·{" "}
        <Link to="/" className="hover:text-gray-600">
          Home
        </Link>
      </footer>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}) {
  const required = isQuestionRequired(question);

  return (
    <div>
      <p className="text-base font-semibold text-gray-900 mb-4 leading-snug">
        {question.title}
        {required ? (
          <span className="text-red-500 ml-0.5" aria-label="required">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-medium text-gray-400">
            (optional)
          </span>
        )}
      </p>

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {question.options
            ?.filter(Boolean)
            .map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors ${
                  value === option
                    ? "border-teal-400 bg-teal-50 text-teal-800"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    value === option ? "border-teal-500" : "border-gray-300"
                  }`}
                >
                  {value === option && (
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </span>
                {option}
              </button>
            ))}
        </div>
      )}

      {question.type === "rating" && (
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: question.ratingMax ?? 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className={`w-11 h-11 rounded-full text-sm font-medium transition-colors ${
                value === i + 1
                  ? "bg-[#0B192C] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {question.type === "long_text" && (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Type your answer..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-700 outline-none focus:border-teal-400 focus:bg-white resize-y"
        />
      )}

      {question.type === "dropdown" && (
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-700 bg-white outline-none focus:border-teal-400"
        >
          <option value="">Select an option</option>
          {question.options?.filter(Boolean).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {question.type === "date" && (
        <div className="inline-flex items-center gap-2 w-full">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="date"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-700 outline-none focus:border-teal-400"
          />
        </div>
      )}

      {value !== undefined && value !== "" && (
        <p className="mt-3 inline-flex items-center gap-1 text-[11px] text-teal-600">
          <Check className="w-3 h-3" /> Answer selected
        </p>
      )}
    </div>
  );
}

export default PublicTakeSurvey;
