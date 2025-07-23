import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'
import { CurrentlyReading } from './CurrentlyReading'
import { TBRSection } from './TBRSection'
import { PastReads } from './PastReads'
import { VotingQueue } from './VotingQueue'
import { SuggestBook } from './SuggestBook'

interface BookshelfProps {
  clubId: Id<'clubs'>
}

export function Bookshelf({ clubId }: BookshelfProps) {
  const [activeTab, setActiveTab] = useState<
    'bookshelf' | 'voting' | 'suggest'
  >('bookshelf')
  const bookshelf = useQuery(api.books.getBookshelf, { clubId })
  const pendingBooks = useQuery(api.books.getPendingBooks, { clubId })
  const clubDetails = useQuery(api.clubs.getClubDetails, { clubId })

  if (bookshelf === undefined || clubDetails === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  const pendingCount =
    pendingBooks?.filter((book) => !book.userVote).length || 0

  return (
    <div className="max-w-4xl mx-auto pb-20 relative min-h-[80vh]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {clubDetails.name}
        </h1>
        <p className="text-gray-600">{clubDetails.members.length} members</p>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookshelf' && bookshelf && (
        <div className="space-y-8">
          <CurrentlyReading
            currentBook={bookshelf.currentBook}
            clubId={clubId}
            isAdmin={clubDetails.isAdmin}
          />
          <TBRSection
            books={bookshelf.tbrBooks}
            clubId={clubId}
            isAdmin={clubDetails.isAdmin}
          />
          <PastReads books={bookshelf.completedBooks} clubId={clubId} />
        </div>
      )}

      {activeTab === 'voting' && <VotingQueue clubId={clubId} />}

      {activeTab === 'suggest' && <SuggestBook clubId={clubId} />}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-20 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 md:max-w-4xl md:left-1/2 md:-translate-x-1/2 md:rounded-t-xl md:mx-auto pb-6 pt-2">
        <button
          onClick={() => setActiveTab('bookshelf')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'bookshelf'
              ? 'text-pink-600 font-bold'
              : 'text-gray-500 hover:text-pink-600'
          }`}
        >
          <span className="text-xl">📚</span>
          <span className="text-xs">Bookshelf</span>
        </button>
        <button
          onClick={() => setActiveTab('voting')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
            activeTab === 'voting'
              ? 'text-purple-600 font-bold'
              : 'text-gray-500 hover:text-purple-600'
          }`}
        >
          <span className="text-xl">🗳️</span>
          <span className="text-xs">Voting</span>
          {pendingCount > 0 && (
            <span className="absolute top-2 right-6 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('suggest')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'suggest'
              ? 'text-green-600 font-bold'
              : 'text-gray-500 hover:text-green-600'
          }`}
        >
          <span className="text-xl">➕</span>
          <span className="text-xs">Suggest</span>
        </button>
      </nav>
    </div>
  )
}
