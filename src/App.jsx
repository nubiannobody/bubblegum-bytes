import React, { useState, useEffect, createContext, useContext } from 'react';
import { Calendar, Star, Sparkles, Save, Edit3, X, ChevronLeft, ChevronRight, Filter, LogIn, LogOut, Copy, Check } from 'lucide-react';

// ---------- Sync helpers ----------
const SYNC_API = '/.netlify/functions/sync';

function generateSyncCode() {
  const words = ['sparkle', 'bubble', 'pixie', 'glimmer', 'dream', 'magic', 'stardust', 'glow', 'petal', 'confetti'];
  const word = words[Math.floor(Math.random() * words.length)];
  const rand = Math.random().toString(36).slice(2, 7);
  return `bgb-${word}-${rand}`;
}

async function fetchRemoteEntries(code) {
  const res = await fetch(`${SYNC_API}?code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Failed to fetch entries for that sync code');
  const data = await res.json();
  return data.entries || {};
}

async function pushRemoteEntries(code, entries) {
  const res = await fetch(SYNC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, entries }),
  });
  if (!res.ok) throw new Error('Failed to save entries');
  return res.json();
}

// ---------- Auth Context ----------
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [syncCode, setSyncCode] = useState(null);
  const [newSyncCode, setNewSyncCode] = useState(null); // shown once, right after first-ever login on a device

  // Check for existing login on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('bubblegumbytes_user');
    const savedCode = localStorage.getItem('bubblegumbytes_synccode');
    if (savedUser && savedCode) {
      setCurrentUser(savedUser);
      setSyncCode(savedCode);
      setLoggedIn(true);
    }
  }, []);

  // Normal username/password login.
  // If this device has never had a sync code, mint one, migrate any legacy
  // per-username local entries into it, and surface it once in a modal.
  const loginWithPassword = async (username) => {
    let code = localStorage.getItem('bubblegumbytes_synccode');
    let isNewCode = false;

    if (!code) {
      code = generateSyncCode();
      isNewCode = true;

      const legacy = localStorage.getItem(`bubblegumbytes_entries_${username}`);
      if (legacy) {
        try {
          await pushRemoteEntries(code, JSON.parse(legacy));
        } catch (err) {
          console.error('Could not migrate legacy entries:', err);
        }
      }
    }

    localStorage.setItem('bubblegumbytes_user', username);
    localStorage.setItem('bubblegumbytes_synccode', code);
    setCurrentUser(username);
    setSyncCode(code);
    setLoggedIn(true);
    if (isNewCode) setNewSyncCode(code);
  };

  // New-device login via an existing sync code.
  const loginWithSyncCode = async (code, username) => {
    localStorage.setItem('bubblegumbytes_user', username);
    localStorage.setItem('bubblegumbytes_synccode', code);
    setCurrentUser(username);
    setSyncCode(code);
    setLoggedIn(true);
  };

  const logout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    setSyncCode(null);
    localStorage.removeItem('bubblegumbytes_user');
    // Sync code stays saved on this device so logging back in here
    // never asks for it again.
  };

  const dismissNewSyncCode = () => setNewSyncCode(null);

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        currentUser,
        syncCode,
        newSyncCode,
        loginWithPassword,
        loginWithSyncCode,
        logout,
        dismissNewSyncCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------- New Sync Code Modal ----------
function NewSyncCodeModal() {
  const { newSyncCode, dismissNewSyncCode } = useContext(AuthContext);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!newSyncCode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newSyncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select/copy manually
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-md w-full p-8 shadow-2xl border-2 border-pink-200">
        <div className="text-center mb-4">
          <Sparkles className="mx-auto text-pink-500 mb-2" size={28} />
          <h3 className="text-xl font-bold text-purple-800">Your Sync Code ✨</h3>
          <p className="text-purple-600 text-sm mt-2">
            Save this code! It's how you'll find your journal on other devices — like your phone or a friend's laptop.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl px-4 py-3 mb-4">
          <code className="flex-1 text-purple-800 font-bold text-lg tracking-wide">{newSyncCode}</code>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full bg-white hover:bg-pink-100 border border-pink-200 transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-purple-600" />}
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 mb-4">
          <p className="text-purple-600 text-xs">
            There's no email or password reset tied to this — if you lose the code, that journal can't be recovered. Screenshot it or write it down somewhere safe.
          </p>
        </div>

        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 accent-pink-500"
          />
          <span className="text-sm text-purple-700">I've saved my sync code</span>
        </label>

        <button
          onClick={dismissNewSyncCode}
          disabled={!confirmed}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          Continue to My Journal ✨
        </button>
      </div>
    </div>
  );
}

// SignIn Component
function SignIn() {
  const [mode, setMode] = useState('password'); // 'password' | 'synccode'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [syncUsername, setSyncUsername] = useState('');
  const [syncError, setSyncError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { loginWithPassword, loginWithSyncCode } = useContext(AuthContext);

  const handleLogin = () => {
    if (username && password) {
      setShowConfetti(true);
      setTimeout(async () => {
        setShowConfetti(false);
        await loginWithPassword(username);
      }, 1500);
    } else {
      alert('Please enter both username and password');
    }
  };

  const handleSyncLogin = async () => {
    if (!syncCodeInput.trim() || !syncUsername.trim()) {
      setSyncError('Enter your sync code and a username to continue.');
      return;
    }
    setSyncing(true);
    setSyncError('');
    try {
      await fetchRemoteEntries(syncCodeInput.trim()); // validates the code resolves
      await loginWithSyncCode(syncCodeInput.trim(), syncUsername.trim());
    } catch (err) {
      console.error(err);
      setSyncError("Couldn't find a journal with that code. Double-check it and try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fallDown {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fall {
          animation: fallDown 2s linear forwards;
        }

        .animated-bg {
          background: linear-gradient(
            270deg,
            #fbcfe8, #e9d5ff, #d1fae5, #fef9c3, #fde68a, #c7d2fe,
            #fcd5ce, #d8f3dc, #ffcfd2, #ffe5d9, #f0efeb, #bcd4e6,
            #f6e1f5, #e0f7fa, #fff3e0, #e6f4ea, #f4e2d8, #e3f2fd,
            #ede7f6, #f9fbe7
          );
          background-size: 4000% 4000%;
          animation: gradientShift 45s ease infinite;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden animated-bg">
        {/* Background emojis */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(80)].map((_, i) => {
            const emojis = ['💜', '🩵', '🥳', '💖', '🌸', '🍬', '🦋', '🧡', '💛', '☺️', '🦄', '💚', '🫧', '🍭'];
            return (
              <div
                key={i}
                className="absolute text-2xl opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 4}s`,
                }}
              >
                {emojis[Math.floor(Math.random() * emojis.length)]}
              </div>
            );
          })}
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-50px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {['🥳', '🎉', '🩵', '🎊', '✨', '💖'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        )}

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="absolute text-pink-300 animate-ping"
                    size={16}
                    style={{
                      left: `${45 + Math.random() * 10}%`,
                      top: `${30 + Math.random() * 40}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold relative mb-4">
                <span 
                  className="relative z-10 bg-gradient-to-r from-pink-500 via-orange-500 to-purple-600 bg-clip-text text-transparent"
                  style={{
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    letterSpacing: '0.15em',
                    fontWeight: '900',
                    filter: 'drop-shadow(0px 0px 15px rgba(236, 72, 153, 0.8))',
                  }}
                >
                  BubblegumBytes
                </span>
              </h1>
              <p className="text-purple-600 text-lg font-medium">Your magical digital diary ✨</p>
              <p className="text-purple-500 text-sm mt-2">
                {mode === 'password' ? 'Enter your sparkly credentials to continue!' : 'Sync your journal onto this device!'}
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200">
              {mode === 'password' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-purple-700 font-semibold mb-2">
                      Username ✨
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your magical username..."
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-500 text-purple-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-700 font-semibold mb-2">
                      Password 🔐
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your secret sparkle key..."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleLogin()}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-500 text-purple-800 font-medium"
                    />
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50"
                    disabled={showConfetti}
                  >
                    <LogIn className="inline mr-2" size={20} />
                    {showConfetti ? 'Logging you in...' : 'Enter Your Magical World ✨'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('synccode'); setSyncError(''); }}
                    className="w-full text-center text-purple-500 text-sm font-medium hover:text-purple-700 transition-colors underline underline-offset-2"
                  >
                    Already have a journal? Enter your sync code
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-purple-700 font-semibold mb-2">
                      Sync Code 🔗
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. bgb-sparkle-a1b2c"
                      value={syncCodeInput}
                      onChange={e => setSyncCodeInput(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-500 text-purple-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-700 font-semibold mb-2">
                      Username ✨
                    </label>
                    <input
                      type="text"
                      placeholder="What should we call you on this device?"
                      value={syncUsername}
                      onChange={e => setSyncUsername(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSyncLogin()}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-500 text-purple-800 font-medium"
                    />
                  </div>

                  {syncError && (
                    <p className="text-red-500 text-sm font-medium text-center">{syncError}</p>
                  )}

                  <button
                    onClick={handleSyncLogin}
                    disabled={syncing}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50"
                  >
                    <LogIn className="inline mr-2" size={20} />
                    {syncing ? 'Finding your journal...' : 'Sync My Journal ✨'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('password'); setSyncError(''); }}
                    className="w-full text-center text-purple-500 text-sm font-medium hover:text-purple-700 transition-colors underline underline-offset-2"
                  >
                    Back to username & password
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border border-purple-200">
                <p className="text-center text-purple-700 text-sm">
                  <span className="font-semibold">Welcome back, beautiful soul! 💖</span>
                  <br />
                  Ready to capture today's magical moments?
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-purple-500 text-sm">
                Made with 💖 and lots of ✨ sparkles
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main BubblegumBytes Component
function BubblegumBytes() {
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState({});
  const [selectedMood, setSelectedMood] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentView, setCurrentView] = useState('landing');
  const [showEntryViewer, setShowEntryViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [moodFilter, setMoodFilter] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | loading | saving | error
  const [savedEntryDate, setSavedEntryDate] = useState(null); // which entry to reference on the "Entry Saved" screen

  const { logout, currentUser, syncCode } = useContext(AuthContext);

  const affirmations = [
    "You are absolutely magical! ✨",
    "Your vibe attracts your tribe! 💕",
    "Today is full of beautiful possibilities! 🌸",
    "You're sparkling from the inside out! ⭐",
    "Your dreams are totally achievable! 🦄",
    "You bring joy wherever you go! 🌈",
    "You're worthy of all good things! 💖"
  ];

  const [dailyAffirmation] = useState(affirmations[Math.floor(Math.random() * affirmations.length)]);

  const moodSendOffs = {
    Happy: "Your joy is safely tucked away ✨ Carry a little of it with you today!",
    Excited: "That excitement is written in the stars now 🌟 Go chase what lights you up!",
    Peaceful: "That peace is safely kept 🌙 Have a gentle rest of your day.",
    Grateful: "That gratitude is written in the stars now 🌙 Have a gentle rest of your day.",
    Sleepy: "Rest easy — your thoughts are safe and sound. Sweet dreams later ✨",
    Frustrated: "You let it out, and that matters. Be kind to yourself for the rest of today 💜",
    Thoughtful: "Your reflections are safely kept ✨ Carry that clarity with you.",
  };

  const getSendOffMessage = (mood) => moodSendOffs[mood] || "Your thoughts are safe. Go be magical. ✨";

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'bg-pink-200' },
    { emoji: '😍', label: 'Excited', color: 'bg-purple-200' },
    { emoji: '😌', label: 'Peaceful', color: 'bg-blue-200' },
    { emoji: '🥰', label: 'Grateful', color: 'bg-green-200' },
    { emoji: '😴', label: 'Sleepy', color: 'bg-indigo-200' },
    { emoji: '😤', label: 'Frustrated', color: 'bg-red-200' },
    { emoji: '🤔', label: 'Thoughtful', color: 'bg-yellow-200' }
  ];

  // On login: show a local cache instantly (snappy reload), then reconcile
  // with the source of truth from the backend.
  useEffect(() => {
    if (!syncCode) return;

    const cached = localStorage.getItem(`bubblegumbytes_entries_${syncCode}`);
    if (cached) {
      try {
        setEntries(JSON.parse(cached));
      } catch (error) {
        console.error('Error loading cached entries:', error);
      }
    }

    setSyncStatus('loading');
    fetchRemoteEntries(syncCode)
      .then((remote) => {
        setEntries(remote);
        localStorage.setItem(`bubblegumbytes_entries_${syncCode}`, JSON.stringify(remote));
        setSyncStatus('idle');
      })
      .catch((err) => {
        console.error('Error fetching remote entries:', err);
        setSyncStatus('error');
      });
  }, [syncCode]);

  // Save entries locally (instant) and push to the backend (cross-device) on change.
  useEffect(() => {
    if (!syncCode || Object.keys(entries).length === 0) return;

    localStorage.setItem(`bubblegumbytes_entries_${syncCode}`, JSON.stringify(entries));

    setSyncStatus('saving');
    pushRemoteEntries(syncCode, entries)
      .then(() => setSyncStatus('idle'))
      .catch((err) => {
        console.error('Error saving entries remotely:', err);
        setSyncStatus('error');
      });
  }, [entries, syncCode]);

  const getFilteredEntries = () => {
    const entriesArray = Object.values(entries)
      .filter(entry => entry.text || entry.mood)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (moodFilter) {
      return entriesArray.filter(entry => entry.mood === moodFilter);
    }
    return entriesArray;
  };

  const filteredEntries = getFilteredEntries();

  // Note: entries are only ever loaded into the Write form via an explicit
  // action (editEntry, handleDateChange, createEntryForDate) — never just
  // because selectedDate happens to match an existing entry. That's what
  // keeps "Create New Entry" a true blank slate.

  const saveEntry = () => {
    if (currentEntry.trim() || selectedMood) {
      const newEntry = {
        text: currentEntry,
        mood: selectedMood,
        date: selectedDate,
        user: currentUser
      };

      setEntries(prev => ({
        ...prev,
        [selectedDate]: newEntry
      }));

      setSavedEntryDate(selectedDate);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setCurrentView('saved');
    }
  };

  const startNewEntry = () => {
    setCurrentEntry('');
    setSelectedMood('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCurrentView('write');
  };

  // Explicit date change within the Write form (e.g. via the date picker) —
  // this is an intentional "load this day" action, so it's okay to pull in
  // whatever's already saved there.
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const entry = entries[newDate];
    setCurrentEntry(entry?.text || '');
    setSelectedMood(entry?.mood || '');
  };

  // Explicit "Edit Entry" action from the Calendar screen.
  const editEntry = (date) => {
    const entry = entries[date];
    setSelectedDate(date);
    setCurrentEntry(entry?.text || '');
    setSelectedMood(entry?.mood || '');
    setCurrentView('write');
  };

  // Explicit "Create Entry" action from the Calendar screen — blank slate
  // for that specific date.
  const createEntryForDate = (date) => {
    setSelectedDate(date);
    setCurrentEntry('');
    setSelectedMood('');
    setCurrentView('write');
  };

  const openEntryViewer = (entryDate = null) => {
    const entries = getFilteredEntries();
    if (entries.length === 0) return;
    
    if (entryDate) {
      const index = entries.findIndex(entry => entry.date === entryDate);
      setViewerIndex(index >= 0 ? index : 0);
    } else {
      setViewerIndex(0);
    }
    setShowEntryViewer(true);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateStr,
        hasEntry: entries[dateStr] && (entries[dateStr].text || entries[dateStr].mood)
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[new Date().getMonth()];

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fallDown {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fall {
          animation: fallDown 2s linear forwards;
        }

        .animated-bg {
          background: linear-gradient(
            270deg,
            #fbcfe8, #e9d5ff, #d1fae5, #fef9c3, #fde68a, #c7d2fe,
            #fcd5ce, #d8f3dc, #ffcfd2, #ffe5d9, #f0efeb, #bcd4e6,
            #f6e1f5, #e0f7fa, #fff3e0, #e6f4ea, #f4e2d8, #e3f2fd,
            #ede7f6, #f9fbe7
          );
          background-size: 4000% 4000%;
          animation: gradientShift 45s ease infinite;
        }
      `}</style>

<div className="min-h-screen relative overflow-hidden animated-bg">
        {/* Background emojis */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(100)].map((_, i) => {
            const emojis = ['💜', '🩵', '🥳', '💖', '🌸', '🍬', '🦋', '🧡', '💛', '☺️', '🦄', '💚', '🫧', '🍭'];
            return (
              <div
                key={i}
                className="absolute text-2xl opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 4}s`,
                }}
              >
                {emojis[Math.floor(Math.random() * emojis.length)]}
              </div>
            );
          })}
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-50px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {['🥳', '🎉', '🩵', '🎊'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        )}

        {/* Entry Viewer Modal */}
        {showEntryViewer && filteredEntries.length > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border-2 border-pink-200">
              <div className="flex justify-between items-center p-6 border-b border-pink-200 bg-gradient-to-r from-pink-100 to-purple-100">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-bold text-purple-800">Entry Viewer</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-purple-600" />
                    <select
                      value={moodFilter}
                      onChange={(e) => setMoodFilter(e.target.value)}
                      className="px-3 py-1 rounded-full border border-pink-300 text-sm bg-white/80"
                    >
                      <option value="">All Moods</option>
                      {moods.map(mood => (
                        <option key={mood.label} value={mood.label}>
                          {mood.emoji} {mood.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowEntryViewer(false)}
                  className="p-2 hover:bg-pink-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-purple-600" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                {filteredEntries[viewerIndex] && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-purple-800">
                        {new Date(filteredEntries[viewerIndex].date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      {filteredEntries[viewerIndex].mood && (
                        <span className="px-3 py-1 bg-pink-200 text-purple-800 rounded-full text-sm font-medium">
                          {moods.find(m => m.label === filteredEntries[viewerIndex].mood)?.emoji} {filteredEntries[viewerIndex].mood}
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200">
                      <p className="text-purple-700 whitespace-pre-wrap leading-relaxed">
                        {filteredEntries[viewerIndex].text || 'No text entry for this day.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-6 border-t border-pink-200 bg-gradient-to-r from-pink-100 to-purple-100">
                <button
                  onClick={() => setViewerIndex(Math.max(0, viewerIndex - 1))}
                  disabled={viewerIndex === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
                    viewerIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-600 hover:bg-purple-200 transform hover:scale-105'
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="text-center">
                  <span className="text-purple-600 font-medium">
                    {viewerIndex + 1} of {filteredEntries.length}
                  </span>
                  <div className="text-xs text-purple-500 mt-1">
                    {moodFilter ? `Filtered by ${moodFilter}` : 'All entries'}
                  </div>
                </div>

                <button
                  onClick={() => setViewerIndex(Math.min(filteredEntries.length - 1, viewerIndex + 1))}
                  disabled={viewerIndex === filteredEntries.length - 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
                    viewerIndex === filteredEntries.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-600 hover:bg-purple-200 transform hover:scale-105'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10">
          {/* Header */}
          <header className="text-center py-8 relative">
            <div className="absolute top-0 right-4 md:right-8 flex items-center space-x-4">
              <span className="text-purple-600 font-medium">Hello, {currentUser}! 👋🏾</span>
              {syncStatus === 'saving' && (
                <span className="text-purple-400 text-xs hidden md:inline">Saving...</span>
              )}
              {syncStatus === 'error' && (
                <span className="text-red-400 text-xs hidden md:inline">Sync issue — saved on this device</span>
              )}
              <button
                onClick={logout}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-purple-600 px-4 py-2 rounded-full font-medium border-2 border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <LogOut className="inline mr-2" size={16} />
                Logout
              </button>
            </div>
            
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-pink-300 animate-ping"
                  size={16}
                  style={{
                    left: `${45 + Math.random() * 10}%`,
                    top: `${30 + Math.random() * 40}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold relative">
              <span 
                className="relative z-10 bg-gradient-to-r from-pink-500 via-orange-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  letterSpacing: '0.15em',
                  fontWeight: '900',
                  filter: 'drop-shadow(0px 0px 15px rgba(236, 72, 153, 0.8))',
                }}
              >
                BubblegumBytes
              </span>
            </h1>
            <p className="text-purple-600 text-lg mt-4 font-medium">Your magical digital diary ✨</p>
          </header>

          {/* Back to Home */}
          {(currentView === 'write' || currentView === 'calendar') && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-800 transition-colors bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border-2 border-pink-200 hover:border-pink-300 shadow-md transform hover:scale-105 duration-300"
              >
                <ChevronLeft size={18} />
                Back to Home
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto px-4">
            {currentView === 'landing' ? (
              <div className="max-w-lg mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-pink-200 text-center">
                  <Sparkles className="mx-auto text-pink-500 mb-4" size={32} />
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">Hello, {currentUser}! 👋</h2>
                  <p className="text-purple-600 font-medium mb-8">{dailyAffirmation}</p>

                  <div className="space-y-3">
                    <button
                      onClick={startNewEntry}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <Edit3 className="inline mr-2" size={20} />
                      Create New Entry
                    </button>
                    <button
                      onClick={() => setCurrentView('calendar')}
                      className="w-full bg-white text-purple-600 py-4 rounded-2xl font-bold text-lg border-2 border-pink-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 transform hover:scale-105"
                    >
                      <Calendar className="inline mr-2" size={20} />
                      View Calendar
                    </button>
                  </div>

                  {Object.keys(entries).length > 0 && (
                    <p className="text-purple-400 text-sm mt-6">
                      You've written {Object.keys(entries).length} {Object.keys(entries).length === 1 ? 'entry' : 'entries'} so far ✨
                    </p>
                  )}
                </div>
              </div>
            ) : currentView === 'write' ? (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-purple-700">Today's Entry</h2>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="px-4 py-2 rounded-full border-2 border-pink-200 focus:border-pink-400 outline-none bg-pink-50"
                      />
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-purple-600 mb-3">How are you feeling? 💭</h3>
                      <div className="flex flex-wrap gap-3">
                        {moods.map((mood) => (
                          <button
                            key={mood.label}
                            onClick={() => setSelectedMood(mood.label)}
                            className={`px-4 py-2 rounded-full border-2 transition-all duration-300 transform hover:scale-110 ${
                              selectedMood === mood.label
                                ? 'border-pink-400 bg-pink-100 shadow-lg'
                                : 'border-purple-200 bg-white hover:bg-purple-50'
                            }`}
                          >
                            <span className="text-2xl mr-2">{mood.emoji}</span>
                            <span className="text-sm font-medium text-purple-700">{mood.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={currentEntry}
                      onChange={(e) => setCurrentEntry(e.target.value)}
                      placeholder="What's on your mind today? ✨"
                      className="w-full h-64 p-6 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none resize-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-500 text-purple-800 font-medium"
                    />

                    <button
                      onClick={saveEntry}
                      className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <Save className="inline mr-2" size={20} />
                      Save My Thoughts ✨
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl p-6 shadow-xl border-2 border-purple-300">
                    <div className="text-center">
                      <Star className="mx-auto text-purple-600 mb-3" size={24} />
                      <h3 className="font-bold text-purple-800 mb-3">Daily Sparkle</h3>
                      <p className="text-purple-700 font-medium">{dailyAffirmation}</p>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-2 border-pink-200">
                    <h3 className="font-bold text-purple-800 mb-4 text-center">Your Journey</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600">Total Entries:</span>
                        <span className="font-bold text-pink-600">{Object.keys(entries).length}</span>
                      </div>
                      {Object.keys(entries).length > 0 && (
                        <button
                          onClick={() => openEntryViewer()}
                          className="w-full mt-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-2 rounded-full font-medium hover:scale-105 transition-transform"
                        >
                          View All Entries 📖
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : currentView === 'saved' ? (
              <div className="max-w-lg mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-pink-200 text-center">
                  <div className="text-5xl mb-4">
                    {entries[savedEntryDate]?.mood
                      ? moods.find(m => m.label === entries[savedEntryDate].mood)?.emoji
                      : '✨'}
                  </div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-3">Entry Saved!</h2>
                  <p className="text-purple-600 font-medium mb-8 leading-relaxed">
                    {getSendOffMessage(entries[savedEntryDate]?.mood)}
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={startNewEntry}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <Edit3 className="inline mr-2" size={20} />
                      Create New Entry
                    </button>
                    <button
                      onClick={() => setCurrentView('calendar')}
                      className="w-full bg-white text-purple-600 py-4 rounded-2xl font-bold text-lg border-2 border-pink-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 transform hover:scale-105"
                    >
                      <Calendar className="inline mr-2" size={20} />
                      View Calendar
                    </button>
                    <button
                      onClick={() => openEntryViewer(savedEntryDate)}
                      className="w-full text-purple-500 py-2 font-medium hover:text-purple-700 transition-colors underline underline-offset-2"
                    >
                      Review This Entry 📖
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentView('landing')}
                    className="mt-6 text-purple-400 text-sm hover:text-purple-600 transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-purple-700 text-center mb-2">{currentMonth} Calendar</h2>
                {Object.keys(entries).length > 0 && (
                  <div className="text-center mb-6">
                    <button
                      onClick={() => openEntryViewer()}
                      className="text-purple-500 font-medium hover:text-purple-700 transition-colors underline underline-offset-2"
                    >
                      View All Entries 📖
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-purple-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && setSelectedDate(day.dateStr)}
                      className={`h-12 rounded-lg font-medium transition-all duration-300 transform hover:scale-110 ${
                        day
                          ? day.dateStr === selectedDate
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : day.hasEntry
                            ? 'bg-pink-200 text-purple-800 border-2 border-pink-400'
                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                          : ''
                      }`}
                      disabled={!day}
                    >
                      {day?.day}
                      {day?.hasEntry && <div className="text-xs">✨</div>}
                    </button>
                  ))}
                </div>

                {entries[selectedDate] && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-purple-800">Entry for {selectedDate}</h3>
                      {entries[selectedDate].mood && (
                        <span className="px-3 py-1 bg-pink-200 text-purple-800 rounded-full text-sm font-medium">
                          {moods.find(m => m.label === entries[selectedDate].mood)?.emoji} {entries[selectedDate].mood}
                        </span>
                      )}
                    </div>
                    <p className="text-purple-700 line-clamp-3">{entries[selectedDate].text}</p>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => openEntryViewer(selectedDate)}
                        className="px-4 py-2 bg-purple-400 text-white rounded-full font-medium hover:bg-purple-500 transition-colors"
                      >
                        View Entry
                      </button>
                      <button
                        onClick={() => editEntry(selectedDate)}
                        className="px-4 py-2 bg-pink-400 text-white rounded-full font-medium hover:bg-pink-500 transition-colors"
                      >
                        Edit Entry
                      </button>
                    </div>
                  </div>
                )}

                {!entries[selectedDate] && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-pink-300 text-center">
                    <p className="text-purple-600 font-medium mb-4">No entry yet for {selectedDate} ✨</p>
                    <button
                      onClick={() => createEntryForDate(selectedDate)}
                      className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium hover:scale-105 transition-transform"
                    >
                      <Edit3 className="inline mr-2" size={16} />
                      Create Entry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Main App Component
function App() {
  const { loggedIn } = useContext(AuthContext);

  return (
    <>
      {loggedIn ? <BubblegumBytes /> : <SignIn />}
      <NewSyncCodeModal />
    </>
  );
}

// Export with AuthProvider wrapper
export default function BubblegumBytesApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}