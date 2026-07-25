import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  ListChecks,
  Star,
  AlignLeft,
  ChevronDown,
  Calendar,
  SeparatorHorizontal,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  Monitor,
  Smartphone,
  Link2,
  Mail,
  Code2,
  Rocket,
  GripVertical,
  Bot,
  LayoutList,
  Eye,
  Pencil,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import Header from "../componet/header";
import PublishSuccessModal from "../componet/publishSuccessModal";
import {
  createSurveyId,
  getSurvey,
  isQuestionRequired,
  upsertSurvey,
  type SurveyQuestion,
  type SurveyQuestionType,
} from "../lib/surveyStorage";

type QuestionType = SurveyQuestionType;
type Question = SurveyQuestion;

type MobilePanel = "toolbox" | "editor" | "preview";

const QUESTION_TYPES = [
  { type: "multiple_choice" as const, label: "Multiple Choice", icon: ListChecks },
  { type: "rating" as const, label: "Rating Scale", icon: Star },
  { type: "long_text" as const, label: "Long Text", icon: AlignLeft },
  { type: "dropdown" as const, label: "Dropdown", icon: ChevronDown },
  { type: "date" as const, label: "Date Picker", icon: Calendar },
];

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "MULTIPLE CHOICE",
  rating: "RATING SCALE",
  long_text: "LONG TEXT",
  dropdown: "DROPDOWN",
  date: "DATE PICKER",
  page_break: "PAGE BREAK",
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "multiple_choice",
    title: "How satisfied were you with your last purchase?",
    options: ["Very Satisfied", "Somewhat Satisfied"],
    suggestion: "Add a 'Neutral' option for better data granularity.",
    required: true,
  },
  {
    id: "q2",
    type: "rating",
    title: "How likely are you to recommend InsightEase to a friend?",
    ratingMax: 5,
    required: true,
  },
];

function createQuestion(type: QuestionType): Question {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  switch (type) {
    case "multiple_choice":
      return {
        id,
        type,
        title: "Untitled multiple choice question",
        options: ["Option 1", "Option 2"],
        suggestion: "Add a 'Neutral' option for better data granularity.",
        required: true,
      };
    case "rating":
      return {
        id,
        type,
        title: "Untitled rating question",
        ratingMax: 5,
        required: true,
      };
    case "long_text":
      return {
        id,
        type,
        title: "Untitled open-ended question",
        required: true,
      };
    case "dropdown":
      return {
        id,
        type,
        title: "Untitled dropdown question",
        options: ["Option 1", "Option 2"],
        required: true,
      };
    case "date":
      return {
        id,
        type,
        title: "Untitled date question",
        required: true,
      };
    case "page_break":
      return { id, type, title: "Page Break", required: false };
  }
}

function CreateSurvey() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [surveyId, setSurveyId] = useState(() => createSurveyId());
  const [title, setTitle] = useState("Customer Satisfaction Survey");
  const [description, setDescription] = useState(
    "Help us improve your experience with the new Julius platform",
  );
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [selectedId, setSelectedId] = useState<string>("q1");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [previewStep, setPreviewStep] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<
    Record<string, string | number>
  >({});
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("editor");
  const [previewComplete, setPreviewComplete] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [publishModal, setPublishModal] = useState<{
    slug: string;
    title: string;
    id: string;
  } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const previewQuestions = questions.filter((q) => q.type !== "page_break");
  const currentPreview = previewQuestions[previewStep];
  const isLastPreview =
    previewQuestions.length > 0 && previewStep >= previewQuestions.length - 1;

  useEffect(() => {
    const paramId = searchParams.get("id");
    if (!paramId) {
      setHydrated(true);
      return;
    }

    const existing = getSurvey(paramId);
    if (existing) {
      setSurveyId(existing.id);
      setTitle(existing.title);
      setDescription(existing.description);
      setQuestions(existing.questions);
      const first = existing.questions.find((q) => q.type !== "page_break");
      setSelectedId(first?.id ?? "");
      setLastSavedAt(existing.updatedAt);
    }
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- hydrate once on mount

  useEffect(() => {
    if (!statusMessage && !statusError) return;
    const timer = window.setTimeout(() => {
      setStatusMessage(null);
      setStatusError(null);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [statusMessage, statusError]);

  useEffect(() => {
    if (previewQuestions.length === 0) {
      setPreviewStep(0);
      setPreviewComplete(false);
      return;
    }
    if (previewStep > previewQuestions.length - 1) {
      setPreviewStep(previewQuestions.length - 1);
    }
  }, [previewQuestions.length, previewStep]);

  function validateSurvey(requireQuestions: boolean): string | null {
    if (!title.trim()) return "Add a survey title before saving.";
    if (requireQuestions) {
      const realQuestions = questions.filter((q) => q.type !== "page_break");
      if (realQuestions.length === 0) {
        return "Add at least one question before publishing.";
      }
      if (realQuestions.some((q) => !q.title.trim())) {
        return "Every question needs a title before publishing.";
      }
      const choiceQuestions = realQuestions.filter(
        (q) => q.type === "multiple_choice" || q.type === "dropdown",
      );
      if (
        choiceQuestions.some(
          (q) => !q.options || q.options.filter((o) => o.trim()).length < 2,
        )
      ) {
        return "Choice questions need at least two options before publishing.";
      }
    }
    return null;
  }

  function persist(status: "draft" | "published") {
    const saved = upsertSurvey({
      id: surveyId,
      title: title.trim(),
      description: description.trim(),
      questions,
      status,
    });
    setSurveyId(saved.id);
    setLastSavedAt(saved.updatedAt);
    setSearchParams({ id: saved.id }, { replace: true });
    return saved;
  }

  async function handleSaveDraft() {
    const error = validateSurvey(false);
    if (error) {
      setStatusError(error);
      setStatusMessage(null);
      return;
    }

    setSaving("draft");
    setStatusError(null);
    try {
      // Brief delay so the UI can show saving state
      await new Promise((r) => setTimeout(r, 250));
      persist("draft");
      setStatusMessage("Draft saved.");
    } catch {
      setStatusError("Could not save draft. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveAndPublish() {
    const error = validateSurvey(true);
    if (error) {
      setStatusError(error);
      setStatusMessage(null);
      return;
    }

    setSaving("publish");
    setStatusError(null);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const saved = persist("published");
      if (!saved.publicSlug) {
        setStatusError("Could not generate a public link. Please try again.");
        return;
      }
      setStatusMessage(null);
      setPublishModal({
        slug: saved.publicSlug,
        title: saved.title,
        id: saved.id,
      });
    } catch {
      setStatusError("Could not publish survey. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  function addQuestion(type: QuestionType) {
    const next = createQuestion(type);
    setQuestions((prev) => [...prev, next]);
    if (type !== "page_break") setSelectedId(next.id);
    setMobilePanel("editor");
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  function updateOption(id: string, index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || !q.options) return q;
        const options = [...q.options];
        options[index] = value;
        return { ...q, options };
      }),
    );
  }

  function addOption(id: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || !q.options) return q;
        return { ...q, options: [...q.options, ""] };
      }),
    );
  }

  function duplicateQuestion(id: string) {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id);
      if (index === -1) return prev;
      const copy = {
        ...prev[index],
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        options: prev[index].options ? [...prev[index].options!] : undefined,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      setSelectedId(copy.id);
      return next;
    });
  }

  function deleteQuestion(id: string) {
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== id);
      if (selectedId === id) {
        const first = next.find((q) => q.type !== "page_break");
        setSelectedId(first?.id ?? "");
      }
      return next;
    });
  }

  function applySuggestion(id: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id || !q.options || !q.suggestion) return q;
        if (q.options.some((o) => o.toLowerCase() === "neutral")) {
          return { ...q, suggestion: undefined };
        }
        return {
          ...q,
          options: [...q.options, "Neutral"],
          suggestion: undefined,
        };
      }),
    );
  }

  function goToNextPreview() {
    if (previewQuestions.length === 0) return;
    if (currentPreview && isQuestionRequired(currentPreview)) {
      const value = previewAnswers[currentPreview.id];
      if (value === undefined || value === "") {
        setPreviewError("This question is required. Please provide an answer.");
        return;
      }
    }
    setPreviewError(null);
    if (isLastPreview) {
      setPreviewComplete(true);
      return;
    }
    setPreviewStep((step) => step + 1);
  }

  function goToPrevPreview() {
    setPreviewError(null);
    if (previewComplete) {
      setPreviewComplete(false);
      return;
    }
    setPreviewStep((step) => Math.max(0, step - 1));
  }

  function restartPreview() {
    setPreviewStep(0);
    setPreviewAnswers({});
    setPreviewComplete(false);
    setPreviewError(null);
  }

  function setAnswer(questionId: string, value: string | number) {
    setPreviewAnswers((prev) => ({ ...prev, [questionId]: value }));
    setPreviewError(null);
  }

  function renderPreviewQuestion(q: Question) {
    const answer = previewAnswers[q.id];
    const required = isQuestionRequired(q);

    return (
      <div key={`preview-${q.id}`}>
        <p className="text-xs font-semibold text-gray-800 mb-2.5 leading-snug">
          {q.title}
          {required && (
            <span className="text-red-500 ml-0.5" aria-label="required">
              *
            </span>
          )}
          {!required && (
            <span className="ml-1.5 text-[10px] font-medium text-gray-400">
              (optional)
            </span>
          )}
        </p>

        {q.type === "multiple_choice" && (
          <div className="space-y-2">
            {q.options
              ?.filter(Boolean)
              .map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswer(q.id, option)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors ${
                    answer === option
                      ? "border-teal-400 bg-teal-50 text-teal-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      answer === option ? "border-teal-500" : "border-gray-300"
                    }`}
                  >
                    {answer === option && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    )}
                  </span>
                  {option}
                </button>
              ))}
          </div>
        )}

        {q.type === "rating" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: q.ratingMax ?? 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAnswer(q.id, i + 1)}
                className={`w-8 h-8 rounded-full text-[11px] font-medium transition-colors ${
                  answer === i + 1
                    ? "bg-[#0B192C] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {q.type === "long_text" && (
          <textarea
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            rows={3}
            placeholder="Type your answer..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-[11px] text-gray-700 outline-none focus:border-teal-400 resize-none"
          />
        )}

        {q.type === "dropdown" && (
          <select
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-[11px] text-gray-600 bg-white outline-none focus:border-teal-400"
          >
            <option value="">Select an option</option>
            {q.options?.filter(Boolean).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {q.type === "date" && (
          <input
            type="date"
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-[11px] text-gray-600 outline-none focus:border-teal-400"
          />
        )}
      </div>
    );
  }

  const toolbox = (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400 mb-3">
        QUESTION TYPES
      </p>
      <div className="space-y-2">
        {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addQuestion(type)}
            className="w-full flex items-center gap-2.5 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50/40 rounded-xl px-3 py-2.5 text-left text-gray-700 transition-colors"
          >
            <Icon className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400 mt-6 mb-3">
        LOGIC & FLOW
      </p>
      <button
        type="button"
        onClick={() => addQuestion("page_break")}
        className="w-full flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50/40 rounded-xl px-3 py-2.5 text-left text-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <SeparatorHorizontal className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-xs font-medium">Page Break</span>
        </span>
        <GripVertical className="w-4 h-4 text-gray-300" />
      </button>
    </div>
  );

  const preview = (
    <div className="h-full overflow-y-auto p-4 sm:p-5 relative">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400">
          LIVE PREVIEW
        </p>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setPreviewMode("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              previewMode === "desktop"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Desktop preview"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              previewMode === "mobile"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Mobile preview"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className={`mx-auto bg-[#F4F6F8] border border-gray-200 shadow-inner overflow-hidden ${
          previewMode === "mobile"
            ? "rounded-[2rem] max-w-[240px] sm:max-w-[240px] border-[6px] border-gray-800"
            : "rounded-xl max-w-full"
        }`}
      >
        {previewMode === "mobile" && (
          <div className="flex justify-center py-2 bg-gray-800">
            <div className="w-16 h-1 rounded-full bg-gray-600" />
          </div>
        )}
        <div
          className={`bg-white flex flex-col ${
            previewMode === "mobile" ? "p-4 min-h-[420px]" : "p-5 min-h-[380px]"
          }`}
        >
          <h3 className="font-bold text-gray-900 text-sm leading-snug">
            {title || "Untitled Survey"}
          </h3>
          {description && (
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-1 mb-3">
            {previewQuestions.length === 0
              ? "No questions yet"
              : previewComplete
                ? "Complete"
                : `Question ${previewStep + 1} of ${previewQuestions.length} · 2 mins`}
          </p>

          <div className="flex-1">
            {previewComplete ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Thanks for your feedback!
                </p>
                <p className="text-[11px] text-gray-500">
                  You&apos;ve completed all questions.
                </p>
                <button
                  type="button"
                  onClick={restartPreview}
                  className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  Restart preview
                </button>
              </div>
            ) : previewQuestions.length === 0 ? (
              <p className="text-[11px] text-gray-400 py-8 text-center">
                Add questions to see them here.
              </p>
            ) : (
              <>
                {currentPreview && renderPreviewQuestion(currentPreview)}
                {previewError && (
                  <p className="mt-3 text-[11px] text-red-500" role="alert">
                    {previewError}
                  </p>
                )}
              </>
            )}
          </div>

          {!previewComplete && previewQuestions.length > 0 && (
            <div className="mt-6 flex items-center gap-2">
              {previewStep > 0 && (
                <button
                  type="button"
                  onClick={goToPrevPreview}
                  className="shrink-0 p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  aria-label="Previous question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={goToNextPreview}
                className="flex-1 bg-[#0B192C] text-white text-xs font-medium py-3 rounded-xl hover:bg-[#152a40] transition-colors"
              >
                {isLastPreview ? "Submit" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-5 right-5 w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 shadow-lg items-center justify-center text-white">
        <Bot className="w-5 h-5" />
      </div>
    </div>
  );

  const editor = (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-5 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
          <div>
            <label
              htmlFor="survey-title"
              className="block text-[10px] font-bold tracking-[0.12em] text-gray-400 mb-2"
            >
              SURVEY TITLE
            </label>
            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-base font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-colors"
              placeholder="Enter survey title"
            />
          </div>
          <div>
            <label
              htmlFor="survey-description"
              className="block text-[10px] font-bold tracking-[0.12em] text-gray-400 mb-2"
            >
              SHORT DESCRIPTION
            </label>
            <textarea
              id="survey-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 outline-none placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-colors resize-y min-h-[80px]"
              placeholder="Add a short description for respondents..."
            />
          </div>
        </div>

        {questions.map((question) => {
          if (question.type === "page_break") {
            return (
              <div
                key={question.id}
                className="relative flex items-center gap-3 py-2"
              >
                <div className="flex-1 border-t border-dashed border-gray-300" />
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                  Page Break
                </span>
                <button
                  type="button"
                  onClick={() => deleteQuestion(question.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                  aria-label="Delete page break"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 border-t border-dashed border-gray-300" />
              </div>
            );
          }

          const selected = selectedId === question.id;

          return (
            <div
              key={question.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(question.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedId(question.id);
                }
              }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow ${
                selected
                  ? "border-teal-200 border-l-4 border-l-teal-500"
                  : "border-gray-100"
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`text-[10px] font-bold tracking-[0.12em] ${
                      selected ? "text-teal-600" : "text-gray-400"
                    }`}
                  >
                    {TYPE_LABELS[question.type]}
                    {isQuestionRequired(question) && (
                      <span className="text-red-500 ml-1" aria-hidden>
                        *
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateQuestion(question.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                      aria-label="Duplicate question"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(question.id);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      aria-label="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-1 mb-4">
                  <input
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(question.id, { title: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-base font-semibold text-gray-900 bg-transparent outline-none min-w-0"
                  />
                  {isQuestionRequired(question) && (
                    <span
                      className="text-red-500 text-base font-semibold shrink-0 pt-0.5"
                      aria-label="Required question"
                    >
                      *
                    </span>
                  )}
                </div>

                {(question.type === "multiple_choice" ||
                  question.type === "dropdown") && (
                  <div className="space-y-2">
                    {question.options?.map((option, index) => (
                      <div
                        key={`${question.id}-opt-${index}`}
                        className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5"
                      >
                        {question.type === "multiple_choice" ? (
                          <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                        ) : (
                          <span className="text-xs text-gray-400 w-4 text-center">
                            {index + 1}
                          </span>
                        )}
                        <input
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, index, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent outline-none text-sm text-gray-700 min-w-0"
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addOption(question.id);
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-teal-600"
                    >
                      <span className="w-4 h-4 rounded-full border border-dashed border-gray-300" />
                      Add option...
                    </button>
                  </div>
                )}

                {question.type === "rating" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {Array.from(
                      { length: question.ratingMax ?? 5 },
                      (_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-medium"
                        >
                          {i + 1}
                        </div>
                      ),
                    )}
                  </div>
                )}

                {question.type === "long_text" && (
                  <div className="h-24 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
                    Long answer text field...
                  </div>
                )}

                {question.type === "date" && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Select a date
                  </div>
                )}

                <div
                  className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Required Question
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isQuestionRequired(question)
                        ? "Respondents must answer before continuing."
                        : "Respondents can skip this question."}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isQuestionRequired(question)}
                    aria-label="Required Question"
                    onClick={() =>
                      updateQuestion(question.id, {
                        required: !isQuestionRequired(question),
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      isQuestionRequired(question)
                        ? "bg-teal-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isQuestionRequired(question)
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {question.suggestion && (
                <div className="mx-3 sm:mx-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-800 leading-relaxed">
                      <span className="font-semibold">Sherpa suggests:</span>{" "}
                      {question.suggestion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      applySuggestion(question.id);
                    }}
                    className="shrink-0 self-start sm:self-auto bg-[#0B192C] text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-[#152a40] transition-colors"
                  >
                    Apply Suggestion
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => addQuestion("multiple_choice")}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50/30 rounded-2xl py-5 text-gray-500 hover:text-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Question</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-dvh flex flex-col bg-[#F4F6F8] font-sans text-sm overflow-hidden">
      <Header />

      {publishModal && (
        <PublishSuccessModal
          open
          surveyTitle={publishModal.title}
          publicSlug={publishModal.slug}
          surveyId={publishModal.id}
          onClose={() => setPublishModal(null)}
        />
      )}

      {/* Mobile panel switcher */}
      <div className="lg:hidden shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-xl p-1">
          {(
            [
              { id: "toolbox" as const, label: "Blocks", icon: LayoutList },
              { id: "editor" as const, label: "Edit", icon: Pencil },
              { id: "preview" as const, label: "Preview", icon: Eye },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobilePanel(id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                mobilePanel === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left toolbox — desktop always, mobile via tab */}
        <aside
          className={`w-full lg:w-56 shrink-0 bg-white border-r border-gray-200 ${
            mobilePanel === "toolbox" ? "block" : "hidden"
          } lg:block`}
        >
          {toolbox}
        </aside>

        {/* Center editor */}
        <main
          className={`flex-1 min-w-0 min-h-0 ${
            mobilePanel === "editor" ? "block" : "hidden"
          } lg:block`}
        >
          {editor}
        </main>

        {/* Right live preview */}
        <aside
          className={`w-full lg:w-[300px] shrink-0 bg-white border-l border-gray-200 ${
            mobilePanel === "preview" ? "block" : "hidden"
          } lg:block`}
        >
          {preview}
        </aside>
      </div>

      {/* Bottom action bar */}
      <footer className="shrink-0 bg-white border-t border-gray-200 px-3 sm:px-6 py-3 safe-area-pb">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.14em] text-gray-400 mr-1">
              DISTRIBUTE:
            </span>
            {[
              { label: "Link", icon: Link2 },
              { label: "Email", icon: Mail },
              { label: "Embed", icon: Code2 },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-teal-300 hover:text-teal-700 bg-white transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-1.5">
            {(statusMessage || statusError || lastSavedAt) && (
              <p
                className={`text-[11px] text-right ${
                  statusError
                    ? "text-red-500"
                    : statusMessage
                      ? "text-teal-600"
                      : "text-gray-400"
                }`}
                role="status"
              >
                {statusError ||
                  statusMessage ||
                  (lastSavedAt
                    ? `Last saved ${new Date(lastSavedAt).toLocaleString()}`
                    : null)}
              </p>
            )}
            <div className="flex items-center gap-3 sm:gap-4 justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving !== null || !hydrated}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving === "draft" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : statusMessage === "Draft saved." ? (
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                ) : null}
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSaveAndPublish}
                disabled={saving !== null || !hydrated}
                className="inline-flex items-center gap-2 bg-[#0B192C] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#152a40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving === "publish" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {saving === "publish" ? "Publishing..." : "Save & Publish"}
                </span>
                <span className="sm:hidden">
                  {saving === "publish" ? "..." : "Publish"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CreateSurvey;
