// Basic task definition
export interface Task {
  id: string;
  title: string;
  description: string;
  recommendedDuration: number; // in minutes
  breakDuration: number; // in minutes
  createdAt: Date;
}

// Session tracking
export interface PomodoroSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // actual duration in minutes
  completed: boolean;
  type: 'focus' | 'break';
}

// AI recommendation type
export interface FocusRecommendation {
  recommendedDuration: number; // in minutes
  breakDuration: number; // in minutes
  reasoning: string; // explanation of recommendation
  confidenceScore: number; // 0-1 scale
}

// Gamification types
export interface UserStats {
  totalSessions: number;
  totalFocusTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt?: Date;
  progress?: number; // 0-100
  requirement: number; // The target value to earn this badge
}

// Dashboard metrics
export interface DailyMetrics {
  date: string;
  focusSessions: number;
  totalFocusTime: number; // in minutes
  completionRate: number; // 0-1
}

export interface WeeklyMetrics {
  weekStartDate: string;
  weekEndDate: string;
  focusSessions: number;
  totalFocusTime: number; // in minutes
  averageDailyFocusTime: number; // in minutes
  mostProductiveDay: string;
  completionRate: number; // 0-1
}