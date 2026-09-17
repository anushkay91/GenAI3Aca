import React from "react";
import {
  LayoutDashboard,
  BookOpenText,
  BarChart3,
  Folder,
  User as UserIcon,
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut, User } from "firebase/auth";

interface SidebarProps {
  activePage: string;
  setActivePage: (p: string) => void;
  user: User;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Entries", icon: BookOpenText },
  { name: "Insights", icon: BarChart3 },
  { name: "Categories", icon: Folder },
  { name: "Profile", icon: UserIcon },
  { name: "Settings", icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  user,
  isOpenMobile,
  onCloseMobile,
}) => {
  const handleNavClick = (pageName: string) => {
    setActivePage(pageName);
    onCloseMobile();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const content = (
    <div className="h-full flex flex-col justify-between p-6 bg-neutral-900 text-neutral-300 border-r border-neutral-800">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-8 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight block leading-tight">
                ReflectJournal
              </span>
              <span className="text-[11px] font-medium text-neutral-400 block">
                Private AI Companion
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Landmark */}
        <nav aria-label="Main Navigation" className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activePage === item.name;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleNavClick(item.name)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-medium text-sm transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive
                    ? "bg-amber-600 text-white font-semibold shadow-xs"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Sign Out */}
      <div className="pt-6 border-t border-neutral-800">
        <div className="mb-3 px-1">
          <p className="text-xs text-neutral-400 truncate">Signed in as</p>
          <p className="text-xs font-semibold text-white truncate" title={user.email || ""}>
            {user.email || user.displayName || "Authenticated User"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop and Aside */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/70 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        >
          <aside
            className="w-72 h-full bg-neutral-900 shadow-2xl relative animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
