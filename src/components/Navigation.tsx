'use client';

interface NavigationProps {
  activeView: 'focus' | 'dashboard' | 'achievements';
  setActiveView: (view: 'focus' | 'dashboard' | 'achievements') => void;
}

const Navigation = ({ activeView, setActiveView }: NavigationProps) => {
  return (
    <nav className="flex justify-center">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`px-5 py-2.5 text-sm font-medium rounded-l-lg ${
            activeView === 'focus'
              ? 'bg-focus text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveView('focus')}
        >
          Focus
        </button>
        <button
          type="button"
          className={`px-5 py-2.5 text-sm font-medium ${
            activeView === 'dashboard'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveView('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`px-5 py-2.5 text-sm font-medium rounded-r-lg ${
            activeView === 'achievements'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveView('achievements')}
        >
          Achievements
        </button>
      </div>
    </nav>
  );
};

export default Navigation;