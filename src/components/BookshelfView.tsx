import { Id } from '../../convex/_generated/dataModel'

interface Book {
  _id: Id<'books'>
  title: string
  author: string
  genre?: string
  spiceRating: number
  coverUrl?: string
}

interface BookshelfViewProps {
  books: Book[]
  onBookClick: (book: Book) => void
  maxBooks?: number
  showEmptySlots?: boolean
}

// Generate a consistent color based on the book title
const getBookColor = (title: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-sky-500',
  ]

  let hash = 0
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return colors[Math.abs(hash) % colors.length]
}

// Get optimal font size and truncated title for spine
const getSpineText = (title: string): { text: string; fontSize: string } => {
  const maxLength = 20 // Allow longer titles initially
  const minFontSize = 'text-xs' // 12px
  const maxFontSize = 'text-sm' // 14px

  if (title.length <= 12) {
    return { text: title, fontSize: maxFontSize }
  } else if (title.length <= 16) {
    return { text: title, fontSize: 'text-xs' }
  } else if (title.length <= maxLength) {
    return { text: title, fontSize: 'text-xs' }
  } else {
    // Truncate but try to keep more characters
    const truncated = title.substring(0, maxLength - 3) + '...'
    return { text: truncated, fontSize: 'text-xs' }
  }
}

export function BookshelfView({
  books,
  onBookClick,
  maxBooks = 20,
  showEmptySlots = false,
}: BookshelfViewProps) {
  const displayBooks = books.slice(0, maxBooks)
  const emptySlots = showEmptySlots ? maxBooks - displayBooks.length : 0

  return (
    <div className="relative">
      {/* Wooden bookshelf background */}
      <div className="bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900 rounded-lg p-4 shadow-lg">
        {/* Shelf top */}
        <div className="h-2 bg-gradient-to-r from-amber-600 to-amber-800 rounded-t-lg mb-4 shadow-inner"></div>

        {/* Books container */}
        <div className="flex flex-wrap gap-1 justify-center">
          {displayBooks.map((book, _index) => (
            <div
              key={book._id}
              onClick={() => onBookClick(book)}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105 hover:z-10"
              title={`${book.title} by ${book.author}`}
            >
              {/* Book spine */}
              <div
                className={`
                ${getBookColor(book.title)}
                w-8 h-32 rounded-sm shadow-lg relative overflow-hidden
                transform transition-all duration-200
                group-hover:shadow-xl group-hover:brightness-110
              `}
              >
                {/* Spine text */}
                <div className="absolute inset-0 flex items-center justify-center p-1">
                  <div
                    className={`text-white font-bold leading-tight text-center transform -rotate-90 origin-center whitespace-nowrap ${getSpineText(book.title).fontSize}`}
                  >
                    {getSpineText(book.title).text}
                  </div>
                </div>

                {/* Hover effect - book cover preview */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-bold">
                    📖
                  </div>
                </div>
              </div>

              {/* Book base shadow */}
              <div className="w-8 h-1 bg-black bg-opacity-20 rounded-sm mx-auto mt-1"></div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }, (_, _index) => (
            <div key={`empty-${_index}`} className="group">
              <div className="w-8 h-32 bg-gray-400 bg-opacity-30 rounded-sm shadow-inner border border-gray-500 border-opacity-30 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold transform -rotate-90">
                  {displayBooks.length + _index + 1}
                </span>
              </div>
              <div className="w-8 h-1 bg-gray-400 bg-opacity-30 rounded-sm mx-auto mt-1"></div>
            </div>
          ))}
        </div>

        {/* Shelf bottom */}
        <div className="h-2 bg-gradient-to-r from-amber-600 to-amber-800 rounded-b-lg mt-4 shadow-inner"></div>
      </div>
    </div>
  )
}
