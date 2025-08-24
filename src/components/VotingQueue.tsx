/* eslint-disable @typescript-eslint/no-misused-promises */
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'
import { toast } from 'sonner'
import { CardStack } from './CardStack'
import { motion } from 'framer-motion'

interface VotingQueueProps {
  clubId: Id<'clubs'>
}

export function VotingQueue({ clubId }: VotingQueueProps) {
  const pendingBooks = useQuery(api.books.getPendingBooks, { clubId })
  const [showVetoReasons, setShowVetoReasons] = useState(false)
  const [optimisticVotes, setOptimisticVotes] = useState<Set<string>>(new Set())
  const voteOnBook = useMutation(api.books.voteOnBook)

  if (pendingBooks === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Filter out books that have been optimistically voted on
  const unvotedBooks = pendingBooks.filter(
    (book) => !book.userVote && !optimisticVotes.has(book._id)
  )

  if (unvotedBooks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center"
      >
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No books left to review!
        </h2>
        <p className="text-gray-600">
          You've voted on all pending books. Check back later for new
          suggestions!
        </p>
      </motion.div>
    )
  }

  const handleVote = async (vote: 'approve' | 'veto', vetoReason?: string) => {
    const currentBook = unvotedBooks[0]
    if (!currentBook) return

    // Optimistically mark this book as voted on
    setOptimisticVotes((prev) => new Set(prev).add(currentBook._id))

    try {
      await voteOnBook({
        bookId: currentBook._id,
        vote,
        vetoReason: vetoReason as any,
      })

      toast.success(vote === 'approve' ? 'Book approved! 👍' : 'Book vetoed 👎')
      setShowVetoReasons(false)
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticVotes((prev) => {
        const newSet = new Set(prev)
        newSet.delete(currentBook._id)
        return newSet
      })
      toast.error('Failed to submit vote')
      console.error(error)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentBook = unvotedBooks[0]
    if (!currentBook) return

    if (direction === 'right') {
      void handleVote('approve')
    } else {
      setShowVetoReasons(true)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🗳️ Tinder for Books
        </h2>
        <p className="text-gray-600">
          {unvotedBooks.length} book{unvotedBooks.length !== 1 ? 's' : ''}{' '}
          waiting for your vote
        </p>
      </motion.div>

      {/* Card Stack */}
      <CardStack books={unvotedBooks} onSwipe={handleSwipe} />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-6 mt-8"
      >
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Pass on book"
        >
          👎
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Approve book"
        >
          👍
        </button>
      </motion.div>

      {/* Veto Reasons Modal */}
      {showVetoReasons && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Why are you passing?
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => handleVote('veto', 'already_read')}
                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                📖 I've already read it
              </button>

              <button
                onClick={() => handleVote('veto', 'not_for_me')}
                className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                🌶️ Not for me (Spice/Theme)
              </button>

              <button
                onClick={() => handleVote('veto', 'not_interested')}
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
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
