import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Task, 
  PomodoroSession, 
  UserStats, 
  Badge, 
  DailyMetrics
} from './types';

interface AppState {
  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  
  // Sessions
  sessions: PomodoroSession[];
  addSession: (session: PomodoroSession) => void;
  updateSession: (sessionId: string, updates: Partial<PomodoroSession>) => void;
  
  // User stats & gamification
  userStats: UserStats;
  updateStats: (updates: Partial<UserStats>) => void;
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  
  // Badges
  badges: Badge[];
  updateBadge: (badgeId: string, updates: Partial<Badge>) => void;
  
  // Metrics 
  dailyMetrics: DailyMetrics[];
  addDailyMetric: (metric: DailyMetrics) => void;
  updateDailyMetric: (date: string, updates: Partial<DailyMetrics>) => void;
}

// Helper to calculate XP required for next level
const calculateXpForNextLevel = (currentLevel: number): number => {
  return Math.round(100 * Math.pow(1.5, currentLevel - 1));
};

// Initial badges
const initialBadges: Badge[] = [
  {
    id: 'first-pomodoro',
    name: 'First Focus',
    description: 'Complete your first Pomodoro session',
    imageUrl: '/badges/first-pomodoro.svg',
    requirement: 1,
  },
  {
    id: 'focused-novice',
    name: 'Focused Novice',
    description: 'Complete 10 Pomodoro sessions',
    imageUrl: '/badges/focused-novice.svg',
    requirement: 10,
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    imageUrl: '/badges/streak-starter.svg',
    requirement: 3,
  },
  {
    id: 'time-master',
    name: 'Time Master',
    description: 'Complete 5 hours of focused work',
    imageUrl: '/badges/time-master.svg',
    requirement: 300, // 5 hours in minutes
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Complete all planned Pomodoros in a day',
    imageUrl: '/badges/perfect-day.svg',
    requirement: 1,
  },
];

// Create store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Tasks
      tasks: [],
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),
      removeTask: (taskId) => set((state) => ({ 
        tasks: state.tasks.filter(task => task.id !== taskId)
      })),
      
      // Sessions
      sessions: [],
      addSession: (session) => set((state) => ({ 
        sessions: [...state.sessions, session] 
      })),
      updateSession: (sessionId, updates) => set((state) => ({
        sessions: state.sessions.map(session => 
          session.id === sessionId 
            ? { ...session, ...updates } 
            : session
        )
      })),
      
      // User stats & gamification
      userStats: {
        totalSessions: 0,
        totalFocusTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        xp: 0,
        xpToNextLevel: calculateXpForNextLevel(1),
      },
      updateStats: (updates) => set((state) => ({
        userStats: { ...state.userStats, ...updates }
      })),
      addXp: (amount) => set((state) => {
        const newXp = state.userStats.xp + amount;
        const xpToNextLevel = state.userStats.xpToNextLevel;
        
        // Check if leveled up
        if (newXp >= xpToNextLevel) {
          const newLevel = state.userStats.level + 1;
          return {
            userStats: {
              ...state.userStats,
              level: newLevel,
              xp: newXp - xpToNextLevel,
              xpToNextLevel: calculateXpForNextLevel(newLevel),
            }
          };
        }
        
        return {
          userStats: {
            ...state.userStats,
            xp: newXp,
          }
        };
      }),
      incrementStreak: () => set((state) => {
        const newStreakCount = state.userStats.currentStreak + 1;
        const newLongestStreak = Math.max(newStreakCount, state.userStats.longestStreak);
        
        return {
          userStats: {
            ...state.userStats,
            currentStreak: newStreakCount,
            longestStreak: newLongestStreak,
          }
        };
      }),
      resetStreak: () => set((state) => ({
        userStats: {
          ...state.userStats,
          currentStreak: 0,
        }
      })),
      
      // Badges
      badges: initialBadges,
      updateBadge: (badgeId, updates) => set((state) => ({
        badges: state.badges.map(badge => 
          badge.id === badgeId 
            ? { ...badge, ...updates } 
            : badge
        )
      })),
      
      // Metrics
      dailyMetrics: [],
      addDailyMetric: (metric) => set((state) => ({ 
        dailyMetrics: [...state.dailyMetrics, metric] 
      })),
      updateDailyMetric: (date, updates) => set((state) => ({
        dailyMetrics: state.dailyMetrics.map(metric => 
          metric.date === date 
            ? { ...metric, ...updates } 
            : metric
        )
      })),
    }),
    {
      name: 'pomodoro-focus-storage',
    }
  )
);