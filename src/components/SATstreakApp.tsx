import React, { useState, useEffect } from 'react';
import { BookOpen, Target, Calendar, Trophy, Settings, LogOut, Play, CheckCircle, XCircle, Star, Zap, Brain, TrendingUp, Bell, BellOff, Home, BarChart3, User, ChevronRight, ArrowLeft, RotateCcw, Award, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock question data
const mockQuestions = [
  {
    id: "RW_001",
    subject: "Reading & Writing",
    topic: "Transitions",
    difficulty: "Easy",
    question: "Which transition best fits this sentence?\n\nThe study showed promising results in the first phase. _____, researchers decided to proceed with larger trials.",
    choices: ["However", "Similarly", "For example", "Consequently"],
    correctAnswer: "Consequently",
    explanation: "'Consequently' shows the logical result of the promising results leading to larger trials."
  },
  {
    id: "RW_002",
    subject: "Reading & Writing",
    topic: "Command of Evidence",
    difficulty: "Medium",
    question: "Which choice provides the best evidence for the claim that social media affects sleep patterns?",
    choices: [
      "Many teenagers use social media before bed.",
      "A 2023 study found that 73% of teens who used social media within an hour of bedtime experienced disrupted sleep.",
      "Social media platforms are designed to be engaging.",
      "Sleep is important for adolescent development."
    ],
    correctAnswer: "A 2023 study found that 73% of teens who used social media within an hour of bedtime experienced disrupted sleep.",
    explanation: "This choice provides specific statistical evidence directly supporting the claim about social media's impact on sleep."
  },
  {
    id: "RW_003",
    subject: "Reading & Writing",
    topic: "Central Ideas",
    difficulty: "Hard",
    question: "Based on the passage, the author's primary purpose is to:",
    choices: [
      "Criticize current educational methods",
      "Propose a new framework for understanding learning",
      "Compare different learning theories",
      "Highlight the importance of student motivation"
    ],
    correctAnswer: "Propose a new framework for understanding learning",
    explanation: "The passage introduces and develops a new theoretical framework rather than simply critiquing existing methods."
  },
  {
    id: "RW_004",
    subject: "Reading & Writing",
    topic: "Grammar",
    difficulty: "Easy",
    question: "Which choice corrects the error in the sentence?\n\nThe team of researchers have been working on this project for three years.",
    choices: [
      "The team of researchers have been working",
      "The team of researchers has been working", 
      "The team of researchers are working",
      "The team of researchers were working"
    ],
    correctAnswer: "The team of researchers has been working",
    explanation: "The subject 'team' is singular, so it requires the singular verb 'has been working'."
  },
  {
    id: "RW_005",
    subject: "Reading & Writing",
    topic: "Vocabulary",
    difficulty: "Medium",
    question: "In context, 'precipitated' most nearly means:",
    choices: ["Prevented", "Caused", "Delayed", "Observed"],
    correctAnswer: "Caused",
    explanation: "In this context, 'precipitated' means to cause something to happen suddenly or prematurely."
  },
  {
    id: "RW_006",
    subject: "Reading & Writing",
    topic: "Grammar",
    difficulty: "Easy",
    question: "Which choice correctly punctuates the sentence?\n\nThe conference which was held in Chicago attracted over 500 attendees.",
    choices: [
      "The conference which was held in Chicago attracted over 500 attendees.",
      "The conference, which was held in Chicago, attracted over 500 attendees.",
      "The conference which was held in Chicago, attracted over 500 attendees.",
      "The conference, which was held in Chicago attracted over 500 attendees."
    ],
    correctAnswer: "The conference, which was held in Chicago, attracted over 500 attendees.",
    explanation: "The relative clause 'which was held in Chicago' is non-restrictive and should be set off by commas."
  }
];

const SATstreakApp = () => {
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState('Reading & Writing');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [questionsAnswered, setQuestionsAnswered] = useState([]);
  const [isDailyDrill, setIsDailyDrill] = useState(false);
  const [history, setHistory] = useState({});
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalQuestions: 0,
    accuracy: 0,
    xp: 0,
    level: 1,
    lastPractice: null,
    questionsToday: 0,
    bestStreak: 0,
    totalDaysActive: 0,
    topicStats: {},
    dailyGoal: 10,
    dailyGoalXP: 50,
    dailyDrillDone: {}
  });

  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const getYesterdayKey = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };
  const hasCompletedToday = () => userStats.lastPractice === getTodayKey();
  const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
  const getXPForNextLevel = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    return (currentLevel * 100) - currentXP;
  };
  const getTodaysXP = () => {
    const today = getTodayKey();
    return history[today]?.xp || 0;
  };
  const getLast7Days = () => {
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const dayData = history[key] || { xp: 0, correct: 0, total: 0 };
      days.push({ key, dayName, ...dayData });
    }
    return days;
  };
  const getAchievements = () => [
    { id: 'streak_3', name: 'First Streak', emoji: '🔥', unlocked: userStats.streak >= 3, requirement: '3 day streak' },
    { id: 'streak_7', name: 'Week Warrior', emoji: '💪', unlocked: userStats.streak >= 7, requirement: '7 day streak' },
    { id: 'streak_14', name: 'Streak Master', emoji: '👑', unlocked: userStats.streak >= 14, requirement: '14 day streak' },
    { id: 'xp_100', name: 'Getting Started', emoji: '⭐', unlocked: userStats.xp >= 100, requirement: '100 XP' },
    { id: 'xp_500', name: 'Knowledge Seeker', emoji: '🎓', unlocked: userStats.xp >= 500, requirement: '500 XP' },
    { id: 'xp_1000', name: 'SAT Scholar', emoji: '🏆', unlocked: userStats.xp >= 1000, requirement: '1000 XP' },
    { id: 'questions_50', name: 'Practice Makes Perfect', emoji: '📚', unlocked: userStats.totalQuestions >= 50, requirement: '50 questions' },
    { id: 'questions_200', name: 'Question Master', emoji: '🧠', unlocked: userStats.totalQuestions >= 200, requirement: '200 questions' }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('satstreak_user');
    const savedStats = localStorage.getItem('satstreak_stats');
    const savedHistory = localStorage.getItem('satstreak_history');
    const savedMissed = localStorage.getItem('satstreak_missed');
    const savedPrefs = localStorage.getItem('satstreak_prefs');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStats) setUserStats(JSON.parse(savedStats));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMissed) setMissedQuestions(JSON.parse(savedMissed));
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setNotificationsEnabled(prefs.notificationsEnabled ?? true);
      setReminderTime(prefs.reminderTime ?? '19:00');
    }
    if ('Notification' in window) setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => { if (user) localStorage.setItem('satstreak_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('satstreak_stats', JSON.stringify(userStats)); }, [userStats]);
  useEffect(() => { localStorage.setItem('satstreak_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('satstreak_missed', JSON.stringify(missedQuestions)); }, [missedQuestions]);
  useEffect(() => { 
    localStorage.setItem('satstreak_prefs', JSON.stringify({ notificationsEnabled, reminderTime })); 
  }, [notificationsEnabled, reminderTime]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll get daily reminders to practice",
        });
      }
    }
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  // Check for daily reminder
  useEffect(() => {
    if (!notificationsEnabled || !user) return;

    const checkReminder = () => {
      const now = new Date();
      const [hours, minutes] = reminderTime.split(':');
      const reminderDate = new Date();
      reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Check if it's reminder time (within 1 minute)
      const diff = Math.abs(now.getTime() - reminderDate.getTime());
      if (diff < 60000 && !hasCompletedToday()) {
        sendNotification(
          'Time for your SAT practice! 📚',
          `Keep your ${userStats.streak} day streak going!`
        );
      }
    };

    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    checkReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [notificationsEnabled, reminderTime, user, userStats.streak]);

  const handleAuth = () => {
    // Validate inputs
    if (!loginForm.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!loginForm.password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }
    
    const newUser = { email: loginForm.email, uid: Math.random().toString(36).substr(2, 9) };
    setUser(newUser);
    if (isSignUp) {
      setIsFirstTime(true);
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    localStorage.clear();
    setUserStats({
      streak: 0, totalQuestions: 0, accuracy: 0, xp: 0, level: 1,
      lastPractice: null, questionsToday: 0, bestStreak: 0, totalDaysActive: 0,
      topicStats: {}, dailyGoal: 10, dailyGoalXP: 50, dailyDrillDone: {}
    });
    setHistory({});
    setMissedQuestions([]);
  };

  const startPractice = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setSessionQuestions([]);
    setSessionStats({ correct: 0, total: 0 });
    setIsDailyDrill(false);
    loadNextQuestion(difficulty);
    setCurrentScreen('practice');
  };

  const startDailyDrill = () => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    setSelectedDifficulty(randomDifficulty);
    setSessionQuestions([]);
    setSessionStats({ correct: 0, total: 0 });
    setIsDailyDrill(true);
    loadNextQuestion(randomDifficulty);
    setCurrentScreen('practice');
  };

  const loadNextQuestion = (difficulty, fromMissed = null) => {
    if (fromMissed) {
      setCurrentQuestion(fromMissed);
      setUserAnswer('');
      setShowResult(false);
      return;
    }
    const filteredQuestions = mockQuestions.filter(q => 
      q.difficulty === difficulty && q.subject === selectedSubject && !questionsAnswered.includes(q.id)
    );
    const questionPool = filteredQuestions.length === 0 
      ? mockQuestions.filter(q => q.difficulty === difficulty && q.subject === selectedSubject)
      : filteredQuestions;
    setCurrentQuestion(questionPool[Math.floor(Math.random() * questionPool.length)]);
    setUserAnswer('');
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (!userAnswer) return;
    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    setShowResult(true);
    setSessionStats(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setSessionQuestions(prev => [...prev, { ...currentQuestion, userAnswer, isCorrect }]);
    setQuestionsAnswered(prev => [...prev, currentQuestion.id]);
    if (!isCorrect) {
      setMissedQuestions(prev => {
        const exists = prev.find(q => q.id === currentQuestion.id);
        return exists ? prev : [...prev, currentQuestion];
      });
    }
    let xpGained = isCorrect ? 10 : 2;
    const today = getTodayKey();
    const isDailyDrillBonus = isDailyDrill && !userStats.dailyDrillDone[today];
    if (isDailyDrillBonus) {
      xpGained += 5;
      setUserStats(prev => ({ ...prev, dailyDrillDone: { ...prev.dailyDrillDone, [today]: true } }));
    }
    
    const oldLevel = userStats.level;
    const oldStreak = userStats.streak;
    
    setUserStats(prev => {
      const newTotalQuestions = prev.totalQuestions + 1;
      const newCorrectQuestions = (prev.accuracy * prev.totalQuestions / 100) + (isCorrect ? 1 : 0);
      const newAccuracy = newTotalQuestions > 0 ? Math.round((newCorrectQuestions / newTotalQuestions) * 100) : 0;
      const newXP = prev.xp + xpGained;
      const newLevel = calculateLevel(newXP);
      let newStreak = prev.streak;
      let newTotalDaysActive = prev.totalDaysActive;
      if (prev.lastPractice !== today) {
        const yesterday = getYesterdayKey();
        if (prev.lastPractice === yesterday || prev.lastPractice === null) {
          newStreak = prev.streak + 1;
          newTotalDaysActive = prev.totalDaysActive + 1;
        } else {
          newStreak = 1;
          newTotalDaysActive = prev.totalDaysActive + 1;
        }
      }
      const newTopicStats = { ...prev.topicStats };
      const topic = currentQuestion.topic;
      if (!newTopicStats[topic]) newTopicStats[topic] = { correct: 0, total: 0 };
      newTopicStats[topic].total += 1;
      if (isCorrect) newTopicStats[topic].correct += 1;
      const newQuestionsToday = prev.lastPractice === today ? prev.questionsToday + 1 : 1;
      
      // Show notifications after state update
      setTimeout(() => {
        if (isCorrect) {
          toast({
            title: "Correct! ✅",
            description: `+${xpGained} XP earned${isDailyDrillBonus ? ' (Daily drill bonus!)' : ''}`,
          });
        }
        
        if (newLevel > oldLevel) {
          toast({
            title: `Level Up! 🎉`,
            description: `You're now level ${newLevel}!`,
          });
        }
        
        if (newStreak > oldStreak) {
          toast({
            title: `Streak Extended! 🔥`,
            description: `${newStreak} day streak - Keep it going!`,
          });
        }
      }, 500);
      
      return {
        ...prev, totalQuestions: newTotalQuestions, accuracy: newAccuracy, xp: newXP, level: newLevel,
        streak: newStreak, bestStreak: Math.max(prev.bestStreak, newStreak), lastPractice: today,
        questionsToday: newQuestionsToday, totalDaysActive: newTotalDaysActive, topicStats: newTopicStats
      };
    });
    setHistory(prev => ({
      ...prev,
      [today]: {
        xp: (prev[today]?.xp || 0) + xpGained,
        correct: (prev[today]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[today]?.total || 0) + 1
      }
    }));
  };

  const nextQuestion = () => {
    if (isDailyDrill) { endSession(); return; }
    loadNextQuestion(selectedDifficulty);
  };

  const endSession = () => setCurrentScreen('home');

  const startReview = (missedQuestion) => {
    setCurrentScreen('review');
    setCurrentQuestion(missedQuestion);
    setUserAnswer('');
    setShowResult(false);
  };

  const submitReviewAnswer = () => {
    if (!userAnswer) return;
    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    setShowResult(true);
    if (isCorrect) {
      setMissedQuestions(prev => prev.filter(q => q.id !== currentQuestion.id));
      toast({
        title: "Mastered! 🌟",
        description: "You got this question right in review!",
      });
    }
  };

  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to SATstreak!</h1>
            <p className="text-slate-600">Build your SAT prep streak, one question at a time.</p>
          </div>
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">Build Your Streak</h3>
                <p className="text-sm text-slate-600">Practice daily to maintain your streak</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">Track Progress</h3>
                <p className="text-sm text-slate-600">See your accuracy improve over time</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-slate-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-800">Earn XP & Level Up</h3>
                <p className="text-sm text-slate-600">Gain experience points for every question</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setIsFirstTime(false); setCurrentScreen('home'); }}
            className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-amber-700 transition"
          >
            Start My SAT Journey
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-full flex items-center justify-center mr-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">SATstreak</h1>
            </div>
            <p className="text-slate-600">By ArjunTutors</p>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} />
            <input type="password" placeholder="Password" className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
            <button onClick={handleAuth} className="w-full bg-gradient-to-r from-emerald-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-amber-700 transition">{isSignUp ? 'Sign Up' : 'Login'}</button>
            <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-emerald-600 hover:underline">{isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'review' && currentQuestion) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentScreen('home')} className="p-2 -ml-2 text-slate-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="font-semibold text-slate-800">Review Mode</h2>
                <p className="text-sm text-slate-500">{currentQuestion.topic}</p>
              </div>
              <div className="w-9"></div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="bg-white rounded-lg p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{currentQuestion.difficulty}</div>
                <div className="text-sm text-slate-500">Review Question</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 leading-relaxed">{currentQuestion.question}</h3>
            </div>
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => (
                <button key={index} onClick={() => !showResult && setUserAnswer(choice)} disabled={showResult} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult ? choice === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : choice === userAnswer && choice !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-50 text-red-800' : 'border-stone-200 bg-stone-50 text-slate-600' : userAnswer === choice ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}>
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium mr-3">{String.fromCharCode(65 + index)}</span>
                    <span className="flex-1">{choice}</span>
                    {showResult && choice === currentQuestion.correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-500 ml-2" />}
                    {showResult && choice === userAnswer && choice !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5 text-red-500 ml-2" />}
                  </div>
                </button>
              ))}
            </div>
            {showResult && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">Explanation</h4>
                <p className="text-emerald-700">{currentQuestion.explanation}</p>
                {userAnswer === currentQuestion.correctAnswer && <p className="text-sm font-medium text-emerald-700 mt-3">Great! This question has been removed from review. 🎉</p>}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {!showResult ? (
              <>
                <button onClick={submitReviewAnswer} disabled={!userAnswer} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50">Submit Answer</button>
                <button onClick={() => setCurrentScreen('home')} className="px-6 py-3 border border-stone-300 rounded-lg font-semibold hover:bg-stone-50 transition">Back</button>
              </>
            ) : (
              <button onClick={() => setCurrentScreen('home')} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">Back to Home</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'stats') {
    const last7Days = getLast7Days();
    const maxXP = Math.max(...last7Days.map(d => d.xp), 1);
    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentScreen('home')} className="p-2 -ml-2 text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
              <h1 className="text-lg font-semibold text-slate-800">Your Stats</h1>
              <div className="w-9"></div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white text-center">
            <div className="text-4xl mb-2">🔥</div>
            <h2 className="text-3xl font-bold mb-1">{userStats.streak} Day Streak</h2>
            <p className="text-amber-100">{hasCompletedToday() ? "Great job today!" : "Don't break the streak!"}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">XP & Level</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-slate-800">{userStats.xp} XP</p>
                <p className="text-slate-600">Level {userStats.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Next level</p>
                <p className="font-semibold text-slate-800">{getXPForNextLevel(userStats.xp)} XP</p>
              </div>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${((userStats.xp % 100) / 100) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{userStats.accuracy}%</p>
                <p className="text-sm text-slate-500">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{userStats.totalQuestions}</p>
                <p className="text-sm text-slate-500">Total Questions</p>
              </div>
            </div>
          </div>
          {Object.keys(userStats.topicStats).length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-4">Topic Performance</h3>
              <div className="space-y-3">
                {Object.entries(userStats.topicStats).map(([topic, stats]) => {
                  const topicData = stats as { correct: number; total: number };
                  const accuracy = Math.round((topicData.correct / topicData.total) * 100);
                  return (
                    <div key={topic} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{topic}</p>
                        <p className="text-sm text-slate-500">{topicData.total} questions</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-stone-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${accuracy}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-800 w-10">{accuracy}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Last 7 Days</h3>
            <div className="flex items-end justify-between space-x-1 h-24">
              {last7Days.map((day) => (
                <div key={day.key} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-emerald-500 rounded-t transition-all min-h-1" style={{ height: `${Math.max((day.xp / maxXP) * 80, day.xp > 0 ? 8 : 0)}px` }}></div>
                  <span className="text-xs text-slate-500 mt-1">{day.dayName}</span>
                  <span className="text-xs font-medium text-slate-700">{day.xp}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Daily XP earned</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Personal Records</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-amber-600">{userStats.bestStreak}</p>
                <p className="text-sm text-slate-500">Best Streak</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800">{userStats.totalDaysActive}</p>
                <p className="text-sm text-slate-500">Days Active</p>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200">
          <div className="max-w-md mx-auto flex">
            <button onClick={() => setCurrentScreen('home')} className="flex-1 flex flex-col items-center py-3 text-slate-400"><Home className="w-5 h-5" /><span className="text-xs mt-1">Home</span></button>
            <button onClick={() => setCurrentScreen('stats')} className="flex-1 flex flex-col items-center py-3 text-emerald-600"><BarChart3 className="w-5 h-5" /><span className="text-xs mt-1">Stats</span></button>
            <button onClick={() => setCurrentScreen('profile')} className="flex-1 flex flex-col items-center py-3 text-slate-400"><User className="w-5 h-5" /><span className="text-xs mt-1">Profile</span></button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'profile') {
    const achievements = getAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentScreen('home')} className="p-2 -ml-2 text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
              <h1 className="text-lg font-semibold text-slate-800">Profile</h1>
              <div className="w-9"></div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">{user.email.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{user.email.split('@')[0]}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400 mt-1">Level {userStats.level} • {userStats.xp} XP</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Daily Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700">Daily XP Target</span>
                  <span className="font-semibold text-slate-800">{userStats.dailyGoalXP} XP</span>
                </div>
                <div className="flex space-x-2">
                  {[20, 50, 100].map(target => (
                    <button key={target} onClick={() => setUserStats(prev => ({...prev, dailyGoalXP: target}))} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${userStats.dailyGoalXP === target ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-slate-700 hover:bg-stone-200'}`}>{target} XP</button>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700">Today's Progress</span>
                  <span className="text-sm text-slate-500">{getTodaysXP()}/{userStats.dailyGoalXP} XP</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((getTodaysXP() / userStats.dailyGoalXP) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {notificationsEnabled ? <Bell className="w-5 h-5 text-emerald-600" /> : <BellOff className="w-5 h-5 text-slate-400" />}
                  <span className="text-slate-700">Daily Reminders</span>
                </div>
                <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-emerald-600' : 'bg-stone-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              {notificationsEnabled && (
                <div className="ml-8 space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Reminder Time</label>
                    <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  {notificationPermission !== 'granted' && (
                    <button onClick={requestNotificationPermission} className="w-full bg-emerald-100 text-emerald-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-200 transition">Enable Browser Notifications</button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Achievements ({unlockedCount}/{achievements.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(achievement => (
                <div key={achievement.id} className={`p-3 rounded-lg border-2 text-center ${achievement.unlocked ? 'border-emerald-200 bg-emerald-50' : 'border-stone-200 bg-stone-50 opacity-60'}`}>
                  <div className="text-2xl mb-1">{achievement.emoji}</div>
                  <p className={`font-medium text-sm mb-1 ${achievement.unlocked ? 'text-emerald-800' : 'text-slate-600'}`}>{achievement.name}</p>
                  <p className="text-xs text-slate-500">{achievement.requirement}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Account</h3>
            <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition">Sign Out</button>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200">
          <div className="max-w-md mx-auto flex">
            <button onClick={() => setCurrentScreen('home')} className="flex-1 flex flex-col items-center py-3 text-slate-400"><Home className="w-5 h-5" /><span className="text-xs mt-1">Home</span></button>
            <button onClick={() => setCurrentScreen('stats')} className="flex-1 flex flex-col items-center py-3 text-slate-400"><BarChart3 className="w-5 h-5" /><span className="text-xs mt-1">Stats</span></button>
            <button onClick={() => setCurrentScreen('profile')} className="flex-1 flex flex-col items-center py-3 text-emerald-600"><User className="w-5 h-5" /><span className="text-xs mt-1">Profile</span></button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'practice' && currentQuestion) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentScreen('home')} className="p-2 -ml-2 text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
              <div className="text-center">
                <h2 className="font-semibold text-slate-800">{isDailyDrill ? 'Daily Drill' : currentQuestion.subject}</h2>
                <p className="text-sm text-slate-500">{currentQuestion.topic}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Session</p>
                <p className="font-semibold text-slate-800">{sessionStats.correct}/{sessionStats.total}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto p-4 space-y-6">
          <div className="bg-white rounded-lg p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{currentQuestion.difficulty}</div>
                <div className="text-sm text-slate-500">{isDailyDrill ? 'Daily Question' : `Question ${sessionStats.total + 1}`}</div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 leading-relaxed">{currentQuestion.question}</h3>
            </div>
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => (
                <button key={index} onClick={() => !showResult && setUserAnswer(choice)} disabled={showResult} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResult ? choice === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : choice === userAnswer && choice !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-50 text-red-800' : 'border-stone-200 bg-stone-50 text-slate-600' : userAnswer === choice ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}>
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium mr-3">{String.fromCharCode(65 + index)}</span>
                    <span className="flex-1">{choice}</span>
                    {showResult && choice === currentQuestion.correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-500 ml-2" />}
                    {showResult && choice === userAnswer && choice !== currentQuestion.correctAnswer && <XCircle className="w-5 h-5 text-red-500 ml-2" />}
                  </div>
                </button>
              ))}
            </div>
            {showResult && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">Explanation</h4>
                <p className="text-emerald-700">{currentQuestion.explanation}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700">+{userAnswer === currentQuestion.correctAnswer ? 10 : 2} XP{isDailyDrill && !userStats.dailyDrillDone[getTodayKey()] && ' (+5 daily bonus)'}</span>
                  </div>
                  {userAnswer === currentQuestion.correctAnswer && <span className="text-sm font-medium text-emerald-700">Correct! 🎉</span>}
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {!showResult ? (
              <>
                <button onClick={submitAnswer} disabled={!userAnswer} className="flex-1 bg-gradient-to-r from-emerald-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-amber-700 transition disabled:opacity-50">Submit Answer</button>
                <button onClick={endSession} className="px-6 py-3 border border-stone-300 rounded-lg font-semibold hover:bg-stone-50 transition">End</button>
              </>
            ) : (
              <>
                <button onClick={nextQuestion} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">{isDailyDrill ? 'Complete Daily Drill' : 'Next Question'}</button>
                <button onClick={endSession} className="px-6 py-3 border border-stone-300 rounded-lg font-semibold hover:bg-stone-50 transition">End</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">SATstreak</h1>
                <p className="text-sm text-slate-500">Hi, {user.email.split('@')[0]}!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-md mx-auto p-4 space-y-6">
        {userStats.streak > 0 ? (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">{userStats.streak} Day Streak</h2>
                </div>
                <p className="text-orange-100">{hasCompletedToday() ? "Great job today! 🔥" : "Keep it going! 💪"}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{userStats.xp}</p>
                <p className="text-orange-100 text-sm">XP</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Start Your Streak!</h2>
            <p className="text-emerald-100">Answer your first question to begin building your SAT streak</p>
          </div>
        )}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Daily Goal</h3>
            <span className="text-sm text-slate-500">{getTodaysXP()}/{userStats.dailyGoalXP} XP</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-3 mb-2">
            <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-3 rounded-full transition-all" style={{ width: `${Math.min((getTodaysXP() / userStats.dailyGoalXP) * 100, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-500">{getTodaysXP() >= userStats.dailyGoalXP ? "🎉 Goal completed! Keep going for bonus XP!" : `${userStats.dailyGoalXP - getTodaysXP()} more XP to reach your goal`}</p>
        </div>
        {!userStats.dailyDrillDone[getTodayKey()] && (
          <div className="bg-gradient-to-r from-emerald-100 to-amber-100 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-800">Daily Drill</h3>
                </div>
                <p className="text-sm text-slate-600">Answer today's featured question (+5 bonus XP)</p>
              </div>
              <button onClick={startDailyDrill} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">Start</button>
            </div>
          </div>
        )}
        {userStats.totalQuestions > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-slate-800">{userStats.accuracy}%</p>
              <p className="text-xs text-slate-500">Accuracy</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <BookOpen className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-slate-800">{userStats.totalQuestions}</p>
              <p className="text-xs text-slate-500">Questions</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-slate-800">Lv. {userStats.level}</p>
              <p className="text-xs text-slate-500">Level</p>
            </div>
          </div>
        )}
        {missedQuestions.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-slate-800">Review Mistakes</h3>
              </div>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">{missedQuestions.length}</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">Practice questions you got wrong</p>
            <div className="space-y-2">
              {missedQuestions.slice(0, 3).map(question => (
                <button key={question.id} onClick={() => startReview(question)} className="w-full text-left p-3 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{question.topic}</p>
                      <p className="text-sm text-slate-500">{question.difficulty}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{hasCompletedToday() ? "Continue Practicing" : "Start Today's Practice"}</h3>
          <p className="text-slate-600 mb-4">Choose your difficulty level and begin your daily drill</p>
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Subject</p>
            <div className="flex space-x-2">
              <button onClick={() => setSelectedSubject('Reading & Writing')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${selectedSubject === 'Reading & Writing' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-slate-700 hover:bg-stone-200'}`}>Reading & Writing</button>
              <button disabled className="px-3 py-2 rounded-lg text-sm font-medium bg-stone-100 text-stone-400 cursor-not-allowed" title="Coming soon">Math</button>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => startPractice('Easy')} className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></div>
                <span className="font-semibold text-slate-800">Easy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button onClick={() => startPractice('Medium')} className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-400 rounded-full mr-3"></div>
                <span className="font-semibold text-slate-800">Medium</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <button onClick={() => startPractice('Hard')} className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                <span className="font-semibold text-slate-800">Hard</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
        {sessionQuestions.length > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Session</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Questions Answered</span>
                <span className="font-semibold text-slate-800">{sessionQuestions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Accuracy</span>
                <span className="font-semibold text-emerald-600">{Math.round((sessionQuestions.filter(q => q.isCorrect).length / sessionQuestions.length) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">XP Gained</span>
                <span className="font-semibold text-amber-600">+{sessionQuestions.reduce((acc, q) => acc + (q.isCorrect ? 10 : 2), 0)} XP</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200">
        <div className="max-w-md mx-auto flex">
          <button onClick={() => setCurrentScreen('home')} className={`flex-1 flex flex-col items-center py-3 ${currentScreen === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button onClick={() => setCurrentScreen('stats')} className={`flex-1 flex flex-col items-center py-3 ${currentScreen === 'stats' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">Stats</span>
          </button>
          <button onClick={() => setCurrentScreen('profile')} className={`flex-1 flex flex-col items-center py-3 ${currentScreen === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SATstreakApp;