import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050816] text-white">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full
          transform transition-transform duration-300
          md:translate-x-0 md:static md:flex
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center p-4 border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)}>
            <FiMenu size={26} />
          </button>

          <h1 className="ml-4 font-bold text-xl">StudentGPT</h1>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}