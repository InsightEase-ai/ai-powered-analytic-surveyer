import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "../componet/header";
import { Send, Bot, User, Sparkles, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function ChatbotPage() {
  const surveysResult = useQuery(api.surveys.listSurveys);

  const allSurveys = useMemo(() => surveysResult ?? [], [surveysResult]);

  const askGemini = useAction(api.chatbot.askGemini);

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");

  useEffect(() => {
    if (allSurveys.length > 0 && !selectedSurveyId) {
      setSelectedSurveyId(allSurveys[0]._id);
    }
  }, [allSurveys, selectedSurveyId]);

  const activeSurvey = allSurveys.find((s) => s._id === selectedSurveyId);

  const responsesResult = useQuery(
    api.surveys.getResponsesForSurvey,
    activeSurvey ? { surveyId: activeSurvey._id } : "skip",
  );
  const realResponses = useMemo(() => responsesResult ?? [], [responsesResult]);

  const surveyContext = useMemo(() => {
    if (!activeSurvey) return undefined;

    const realQuestions = activeSurvey.questions.filter(
      (q) => q.type !== "page_break",
    );
    const totalResponses = realResponses.length;

    const questionSummaries = realQuestions.map((q) => {
      const answered = realResponses.filter(
        (r) => r.answers[q.id] !== undefined && r.answers[q.id] !== "",
      );

      if (answered.length === 0) {
        return `- "${q.title}" (${q.type}): no responses yet.`;
      }

      if (
        q.type === "multiple_choice" ||
        q.type === "dropdown" ||
        q.type === "rating"
      ) {
        const counts: Record<string, number> = {};
        answered.forEach((r) => {
          const val = String(r.answers[q.id]);
          counts[val] = (counts[val] || 0) + 1;
        });
        const breakdown = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .map(([option, count]) => `${option}: ${count}`)
          .join(", ");
        return `- "${q.title}" (${q.type}, ${answered.length} answers): ${breakdown}.`;
      }

      // long_text (open-ended) — include actual respondent answers
      const sampleAnswers = answered
        .slice(0, 20)
        .map((r) => `"${String(r.answers[q.id]).trim()}"`)
        .join("; ");
      return `- "${q.title}" (${q.type}, ${answered.length} answers): ${sampleAnswers}`;
    });

    return `Survey title: "${activeSurvey.title}". Description: "${activeSurvey.description || "none"}". Status: ${activeSurvey.status}. Total responses: ${totalResponses}.\n\nQuestion breakdown:\n${questionSummaries.join("\n")}`;
  }, [activeSurvey, realResponses]);

  const surveyTitle = activeSurvey?.title ?? "No survey selected";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: `Hello! I am your AI Data Sherpa. I am here to help you analyze, explain insights, and answer questions about "${surveyTitle}". Ask me anything about your survey feedback or response trends!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input.trim();
    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await askGemini({ message: userMsgText, surveyContext });
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        sender: "bot",
        text: "Sorry, I couldn't get a response right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedQuestions = [
    "What are the main drivers of customer satisfaction?",
    "Summarize top open-ended feedback trends",
    "Identify key churn risk factors and drop-offs",
  ];

  return (
    <div className="h-dvh bg-[#F4F6F8] font-sans text-sm flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col min-h-0">
        {/* Top Active Survey Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-gray-400 uppercase">
              Active Survey Analysis
            </p>
            <h1 className="text-base font-bold text-gray-900 mt-0.5">
              {surveyTitle}
            </h1>
          </div>

          <div className="relative inline-block w-full sm:w-72">
            <select
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              {allSurveys.length > 0 ? (
                allSurveys.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))
              ) : (
                <option value="">No surveys yet</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Chat Area Container - Fixed height with flex-1 */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
          {/* Header Banner */}
          <div className="bg-[#0B192C] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight flex items-center gap-2">
                  Sherpa AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  Text-only analytical explanations & survey answers
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Text Insight Mode
            </div>
          </div>

          {/* Messages Stream - ONLY THIS AREA SCROLLS */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-gray-50/50 to-white min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-[#0B192C] text-white"
                      : "bg-teal-50 text-teal-600 border border-teal-100"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`max-w-xl space-y-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0B192C] text-white rounded-tr-none shadow-sm"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-gray-400 px-1">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt Chips */}
          <div className="px-6 py-2.5 bg-gray-50/70 border-t border-gray-100 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
              Suggestions:
            </span>
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setInput(q);
                }}
                className="text-xs bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-teal-300 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Pure Text Input Controls */}
          <form
            onSubmit={handleSend}
            className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your survey feedback or insights..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-[#0B192C] text-white p-2.5 rounded-xl hover:bg-[#152a40] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-2 shrink-0">
          Sherpa AI provides text explanations based on survey response data.
        </p>
      </main>
    </div>
  );
}
