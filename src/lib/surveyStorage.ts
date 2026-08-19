export type SurveyQuestionType =
  | "multiple_choice"
  | "rating"
  | "long_text"
  | "dropdown"
  | "date"
  | "page_break";

export type SurveyQuestion = {
  id: string;
  type: SurveyQuestionType;
  title: string;
  options?: string[];
  ratingMax?: number;
  suggestion?: string;
  /** When true (default), respondents must answer before continuing. */
  required?: boolean;
};

/** Treat missing `required` as true for older saved surveys. */
export function isQuestionRequired(question: SurveyQuestion): boolean {
  return question.required !== false;
}

export type SurveyStatus = "draft" | "published" | "closed";

export type StoredSurvey = {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  status: SurveyStatus;
  /** Public URL slug, set when published */
  publicSlug?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
};

export type SurveyResponse = {
  id: string;
  surveyId: string;
  answers: Record<string, string | number>;
  submittedAt: string;
};

const STORAGE_KEY = "insightease.surveys";
const RESPONSES_KEY = "insightease.surveyResponses";
const ACTIVE_SURVEY_KEY = "insightease.activeSurveyId";

function readAll(): StoredSurvey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSurvey[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(surveys: StoredSurvey[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
}

function readResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SurveyResponse[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResponses(responses: SurveyResponse[]) {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
}

export function getSurveys(): StoredSurvey[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getPublishedSurveys(): StoredSurvey[] {
  return getSurveys().filter((s) => s.status === "published");
}

export function getDraftSurveys(): StoredSurvey[] {
  return getSurveys().filter((s) => s.status === "draft");
}

export function deleteSurvey(id: string): boolean {
  const all = readAll();
  const next = all.filter((s) => s.id !== id);
  if (next.length === all.length) return false;
  writeAll(next);

  const responses = readResponses().filter((r) => r.surveyId !== id);
  writeResponses(responses);

  if (getActiveSurveyId() === id) {
    setActiveSurveyId(null);
  }
  return true;
}

export function getSurvey(id: string): StoredSurvey | null {
  return readAll().find((s) => s.id === id) ?? null;
}

/** Resolve by public slug for respondent links (open or closed). */
export function getSurveyBySlug(slug: string): StoredSurvey | null {
  return (
    readAll().find(
      (s) =>
        s.publicSlug === slug &&
        (s.status === "published" || s.status === "closed"),
    ) ?? null
  );
}

export function isSurveyOpen(survey: StoredSurvey): boolean {
  return survey.status === "published";
}

export function isSurveyClosed(survey: StoredSurvey): boolean {
  return survey.status === "closed";
}

export function getActiveSurveyId(): string | null {
  return localStorage.getItem(ACTIVE_SURVEY_KEY);
}

export function setActiveSurveyId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_SURVEY_KEY, id);
  else localStorage.removeItem(ACTIVE_SURVEY_KEY);
}

export function createSurveyId() {
  return `survey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "survey";
}

export function createPublicSlug(title: string, existing?: string[]): string {
  const taken = new Set(existing ?? readAll().map((s) => s.publicSlug).filter(Boolean));
  const suffix = Math.random().toString(36).slice(2, 7);
  let slug = `${slugifyTitle(title)}-${suffix}`;
  while (taken.has(slug)) {
    slug = `${slugifyTitle(title)}-${Math.random().toString(36).slice(2, 7)}`;
  }
  return slug;
}

export function getPublicSurveyPath(slug: string) {
  return `/survey/${slug}`;
}

export function getPublicSurveyUrl(slug: string) {
  if (typeof window === "undefined") return getPublicSurveyPath(slug);
  return `${window.location.origin}${getPublicSurveyPath(slug)}`;
}

export function upsertSurvey(
  survey: Omit<
    StoredSurvey,
    "createdAt" | "updatedAt" | "publishedAt" | "publicSlug" | "closedAt"
  > & {
    createdAt?: string;
    publishedAt?: string;
    publicSlug?: string;
    closedAt?: string;
  },
): StoredSurvey {
  const now = new Date().toISOString();
  const all = readAll();
  const existing = all.find((s) => s.id === survey.id);

  let publicSlug = existing?.publicSlug ?? survey.publicSlug;
  if (
    (survey.status === "published" || survey.status === "closed") &&
    !publicSlug
  ) {
    publicSlug = createPublicSlug(survey.title);
  }

  const next: StoredSurvey = {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    questions: survey.questions,
    status: survey.status,
    publicSlug,
    createdAt: existing?.createdAt ?? survey.createdAt ?? now,
    updatedAt: now,
    publishedAt:
      survey.status === "published" || survey.status === "closed"
        ? (existing?.publishedAt ?? survey.publishedAt ?? now)
        : existing?.publishedAt,
    closedAt:
      survey.status === "closed"
        ? (survey.closedAt ?? now)
        : survey.status === "published"
          ? undefined
          : existing?.closedAt,
  };

  const index = all.findIndex((s) => s.id === survey.id);
  if (index >= 0) all[index] = next;
  else all.push(next);

  writeAll(all);
  setActiveSurveyId(next.id);
  return next;
}

export function closeSurvey(id: string): StoredSurvey | null {
  const existing = getSurvey(id);
  if (!existing) return null;
  if (existing.status !== "published" && existing.status !== "closed") {
    return existing;
  }
  return upsertSurvey({
    ...existing,
    status: "closed",
    closedAt: new Date().toISOString(),
  });
}

export function reopenSurvey(id: string): StoredSurvey | null {
  const existing = getSurvey(id);
  if (!existing) return null;
  if (existing.status !== "closed") return existing;
  return upsertSurvey({
    ...existing,
    status: "published",
    closedAt: undefined,
  });
}

export function getResponsesForSurvey(surveyId: string): SurveyResponse[] {
  return readResponses()
    .filter((r) => r.surveyId === surveyId)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
}

export function getResponseCount(surveyId: string): number {
  return readResponses().filter((r) => r.surveyId === surveyId).length;
}

export function submitSurveyResponse(
  surveyId: string,
  answers: Record<string, string | number>,
): SurveyResponse {
  const response: SurveyResponse = {
    id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    surveyId,
    answers,
    submittedAt: new Date().toISOString(),
  };
  const all = readResponses();
  all.push(response);
  writeResponses(all);
  return response;
}
