'use client';

import { useAppStore } from '@/lib/store';

const GamePanel = () => {
  const { userStats, badges } = useAppStore();
  
  // Calculate percentage to next level
  const progressToNextLevel = (userStats.xp / userStats.xpToNextLevel) * 100;
  
  // Get recently earned badges (for demo, show first 3)
  const recentBadges = badges
    .filter(badge => badge.earnedAt)
    .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
    .slice(0, 3);
  
  // For display purposes, ensure we have some badges to show
  const badgesToShow = recentBadges.length > 0 
    ? recentBadges 
    : badges.slice(0, 3).map(badge => ({
        ...badge,
        progress: Math.floor(Math.random() * 80) + 10, // Random progress for demo
      }));

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Your Progress</h2>
      
      {/* Level & XP Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            Level {userStats.level}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {userStats.xp} / {userStats.xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progressToNextLevel}%` }}
          ></div>
        </div>
      </div>
      
      {/* Streak Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Streak</h3>
        <div className="flex items-center">
          <div className="flex space-x-1">
            {[...Array(Math.min(7, Math.max(userStats.currentStreak, 3)))].map((_, i) => (
              <div 
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-full 
                  ${i < userStats.currentStreak ? 'bg-focus text-white' : 'bg-gray-200 text-gray-400'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {userStats.currentStreak > 7 && (
            <div className="ml-2 text-sm text-gray-600">+{userStats.currentStreak - 7} more</div>
          )}
        </div>
      </div>
      
      {/* Badges Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Badges</h3>
        <div className="space-y-3">
          {badgesToShow.map((badge) => (
            <div key={badge.id} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                {/* Placeholder for badge icon - in a real app, you'd use an image */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{badge.name}</p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-primary-600"
                    style={{ width: `${badge.earnedAt ? 100 : (badge.progress || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamePanel;