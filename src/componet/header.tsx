import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Bell, ChevronDown, FileText, Trash2 } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/survey", label: "Create Survey" },
  { to: "/analytics", label: "Analytics" },
  { to: "/chatbot", label: "Chatbot" },
];

function statusLabel(status: "draft" | "published" | "closed") {
  switch (status) {
    case "published":
      return "Open";
    case "closed":
      return "Complete";
    default:
      return "Draft";
  }
}

function statusClass(status: "draft" | "published" | "closed") {
  switch (status) {
    case "published":
      return "bg-teal-50 text-teal-700";
    case "closed":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const surveys = useQuery(api.surveys.listSurveys) ?? [];
  const deleteSurveyMutation = useMutation(api.surveys.deleteSurvey);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function handleOpen(survey: {
    _id: Id<"surveys">;
    status: "draft" | "published" | "closed";
  }) {
    setMenuOpen(false);
    if (survey.status === "draft") {
      navigate(`/survey?id=${survey._id}`);
    } else {
      navigate(`/surveys/${survey._id}`);
    }
  }

  async function handleDelete(id: Id<"surveys">, title: string) {
    const confirmed = window.confirm(
      `Delete "${title || "Untitled Survey"}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await deleteSurveyMutation({ id });
    } catch {
      window.alert("Could not delete this survey. Please try again.");
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4 sm:gap-6">
        <NavLink to="/dashboard" className="font-bold text-base text-[#0B192C]">
          InsightEase
        </NavLink>

        <nav className="hidden lg:flex items-center justify-center gap-7">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `text-sm whitespace-nowrap ${
                  isActive
                    ? "text-[#0B192C] font-semibold underline underline-offset-8 decoration-teal-500 decoration-2"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`inline-flex items-center gap-1 text-sm whitespace-nowrap ${
                menuOpen
                  ? "text-[#0B192C] font-semibold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              Drafts
              {surveys.length > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                  {surveys.length}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <SurveyMenu
                surveys={surveys}
                onClose={() => setMenuOpen(false)}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            )}
          </div>
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div className="lg:hidden">
            <MobileSurveysMenu
              surveys={surveys}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          </div>
          <button
            type="button"
            className="p-1.5 text-gray-500 hover:text-gray-900"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8BB1D4] to-[#0B192C]" />
        </div>
      </div>
    </header>
  );
}

type HeaderSurvey = {
  _id: Id<"surveys">;
  title: string;
  status: "draft" | "published" | "closed";
  updatedAt: number;
};

function SurveyMenu({
  surveys,
  onClose,
  onOpen,
  onDelete,
  align = "center",
}: {
  surveys: HeaderSurvey[];
  onClose: () => void;
  onOpen: (survey: HeaderSurvey) => void;
  onDelete: (id: Id<"surveys">, title: string) => void;
  align?: "center" | "right";
}) {
  return (
    <div
      role="menu"
      className={`absolute mt-3 w-[360px] max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden ${
        align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
      }`}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400">
          RECENT SURVEYS
        </p>
        <Link
          to="/survey"
          onClick={onClose}
          className="text-xs font-medium text-teal-600 hover:text-teal-700"
        >
          New
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No surveys yet</p>
          <Link
            to="/survey"
            onClick={onClose}
            className="inline-block mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
          >
            Create a survey
          </Link>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {surveys.map((survey) => (
            <li
              key={survey._id}
              className="px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => onOpen(survey)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {survey.title || "Untitled Survey"}
                  </p>
                  <span
                    className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${statusClass(survey.status)}`}
                  >
                    {statusLabel(survey.status)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Updated {new Date(survey.updatedAt).toLocaleDateString()}
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDelete(survey._id, survey.title || "Untitled Survey")
                }
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                aria-label={`Delete ${survey.title || "survey"}`}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileSurveysMenu({
  surveys,
  onOpen,
  onDelete,
}: {
  surveys: HeaderSurvey[];
  onOpen: (survey: HeaderSurvey) => void;
  onDelete: (id: Id<"surveys">, title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
        aria-expanded={open}
      >
        <FileText className="w-4 h-4" />
        Drafts
        {surveys.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center">
            {surveys.length}
          </span>
        )}
      </button>

      {open && (
        <div className="z-50">
          <SurveyMenu
            surveys={surveys}
            align="right"
            onClose={() => setOpen(false)}
            onOpen={(survey) => {
              setOpen(false);
              onOpen(survey);
            }}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}

export default Header;
