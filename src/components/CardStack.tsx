import { motion, AnimatePresence } from 'framer-motion'
import { SwipeableCard } from './SwipeableCard'

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

interface CardStackProps {
  books: Book[]
  onSwipe: (direction: 'left' | 'right') => void
}

export function CardStack({ books, onSwipe }: CardStackProps) {
  const visibleBooks = books.slice(0, 3) // Show top 3 books in stack

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      <AnimatePresence mode="popLayout">
        {visibleBooks.map((book, index) => (
          <motion.div
            key={book._id}
            initial={{
              scale: 0.8,
              opacity: 0,
              y: 50,
              rotateY: -15,
            }}
            animate={{
              scale: 1 - index * 0.05,
              opacity: 1 - index * 0.2,
              y: index * 8,
              rotateY: 0,
            }}
            exit={{
              x: index === 0 ? (Math.random() > 0.5 ? 500 : -500) : 0,
              y: index === 0 ? -200 : 0,
              rotate: index === 0 ? (Math.random() > 0.5 ? 45 : -45) : 0,
              scale: 0.8,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
            }}
            className="absolute inset-0"
          >
            <SwipeableCard book={book} onSwipe={onSwipe} isTop={index === 0} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty state when no cards */}
      {visibleBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-8xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No more books to review!
            </h3>
            <p className="text-gray-600">
              Check back later for new suggestions
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
