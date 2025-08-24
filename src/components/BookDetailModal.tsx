import { Id } from '../../convex/_generated/dataModel'

interface Book {
  _id: Id<'books'>
  title: string
  author: string
  genre?: string
  spiceRating: number
  coverUrl?: string
}

interface BookDetailModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (book: Book) => void
  onDelete?: (bookId: Id<'books'>) => void
  showActions?: boolean
  isDeleting?: boolean
}

export function BookDetailModal({
  book,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  showActions = false,
  isDeleting = false,
}: BookDetailModalProps) {
  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">Book Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Book Cover */}
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-6xl">📚</span>
            </div>
          )}

          {/* Book Info */}
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-gray-800">{book.title}</h4>
            <p className="text-gray-600">by {book.author}</p>

            {book.genre && (
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                {book.genre}
              </span>
            )}

            {/* Spice Rating */}
            <div className="flex items-center gap-2">
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
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {onEdit && (
                <button
                  onClick={() => onEdit(book)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(book._id)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
