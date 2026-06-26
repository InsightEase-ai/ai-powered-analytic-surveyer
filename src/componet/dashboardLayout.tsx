import type { ReactNode } from "react";
import Header from "./header";
import Footer from "./footer";

type DashboardLayoutProps = {
  children: ReactNode;
};

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] font-sans text-sm">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">{children}</main>
      <footer className="w-full bg-white border-t border-gray-200 mt-2">
        <div className="max-w-7xl mx-auto px-6">
          <Footer />
        </div>
      </footer>
    </div>
  );
}

export default DashboardLayout;
