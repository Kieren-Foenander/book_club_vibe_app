/* eslint-disable @typescript-eslint/no-misused-promises */
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'
import { toast } from 'sonner'

interface CurrentlyReadingProps {
  currentBook: any
  clubId: Id<'clubs'>
  isAdmin: boolean
}

export function CurrentlyReading({
  currentBook,
  isAdmin,
}: CurrentlyReadingProps) {
  const [showProgressUpdate, setShowProgressUpdate] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(currentBook?.userProgress || 0)
  const [totalPages, setTotalPages] = useState(currentBook?.totalPages || 0)
  const [storylineRating, setStorylineRating] = useState(0)
  const [charactersRating, setCharactersRating] = useState(0)
  const [spiceRating, setSpiceRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateProgress = useMutation(api.books.updateProgress)
  const rateBook = useMutation(api.books.rateBook)

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBook) return

    try {
      await updateProgress({
        bookId: currentBook.book._id,
        currentPage,
        totalPages: totalPages || undefined,
      })
      toast.success('Progress updated! 📖')
      setShowProgressUpdate(false)
    } catch (error) {
      toast.error('Failed to update progress')
      console.error(error)
    }
  }

  const openRatingModal = () => {
    setStorylineRating(0)
    setCharactersRating(0)
    setSpiceRating(0)
    setShowRatingModal(true)
  }

  const closeRatingModal = () => {
    setShowRatingModal(false)
    setStorylineRating(0)
    setCharactersRating(0)
    setSpiceRating(0)
  }

  const handleSubmitRating = async () => {
    if (
      !currentBook ||
      storylineRating === 0 ||
      charactersRating === 0 ||
      spiceRating === 0
    ) {
      toast.error('Please rate all categories')
      return
    }

    setIsSubmitting(true)
    try {
      await rateBook({
        bookId: currentBook.book._id,
        storylineRating,
        charactersRating,
        spiceRating,
      })
      toast.success('Rating submitted! ⭐')
      closeRatingModal()
    } catch (error) {
      toast.error('Failed to submit rating')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (
    rating: number,
    type: 'storyline' | 'characters' | 'spice'
  ) => {
    if (rating === 0) return 'Click to rate'

    if (type === 'storyline') {
      const texts = ['Poor', 'Fair', 'Good', 'Great', 'Amazing']
      return texts[rating - 1]
    }

    if (type === 'characters') {
      const texts = ['Meh', 'Okay', 'Likeable', 'Loveable', 'Obsessed']
      return texts[rating - 1]
    }

    if (type === 'spice') {
      const texts = [
        'Mild - Sweet romance',
        'Warm - Some steamy scenes',
        'Hot - Regular spicy content',
        'Very Hot - Frequent spicy scenes',
        'Fire - Maximum spice level',
      ]
      return texts[rating - 1]
    }

    return ''
  }

  if (!currentBook) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📖 Currently Reading
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500">No book currently selected</p>
          {isAdmin && (
            <p className="text-sm text-gray-400 mt-2">
              As admin, you can select the next book from the TBR section
            </p>
          )}
        </div>
      </div>
    )
  }

  const { book, userProgress, allProgress } = currentBook

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📖 Currently Reading
          </h2>
          <button
            onClick={openRatingModal}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-sm"
          >
            ⭐ Rate Book
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full max-w-48 mx-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full max-w-48 mx-auto h-64 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">📚</span>
              </div>
            )}
          </div>

          <div className="md:w-2/3">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {book.title}
            </h3>
            <p className="text-gray-600 mb-2">by {book.author}</p>
            {book.genre && (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-2 mr-2">
                {book.genre}
              </span>
            )}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Spice Level:</span>
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={
                      i < book.spiceRating ? 'text-red-500' : 'grayscale'
                    }
                  >
                    🌶️
                  </span>
                ))}
              </div>
            </div>

            {book.summary && (
              <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                {book.summary}
              </p>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Your Progress</span>
                <button
                  onClick={() => setShowProgressUpdate(true)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  Update
                </button>
              </div>
              <div className="bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-pink-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${totalPages > 0 ? (userProgress / totalPages) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Page {userProgress} {totalPages > 0 && `of ${totalPages}`}
                {totalPages > 0 &&
                  ` (${Math.round((userProgress / totalPages) * 100)}%)`}
              </p>
            </div>

            {allProgress.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Club Progress
                </h4>
                <div className="space-y-2">
                  {allProgress.map((progress: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">{progress.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          Page {progress.currentPage}
                        </span>
                        {progress.percentage > 0 && (
                          <span className="text-pink-600 font-medium">
                            {progress.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Update Progress
            </h3>

            <form onSubmit={void handleUpdateProgress}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Page
                </label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) =>
                    setCurrentPage(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  min="0"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Pages (optional)
                </label>
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  min="0"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressUpdate(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Rate "{book.title}"
            </h3>

            <div className="space-y-6">
              {/* Storyline Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Storyline Rating
                </label>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStorylineRating(i + 1)}
                      className={`text-3xl transition-all duration-200 hover:scale-110 ${
                        i < storylineRating
                          ? 'text-yellow-500 drop-shadow-sm'
                          : 'grayscale hover:text-yellow-400'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span
                    className={`text-sm font-medium ${storylineRating > 0 ? 'text-yellow-600' : 'text-gray-500'}`}
                  >
                    {getRatingText(storylineRating, 'storyline')}
                  </span>
                </div>
              </div>

              {/* Characters Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Characters Rating
                </label>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCharactersRating(i + 1)}
                      className={`text-3xl transition-all duration-200 hover:scale-110 ${
                        i < charactersRating
                          ? 'text-red-500 drop-shadow-sm'
                          : 'grayscale hover:text-red-400'
                      }`}
                    >
                      ❤️
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span
                    className={`text-sm font-medium ${charactersRating > 0 ? 'text-red-600' : 'text-gray-500'}`}
                  >
                    {getRatingText(charactersRating, 'characters')}
                  </span>
                </div>
              </div>

              {/* Spice Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Spice Level Rating
                </label>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSpiceRating(i + 1)}
                      className={`text-3xl transition-all duration-200 hover:scale-110 ${
                        i < spiceRating
                          ? 'text-red-500 drop-shadow-sm'
                          : 'grayscale hover:text-red-400'
                      }`}
                    >
                      🌶️
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span
                    className={`text-sm font-medium ${spiceRating > 0 ? 'text-red-600' : 'text-gray-500'}`}
                  >
                    {getRatingText(spiceRating, 'spice')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeRatingModal}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={
                  isSubmitting ||
                  storylineRating === 0 ||
                  charactersRating === 0 ||
                  spiceRating === 0
                }
                className="flex-1 px-4 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
