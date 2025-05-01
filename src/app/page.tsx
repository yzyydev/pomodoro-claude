'use client';

import { useState } from 'react';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskInput from '@/components/TaskInput';
import Dashboard from '@/components/Dashboard';
import GamePanel from '@/components/GamePanel';
import Navigation from '@/components/Navigation';
import { Task } from '@/lib/types';

export default function Home() {
  const [activeView, setActiveView] = useState<'focus' | 'dashboard' | 'achievements'>('focus');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Pomodoro <span className="text-focus">Focus</span>
      </h1>
      
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      
      <div className="mt-6">
        {activeView === 'focus' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {!currentTask ? (
                <TaskInput onTaskCreated={setCurrentTask} />
              ) : (
                <PomodoroTimer 
                  task={currentTask} 
                  onComplete={() => setCurrentTask(null)}
                />
              )}
            </div>
            <div>
              <GamePanel />
            </div>
          </div>
        )}
        
        {activeView === 'dashboard' && (
          <Dashboard />
        )}
        
        {activeView === 'achievements' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <p>Your badges and accomplishments will be shown here.</p>
          </div>
        )}
      </div>
    </div>
  );
}