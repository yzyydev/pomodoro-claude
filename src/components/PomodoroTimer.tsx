'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Task, PomodoroSession } from '@/lib/types';
import { calculateSessionXP, checkBadgeUnlocks } from '@/lib/actions';
import { v4 as uuidv4 } from 'uuid';

interface PomodoroTimerProps {
  task: Task;
  onComplete: () => void;
}

const PomodoroTimer = ({ task, onComplete }: PomodoroTimerProps) => {
  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(task.recommendedDuration * 60); // Convert to seconds
  const [progress, setProgress] = useState(0);
  
  // Session tracking
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  
  // Notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Store actions
  const { 
    addSession, 
    updateSession, 
    addXp, 
    incrementStreak, 
    updateStats,
    userStats,
    updateBadge,
    badges
  } = useAppStore();
  
  // Audio refs
  const tickSound = useRef<HTMLAudioElement | null>(null);
  const completeSound = useRef<HTMLAudioElement | null>(null);
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      tickSound.current = new Audio('/sounds/tick.mp3'); // You would need to add these sound files
      completeSound.current = new Audio('/sounds/complete.mp3');
    }
    
    return () => {
      // Clean up
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Effect to handle timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer complete
            clearInterval(timerRef.current!);
            
            // Play sound
            if (completeSound.current) {
              completeSound.current.play().catch(e => console.log('Error playing sound:', e));
            }
            
            if (mode === 'focus') {
              // Complete focus session
              if (currentSession) {
                const updatedSession = {
                  ...currentSession,
                  endTime: new Date(),
                  completed: true,
                };
                updateSession(currentSession.id, updatedSession);
                
                // Calculate XP
                const sessionDuration = task.recommendedDuration; // Minutes
                const xpEarned = calculateSessionXP(
                  sessionDuration,
                  true,
                  0.9 // Confidence score placeholder
                );
                
                // Update stats
                addXp(xpEarned);
                updateStats({
                  totalSessions: userStats.totalSessions + 1,
                  totalFocusTime: userStats.totalFocusTime + sessionDuration,
                });
                
                // Check for streak
                const today = new Date().toLocaleDateString();
                const lastActiveDay = localStorage.getItem('lastActiveDay');
                
                if (lastActiveDay !== today) {
                  incrementStreak();
                  localStorage.setItem('lastActiveDay', today);
                  
                  // Check for badge unlocks
                  const unlockedBadges = checkBadgeUnlocks(
                    userStats.totalSessions + 1,
                    userStats.totalFocusTime + sessionDuration,
                    userStats.currentStreak + 1,
                    1.0 // Perfect day placeholder
                  );
                  
                  // Update badges
                  unlockedBadges.forEach(badgeId => {
                    const badge = badges.find(b => b.id === badgeId);
                    if (badge && !badge.earnedAt) {
                      updateBadge(badgeId, { earnedAt: new Date() });
                      
                      // Show notification
                      setNotificationMessage(`🎉 Badge unlocked: ${badge.name}`);
                      setShowNotification(true);
                      setTimeout(() => setShowNotification(false), 3000);
                    }
                  });
                }
                
                // Show XP notification
                setNotificationMessage(`+${xpEarned} XP earned!`);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
              }
              
              // Switch to break mode
              setMode('break');
              setTimeLeft(task.breakDuration * 60);
              setProgress(0);
              setIsActive(false);
            } else {
              // Break complete, reset to focus mode
              setMode('focus');
              setTimeLeft(task.recommendedDuration * 60);
              setProgress(0);
              setIsActive(false);
              
              // Create new session when starting next focus
              setCurrentSession(null);
            }
            
            return 0;
          }
          
          // Update progress
          const totalTime = mode === 'focus' 
            ? task.recommendedDuration * 60 
            : task.breakDuration * 60;
          setProgress(((totalTime - prevTime + 1) / totalTime) * 100);
          
          // Play tick sound on certain intervals (every 15 seconds)
          if (prevTime % 15 === 0 && tickSound.current) {
            tickSound.current.play().catch(e => console.log('Error playing sound:', e));
          }
          
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, mode]);
  
  // Start/pause the timer
  const toggleTimer = () => {
    if (!isActive && mode === 'focus' && !currentSession) {
      // Create a new session when starting focus mode
      const newSession: PomodoroSession = {
        id: uuidv4(),
        taskId: task.id,
        startTime: new Date(),
        duration: task.recommendedDuration,
        completed: false,
        type: 'focus'
      };
      
      addSession(newSession);
      setCurrentSession(newSession);
    }
    
    setIsActive(!isActive);
  };
  
  // Reset the timer
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setTimeLeft(task.recommendedDuration * 60);
    } else {
      setTimeLeft(task.breakDuration * 60);
    }
    setProgress(0);
    
    // If we reset during a session, mark it as incomplete
    if (currentSession && mode === 'focus') {
      updateSession(currentSession.id, {
        endTime: new Date(),
        completed: false
      });
      setCurrentSession(null);
    }
  };
  
  // Skip break
  const skipBreak = () => {
    if (mode === 'break') {
      setMode('focus');
      setTimeLeft(task.recommendedDuration * 60);
      setProgress(0);
      setIsActive(false);
      setCurrentSession(null);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{task.title}</h2>
        <p className="text-gray-600">{task.description}</p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          {mode === 'focus' ? (
            <span className="text-focus">Focus Session</span>
          ) : (
            <span className="text-break">Break Time</span>
          )}
        </div>
        <div className="text-sm">
          {mode === 'focus' 
            ? `Recommended: ${task.recommendedDuration} min` 
            : `Break: ${task.breakDuration} min`}
        </div>
      </div>
      
      <div className="mb-8 relative">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              mode === 'focus' ? 'bg-focus' : 'bg-break'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex flex-col items-center mb-8">
        <div className={`text-6xl font-bold mb-4 ${
          mode === 'focus' ? 'text-focus' : 'text-break'
        }`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={toggleTimer}
            className={`btn ${
              mode === 'focus' ? 'btn-focus' : 'btn-break'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={resetTimer}
            className="btn btn-secondary"
          >
            Reset
          </button>
          
          {mode === 'break' && (
            <button
              onClick={skipBreak}
              className="btn btn-secondary"
            >
              Skip Break
            </button>
          )}
          
          {mode === 'focus' && (
            <button
              onClick={onComplete}
              className="btn btn-secondary"
            >
              End Session
            </button>
          )}
        </div>
      </div>
      
      {/* Notification toast */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg animate-pulse-slow">
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;