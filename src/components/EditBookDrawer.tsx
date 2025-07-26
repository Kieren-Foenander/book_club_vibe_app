import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { toast } from 'sonner'

interface Book {
  _id: Id<'books'>
  title: string
  author: string
  summary?: string
  coverUrl?: string
  spiceRating: number
  genre?: string
}

interface EditBookDrawerProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

export function EditBookDrawer({ book, isOpen, onClose }: EditBookDrawerProps) {
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)
  const [summary, setSummary] = useState(book.summary || '')
  const [coverUrl, setCoverUrl] = useState(book.coverUrl || '')
  const [spiceRating, setSpiceRating] = useState(book.spiceRating)
  const [genre, setGenre] = useState(book.genre || '')
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const updateBook = useMutation(api.books.updateBook)

  // Reset form when book changes
  useEffect(() => {
    setTitle(book.title)
    setAuthor(book.author)
    setSummary(book.summary || '')
    setCoverUrl(book.coverUrl || '')
    setSpiceRating(book.spiceRating)
    setGenre(book.genre || '')
    setImageError(false)
  }, [book])

  // Handle image loading states
  useEffect(() => {
    if (!coverUrl) {
      setImageError(false)
      setImageLoading(false)
      return
    }

    setImageLoading(true)
    setImageError(false)

    const img = new Image()
    img.onload = () => {
      setImageLoading(false)
      setImageError(false)
    }
    img.onerror = () => {
      setImageLoading(false)
      setImageError(true)
    }
    img.src = coverUrl
  }, [coverUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return

    setIsLoading(true)
    try {
      await updateBook({
        bookId: book._id,
        title: title.trim(),
        author: author.trim(),
        summary: summary.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        spiceRating,
        genre: genre.trim() || undefined,
      })

      toast.success('Book updated successfully! 📖')
      onClose()
    } catch (error) {
      toast.error('Failed to update book')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Edit Book</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/book-cover.jpg"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
            />
            
            {/* Image Preview */}
            {coverUrl && (
              <div className="mt-3">
                <div className="relative w-32 h-48 mx-auto">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                  )}
                  {imageError && (
                    <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-red-500 text-2xl mb-1">⚠️</div>
                        <div className="text-red-600 text-xs">Image failed to load</div>
                      </div>
                    </div>
                  )}
                  {!imageLoading && !imageError && (
                    <img
                      src={coverUrl}
                      alt="Book cover preview"
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                    />
                  )}
                </div>
                {imageError && (
                  <p className="text-red-600 text-sm text-center mt-2">
                    The image URL appears to be invalid or inaccessible
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Fantasy, Romance, Thriller"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of the book..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Spice Level 🌶️
            </label>
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSpiceRating(i + 1)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    i < spiceRating ? 'text-red-500' : 'grayscale'
                  }`}
                >
                  🌶️
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {spiceRating === 1 && 'Mild - Sweet romance'}
              {spiceRating === 2 && 'Warm - Some steamy scenes'}
              {spiceRating === 3 && 'Hot - Regular spicy content'}
              {spiceRating === 4 && 'Very Hot - Frequent spicy scenes'}
              {spiceRating === 5 && 'Fire - Maximum spice level'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !author.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}