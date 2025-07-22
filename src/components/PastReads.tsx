import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { toast } from 'sonner'

interface PastReadsProps {
  books: any[]
  clubId: Id<'clubs'>
}

export function PastReads({ books, clubId }: PastReadsProps) {
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [storylineRating, setStorylineRating] = useState(0)
  const [charactersRating, setCharactersRating] = useState(0)
  const [spiceRating, setSpiceRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [reviewsBook, setReviewsBook] = useState<any>(null)
  const [selectedBookId, setSelectedBookId] = useState<Id<'books'> | null>(null)

  const rateBook = useMutation(api.books.rateBook)

  // Fetch reviews for the selected book
  const reviews = useQuery(
    api.books.getBookReviews,
    selectedBookId ? { bookId: selectedBookId } : 'skip'
  )

  const openRatingModal = (book: any) => {
    setSelectedBook(book)
    setStorylineRating(0)
    setCharactersRating(0)
    setSpiceRating(0)
    setShowRatingModal(true)
  }

  const closeRatingModal = () => {
    setShowRatingModal(false)
    setSelectedBook(null)
    setStorylineRating(0)
    setCharactersRating(0)
    setSpiceRating(0)
  }

  const openReviewsModal = (book: any) => {
    setReviewsBook(book)
    setSelectedBookId(book._id as Id<'books'>)
    setShowReviewsModal(true)
  }

  const closeReviewsModal = () => {
    setShowReviewsModal(false)
    setReviewsBook(null)
    setSelectedBookId(null)
  }

  const handleSubmitRating = async () => {
    if (
      !selectedBook ||
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
        bookId: selectedBook._id,
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

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📖 Past Reads</h2>

        {books.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500">No completed books yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Your reading history will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book._id}
                className="border border-gray-200 rounded-lg p-4 relative group cursor-pointer"
                onClick={() => openReviewsModal(book)}
                title="View all reviews"
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-3xl">📚</span>
                  </div>
                )}

                <h3 className="font-semibold text-gray-800 mb-1">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">by {book.author}</p>

                {book.ratingCount > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Storyline:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(book.avgRatings.storyline)
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Characters:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(book.avgRatings.characters)
                                ? 'text-red-500'
                                : 'text-gray-300'
                            }
                          >
                            ❤️
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Spice:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(book.avgRatings.spice)
                                ? 'text-red-500'
                                : 'text-gray-300'
                            }
                          >
                            🌶️
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      {book.ratingCount} rating
                      {book.ratingCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500 mb-2">No ratings yet</p>
                  </div>
                )}

                {/* Rate Book Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openRatingModal(book)
                  }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-pink-600 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rate this book"
                >
                  ⭐
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && reviewsBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Reviews for "{reviewsBook.title}"
            </h3>
            {reviews === undefined ? (
              <div className="text-center text-gray-500">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center text-gray-500">
                No reviews yet for this book.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {reviews.map((review: any) => (
                  <li key={review.userId} className="py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-700">
                        {review.userName}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({new Date(review.ratedAt).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>
                        Storyline:{' '}
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.storylineRating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }
                          >
                            ⭐
                          </span>
                        ))}
                      </span>
                      <span>
                        Characters:{' '}
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.charactersRating
                                ? 'text-red-500'
                                : 'text-gray-300'
                            }
                          >
                            ❤️
                          </span>
                        ))}
                      </span>
                      <span>
                        Spice:{' '}
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.spiceRating
                                ? 'text-red-500'
                                : 'text-gray-300'
                            }
                          >
                            🌶️
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => closeReviewsModal()}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Rate "{selectedBook.title}"
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
                          : 'text-gray-300 hover:text-yellow-400'
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
                          : 'text-gray-300 hover:text-red-400'
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
                          : 'text-gray-300 hover:text-red-400'
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
