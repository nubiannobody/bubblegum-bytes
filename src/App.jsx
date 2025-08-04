import React, { useState, useEffect, createContext, useContext } from 'react';
import { Calendar, Star, Sparkles, Save, Edit3, X, ChevronLeft, ChevronRight, Filter, LogIn, LogOut } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check for existing login on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('bubblegumbytes_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      setLoggedIn(true);
    }
  }, []);

  const login = (username) => {
    setCurrentUser(username);
    setLoggedIn(true);
    localStorage.setItem('bubblegumbytes_user', username);
  };

  const logout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('bubblegumbytes_user');
  };
  
  return (
    <AuthContext.Provider value={{ loggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// SignIn Component
function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    console.log('Login clicked', { username, password }); // Debug log
    
    // Accept any non-empty username and password
    if (username && password) {
      console.log('Login attempt with:', username); // Debug log
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        login(username);
      }, 1500);
    } else {
      console.log('Username or password empty'); // Debug log
      alert('Please enter both username and password');
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
              <p className="text-purple-500 text-sm mt-2">Enter your sparkly credentials to continue!</p>
            </div>

            {/* Login Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200">
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
                    className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-400 text-purple-800 font-medium"
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
                    className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-400 text-purple-800 font-medium"
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
              </div>

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
  const [currentView, setCurrentView] = useState('write');
  const [showEntryViewer, setShowEntryViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [moodFilter, setMoodFilter] = useState('');
  
  const { logout, currentUser } = useContext(AuthContext);

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

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'bg-pink-200' },
    { emoji: '😍', label: 'Excited', color: 'bg-purple-200' },
    { emoji: '😌', label: 'Peaceful', color: 'bg-blue-200' },
    { emoji: '🥰', label: 'Grateful', color: 'bg-green-200' },
    { emoji: '😴', label: 'Sleepy', color: 'bg-indigo-200' },
    { emoji: '😤', label: 'Frustrated', color: 'bg-red-200' },
    { emoji: '🤔', label: 'Thoughtful', color: 'bg-yellow-200' }
  ];

  // Load entries from localStorage on component mount
  useEffect(() => {
    if (currentUser) {
      const savedEntries = localStorage.getItem(`bubblegumbytes_entries_${currentUser}`);
      if (savedEntries) {
        try {
          setEntries(JSON.parse(savedEntries));
        } catch (error) {
          console.error('Error loading entries:', error);
          setEntries({});
        }
      }
    }
  }, [currentUser]);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    if (currentUser && Object.keys(entries).length > 0) {
      localStorage.setItem(`bubblegumbytes_entries_${currentUser}`, JSON.stringify(entries));
    }
  }, [entries, currentUser]);

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

  useEffect(() => {
    const entry = entries[selectedDate];
    if (entry) {
      setCurrentEntry(entry.text || '');
      setSelectedMood(entry.mood || '');
    } else {
      setCurrentEntry('');
      setSelectedMood('');
    }
  }, [selectedDate, entries]);

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

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
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

          {/* Navigation */}
          <nav className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border-2 border-pink-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('write')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    currentView === 'write'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                      : 'text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <Edit3 className="inline mr-2" size={16} />
                  Write
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    currentView === 'calendar'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                      : 'text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <Calendar className="inline mr-2" size={16} />
                  Calendar
                </button>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto px-4">
            {currentView === 'write' ? (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-purple-700">Today's Entry</h2>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
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
                      className="w-full h-64 p-6 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none resize-none bg-gradient-to-br from-pink-50 to-purple-50 placeholder-purple-400 text-purple-800 font-medium"
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
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600">Current Streak:</span>
                        <span className="font-bold text-pink-600">✨ Amazing!</span>
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
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">{currentMonth} Calendar</h2>
                
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
                        onClick={() => setCurrentView('write')}
                        className="px-4 py-2 bg-pink-400 text-white rounded-full font-medium hover:bg-pink-500 transition-colors"
                      >
                        Edit Entry
                      </button>
                    </div>
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
  
  return loggedIn ? <BubblegumBytes /> : <SignIn />;
}

// Export with AuthProvider wrapper
export default function BubblegumBytesApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
