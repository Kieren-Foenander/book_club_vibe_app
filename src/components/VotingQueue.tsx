import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'
import { toast } from 'sonner'

interface VotingQueueProps {
  clubId: Id<'clubs'>
}

export function VotingQueue({ clubId }: VotingQueueProps) {
  const pendingBooks = useQuery(api.books.getPendingBooks, { clubId })
  const [currentBookIndex, setCurrentBookIndex] = useState(0)
  const [showVetoReasons, setShowVetoReasons] = useState(false)
  const voteOnBook = useMutation(api.books.voteOnBook)

  if (pendingBooks === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const unvotedBooks = pendingBooks.filter((book) => !book.userVote)

  if (unvotedBooks.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            All caught up!
          </h2>
          <p className="text-gray-600">You've voted on all pending books.</p>
        </div>

        {pendingBooks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Voting Status
            </h3>
            <div className="space-y-3">
              {pendingBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{book.title}</h4>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600">
                        👍 {book.approvalCount}
                      </span>
                      <span className="text-red-600">👎 {book.vetoCount}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        book.userVote === 'approve'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      You {book.userVote === 'approve' ? 'approved' : 'vetoed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const currentBook = unvotedBooks[currentBookIndex]

  const handleVote = async (vote: 'approve' | 'veto', vetoReason?: string) => {
    try {
      await voteOnBook({
        bookId: currentBook._id,
        vote,
        vetoReason: vetoReason as any,
      })

      toast.success(vote === 'approve' ? 'Book approved! 👍' : 'Book vetoed 👎')

      // Move to next book or reset if this was the last one
      if (currentBookIndex < unvotedBooks.length - 1) {
        setCurrentBookIndex(currentBookIndex + 1)
      } else {
        setCurrentBookIndex(0)
      }

      setShowVetoReasons(false)
    } catch (error) {
      toast.error('Failed to submit vote')
      console.error(error)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      void handleVote('approve')
    } else {
      setShowVetoReasons(true)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🗳️ Tinder for Books
        </h2>
        <p className="text-gray-600">
          {unvotedBooks.length} book{unvotedBooks.length !== 1 ? 's' : ''}{' '}
          waiting for your vote
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Book Card */}
        <div className="p-6">
          {currentBook?.coverUrl ? (
            <img
              src={currentBook?.coverUrl}
              alt={currentBook?.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-6xl">📚</span>
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {currentBook?.title}
          </h3>
          <p className="text-gray-600 mb-2">by {currentBook?.author}</p>
          {currentBook?.genre && (
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-2 mr-2">
              {currentBook.genre}
            </span>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Suggested by {currentBook?.suggesterName}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Spice Level:</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < currentBook.spiceRating ? 'text-red-500' : 'grayscale'
                  }
                >
                  🌶️
                </span>
              ))}
            </div>
          </div>

          {currentBook?.summary && (
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {currentBook?.summary}
            </p>
          )}
        </div>

        {/* Voting Buttons */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => handleSwipe('left')}
            className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors"
          >
            👎 Pass
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex-1 py-4 bg-green-50 hover:bg-green-100 text-green-600 font-semibold transition-colors"
          >
            👍 Approve
          </button>
        </div>
      </div>

      {/* Navigation */}
      {unvotedBooks.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {unvotedBooks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBookIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentBookIndex ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Veto Reasons Modal */}
      {showVetoReasons && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Why are you passing?
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => void handleVote('veto', 'already_read')}
                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                📖 I've already read it
              </button>

              <button
                onClick={() => void handleVote('veto', 'not_for_me')}
                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                🌶️ Not for me (Spice/Theme)
              </button>

              <button
                onClick={() => void handleVote('veto', 'not_interested')}
                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                😐 Not interested
              </button>
            </div>

            <button
              onClick={() => setShowVetoReasons(false)}
              className="w-full mt-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
