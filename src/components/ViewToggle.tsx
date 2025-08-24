import { ViewMode } from '../lib/viewPreferences'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({
  currentView,
  onViewChange,
  className = '',
}: ViewToggleProps) {
  return (
    <div
      className={`flex items-center gap-1 bg-gray-100 rounded-lg p-1 ${className}`}
    >
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentView === 'cards'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <span className="text-lg">🃏</span>
        <span className="hidden sm:inline">Cards</span>
      </button>
      <button
        onClick={() => onViewChange('bookshelf')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentView === 'bookshelf'
            ? 'bg-white text-gray-800 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <span className="text-lg">📚</span>
        <span className="hidden sm:inline">Bookshelf</span>
      </button>
    </div>
  )
}
