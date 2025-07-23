/* eslint-disable @typescript-eslint/no-misused-promises */
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'
import { toast } from 'sonner'

interface TBRSectionProps {
  books: any[]
  clubId: Id<'clubs'>
  isAdmin: boolean
}

export function TBRSection({ books, clubId, isAdmin }: TBRSectionProps) {
  const [showReveal, setShowReveal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const selectNextBook = useMutation(api.books.selectNextBook)

  const handleSelectNext = async () => {
    if (!isAdmin) return

    setIsRevealing(true)
    try {
      const book = await selectNextBook({ clubId })
      setSelectedBook(book)

      // Dramatic reveal animation
      setTimeout(() => {
        setShowReveal(true)
        setIsRevealing(false)
      }, 2000)
    } catch (error) {
      toast.error('Failed to select next book')
      console.error(error)
      setIsRevealing(false)
    }
  }

  const closeReveal = () => {
    setShowReveal(false)
    setSelectedBook(null)
  }

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📚 To Be Read</h2>
          {isAdmin && books.length > 0 && (
            <button
              onClick={handleSelectNext}
              disabled={isRevealing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isRevealing ? 'Selecting...' : '🎭 Dramatic Reveal'}
            </button>
          )}
        </div>

        {books.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-500">No approved books yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Books need 100% approval from all members to appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                {book.genre && (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-2 mr-2">
                    {book.genre}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Spice:</span>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dramatic Reveal Modal */}
      {(isRevealing || showReveal) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="text-center">
            {isRevealing ? (
              <div className="animate-pulse">
                <div className="text-8xl mb-4">✉️</div>
                <p className="text-white text-xl font-semibold">
                  Selecting your next spicy read...
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 max-w-md mx-auto animate-bounce">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Your Next Book Is...
                </h2>

                {selectedBook && (
                  <div className="text-center">
                    {selectedBook.coverUrl ? (
                      <img
                        src={selectedBook.coverUrl}
                        alt={selectedBook.title}
                        className="w-32 h-48 object-cover rounded-lg mx-auto mb-4 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-48 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">📚</span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedBook.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      by {selectedBook.author}
                    </p>
                    {selectedBook.genre && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-4 mr-2">
                        {selectedBook.genre}
                      </span>
                    )}

                    <div className="flex justify-center items-center gap-2 mb-6">
                      <span className="text-sm text-gray-500">
                        Spice Level:
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < selectedBook.spiceRating
                                ? 'text-red-500'
                                : 'grayscale'
                            }
                          >
                            🌶️
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={closeReveal}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  Let's Read! 📖
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
