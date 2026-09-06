/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import JournalTimeline from './components/JournalTimeline';
import Insights from './components/Insights';
import Categories from './components/Categories';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('Dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Auth />;

  return (
    <div className="flex bg-neutral-950 min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-8 text-white">
         {activePage === 'Dashboard' && <Dashboard user={user} />}
         {activePage === 'Entries' && <JournalTimeline user={user} />}
         {activePage === 'Insights' && <Insights />}
         {activePage === 'Categories' && <Categories />}
         {activePage === 'Profile' && <Profile />}
         {activePage === 'Settings' && <Settings />}
      </main>
    </div>
  );
}
