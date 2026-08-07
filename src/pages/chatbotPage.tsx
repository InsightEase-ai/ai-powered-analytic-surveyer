import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
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
  const allSurveys = useQuery(api.surveys.listSurveys) ?? [];
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("");

  useEffect(() => {
    if (allSurveys.length > 0 && !selectedSurveyId) {
      setSelectedSurveyId(allSurveys[0]._id);
    }
  }, [allSurveys, selectedSurveyId]);

  const activeSurvey = allSurveys.find((s) => s._id === selectedSurveyId);
  const surveyTitle = activeSurvey?.title || "Customer Satisfaction Survey";

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

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input.trim();
    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate text-only AI insight response tailored to survey data
    setTimeout(() => {
      let botResponse = "";
      const lower = userMsgText.toLowerCase();

      if (lower.includes("nps") || lower.includes("satisfaction") || lower.includes("score")) {
        botResponse = `Based on current survey records for "${surveyTitle}", the overall satisfaction rate remains positive at 87%. Over 58% of respondents are Promoters, highlighting high satisfaction with recent performance stability.`;
      } else if (lower.includes("churn") || lower.includes("risk") || lower.includes("drop")) {
        botResponse = `Key factors impacting satisfaction stem from mentions of "slow loading times" and mobile responsive layout friction. Addressing these two friction points could reduce churn risk by up to 18%.`;
      } else if (lower.includes("keyword") || lower.includes("feedback") || lower.includes("trend")) {
        botResponse = `The top recurring positive keywords in open feedback are "intuitive UI", "fast responses", and "helpful insights". The main area identified for improvement is report customization.`;
      } else if (lower.includes("predict") || lower.includes("next month")) {
        botResponse = `Predictive analysis projects a 12% to 15% increase in total response submissions next month if current engagement reminders are maintained.`;
      } else {
        botResponse = `Analyzing feedback for "${surveyTitle}": Data shows steady user engagement across mid-week submissions, with data analysts and product managers representing over 60% of completed responses. Let me know if you would like specific metrics or qualitative explanations.`;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 900);
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
                <option value="">Customer Satisfaction Survey</option>
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
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-xl space-y-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0B192C] text-white rounded-tr-none shadow-sm"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-gray-400 px-1">{msg.timestamp}</p>
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
          <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0">
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
