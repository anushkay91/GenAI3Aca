import { LayoutDashboard, BookOpenText, BarChart3, Folder, User, Settings } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Entries', icon: BookOpenText },
  { name: 'Insights', icon: BarChart3 },
  { name: 'Categories', icon: Folder },
  { name: 'Profile', icon: User },
  { name: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) {
  return (
    <div className="w-64 bg-neutral-950 text-neutral-400 p-6 h-screen flex flex-col justify-between">
      <div>
        <div className="text-white font-bold text-xl mb-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
            Reflect
        </div>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activePage === item.name ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
