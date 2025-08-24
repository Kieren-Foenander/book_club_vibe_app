import { useSwipeable } from 'react-swipeable'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'

interface Book {
  _id: string
  title: string
  author: string
  genre?: string
  coverUrl?: string
  summary?: string
  spiceRating?: number
  suggesterName?: string
}

interface SwipeableCardProps {
  book: Book
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeableCard({ book, onSwipe, isTop }: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hasSwiped, setHasSwiped] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Transform values for visual feedback
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const scale = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.9, 0.95, 1, 0.95, 0.9]
  )
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 0.8, 1, 0.8, 0.5]
  )

  // Approval/rejection indicators
  const approvalOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const rejectionOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 100

    if (info.offset.x > threshold) {
      // Swipe right - approve
      setHasSwiped(true)
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      // Swipe left - reject
      setHasSwiped(true)
      onSwipe('left')
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setHasSwiped(true)
      onSwipe('left')
    },
    onSwipedRight: () => {
      setHasSwiped(true)
      onSwipe('right')
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  // If card has been swiped, don't allow further interaction
  if (hasSwiped) {
    return null
  }

  return (
    <motion.div
      {...handlers}
      style={{
        x,
        y,
        rotate,
        scale,
        opacity: isTop ? opacity : 0.8,
        zIndex: isTop ? 10 : 1,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className={`absolute w-full h-full ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-full">
        {/* Book Cover */}
        <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">📚</span>
            </div>
          )}

          {/* Swipe indicators */}
          <motion.div
            style={{ opacity: approvalOpacity }}
            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12"
          >
            👍 APPROVE
          </motion.div>

          <motion.div
            style={{ opacity: rejectionOpacity }}
            className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg transform -rotate-12"
          >
            👎 PASS
          </motion.div>
        </div>

        {/* Book Info */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-600 mb-3 text-lg">by {book.author}</p>

          {book.genre && (
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
              {book.genre}
            </span>
          )}

          <p className="text-sm text-gray-500 mb-4">
            Suggested by {book.suggesterName}
          </p>

          {/* Spice Level */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500 font-medium">
              Spice Level:
            </span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={
                    i < (book.spiceRating ?? 0)
                      ? 'text-red-500 text-lg'
                      : 'grayscale text-lg'
                  }
                >
                  🌶️
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          {book.summary && (
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {book.summary}
            </p>
          )}
        </div>

        {/* Swipe Instructions */}
        {isTop && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            Swipe right to approve • Swipe left to pass
          </div>
        )}
      </div>
    </motion.div>
  )
}
