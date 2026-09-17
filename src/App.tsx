import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import JournalTimeline from "./components/JournalTimeline";
import Insights from "./components/Insights";
import Categories from "./components/Categories";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import { JournalProvider } from "./context/JournalContext";
import { Menu, Sparkles } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 text-neutral-700">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Securing session...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <JournalProvider user={user}>
      <div className="flex bg-neutral-100 min-h-screen text-neutral-900">
        {/* Responsive Sidebar (Desktop aside + Mobile drawer) */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Header */}
          <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <span className="text-base tracking-tight">ReflectJournal</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
            {activePage === "Dashboard" && <Dashboard user={user} />}
            {activePage === "Entries" && <JournalTimeline />}
            {activePage === "Insights" && <Insights />}
            {activePage === "Categories" && <Categories />}
            {activePage === "Profile" && <Profile user={user} />}
            {activePage === "Settings" && <Settings />}
          </main>
        </div>
      </div>
    </JournalProvider>
  );
}
