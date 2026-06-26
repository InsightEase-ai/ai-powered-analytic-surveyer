import { NavLink } from "react-router";
import { Bell } from "lucide-react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/survey", label: "Create Survey" },
  { to: "/analytics", label: "Analytics" },
  { to: "/insights", label: "Insights" },
  { to: "/report", label: "Reports" },
  { to: "/chatbot", label: "Chatbot" },
];

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-[auto_1fr_auto] items-center h-16 gap-6">
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
                    ? "text-[#0B192C] font-semibold underline underline-offset-8 decoration-[#0B192C] decoration-2"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <button type="button" className="p-1.5 text-gray-500 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8BB1D4] to-[#0B192C]" />
        </div>
      </div>
    </header>
  );
}

export default Header;
