'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { sessions, dailyMetrics, userStats } = useAppStore();

  // Helper to format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Prepare data for focus time chart
  const prepareFocusTimeData = () => {
    // For demo, generate some sample data
    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return formatDate(date);
    });

    // If we have real data, use it
    const focusTimeData = Array(7).fill(0);
    if (sessions.length > 0) {
      sessions.forEach(session => {
        if (session.type === 'focus') {
          const sessionDate = new Date(session.startTime);
          const dayIndex = labels.findIndex(
            label => label === formatDate(sessionDate)
          );
          if (dayIndex >= 0) {
            focusTimeData[dayIndex] += session.duration;
          }
        }
      });
    } else {
      // Sample data for demo
      focusTimeData[0] = 35;
      focusTimeData[1] = 45;
      focusTimeData[2] = 30;
      focusTimeData[3] = 60;
      focusTimeData[4] = 75;
      focusTimeData[5] = 50;
      focusTimeData[6] = 25;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Focus Time (minutes)',
          data: focusTimeData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  // Prepare data for session completion rate
  const prepareCompletionRateData = () => {
    // Sample data for demo
    const completedSessions = sessions.filter(s => s.completed && s.type === 'focus').length;
    const totalSessions = sessions.filter(s => s.type === 'focus').length;
    
    const completionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100)
      : 75; // Demo data
    
    return {
      labels: ['Completed', 'Not Completed'],
      datasets: [
        {
          data: [completionRate, 100 - completionRate],
          backgroundColor: ['#22c55e', '#d1d5db'],
          borderWidth: 0,
        },
      ],
    };
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Productivity Dashboard</h2>
        <div className="flex space-x-2">
          <button
            className={`btn ${timeframe === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeframe('daily')}
          >
            Daily
          </button>
          <button
            className={`btn ${timeframe === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button
            className={`btn ${timeframe === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-primary-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Focus Time</h3>
          <p className="text-3xl font-bold text-primary-700">
            {userStats.totalFocusTime > 0 
              ? `${userStats.totalFocusTime} min` 
              : '320 min'}
          </p>
          <p className="text-sm text-gray-500">Total focus time</p>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Sessions</h3>
          <p className="text-3xl font-bold text-primary-700">
            {userStats.totalSessions > 0 
              ? userStats.totalSessions 
              : 12}
          </p>
          <p className="text-sm text-gray-500">Completed sessions</p>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Streak</h3>
          <p className="text-3xl font-bold text-primary-700">
            {userStats.currentStreak > 0 
              ? `${userStats.currentStreak} days` 
              : '3 days'}
          </p>
          <p className="text-sm text-gray-500">
            Longest: {userStats.longestStreak > 0 
              ? `${userStats.longestStreak} days` 
              : '5 days'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Focus Time Trend</h3>
          <div className="h-64">
            <Line data={prepareFocusTimeData()} options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Minutes'
                  }
                }
              }
            }} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
          <div className="flex justify-center items-center h-64">
            <Doughnut data={prepareCompletionRateData()} options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.label}: ${context.raw}%`;
                    }
                  }
                }
              },
              cutout: '70%',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;