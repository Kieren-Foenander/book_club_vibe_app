/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useRef, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface SuggestBookProps {
  clubId: Id<'clubs'>
}

// Types for Open Library API responses
interface OLSearchDoc {
  key: string // e.g. '/works/OL45804W'
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
}
interface OLSearchResponse {
  docs: OLSearchDoc[]
}
interface OLWorkDetails {
  title: string
  description?: string | { value: string }
  covers?: number[]
  subjects?: string[]
  authors?: { author: { key: string } }[]
}

export function SuggestBook({ clubId }: SuggestBookProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [summary, setSummary] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [spiceRating, setSpiceRating] = useState(1)
  const [genre, setGenre] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  // Dropdown and search state
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [debouncedTitle, setDebouncedTitle] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Add a constant for Open Library headers
  const OL_HEADERS = new Headers({
    'User-Agent': 'BookClub/1.0 (kfoenander98@gmail.com)',
  })

  // Debounce title input
  useEffect(() => {
    if (title.trim().length < 4) {
      setDebouncedTitle('')
      setShowDropdown(false)
      return
    }
    const handler = setTimeout(() => {
      setDebouncedTitle(title.trim())
    }, 500)
    return () => clearTimeout(handler)
  }, [title])

  // Search Open Library
  const {
    data: searchData,
    isFetching: isSearching,
    error: searchError,
  } = useQuery<OLSearchResponse>({
    queryKey: ['ol-search', debouncedTitle],
    queryFn: async () => {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(
          debouncedTitle
        )}&limit=8`,
        { headers: OL_HEADERS }
      )
      if (!res.ok) throw new Error('Failed to fetch Open Library')
      return res.json()
    },
    enabled: !!debouncedTitle,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  // Fetch work details
  const { data: workDetails, isFetching: isFetchingWork } =
    useQuery<OLWorkDetails>({
      queryKey: ['ol-work', searchData?.docs[selectedIndex]?.key],
      queryFn: async () => {
        const workKey = searchData?.docs[selectedIndex]?.key
        if (!workKey) throw new Error('No work key')
        const res = await fetch(`https://openlibrary.org${workKey}.json`, {
          headers: OL_HEADERS,
        })
        if (!res.ok) throw new Error('Failed to fetch work details')
        return res.json()
      },
      enabled: selectedIndex >= 0 && !!searchData?.docs[selectedIndex]?.key,
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 20,
    })

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

  // Autofill fields when workDetails changes
  useEffect(() => {
    if (!workDetails) return
    setTitle(workDetails.title || '')
    setSummary(
      typeof workDetails.description === 'string'
        ? workDetails.description
        : workDetails.description?.value || ''
    )
    // Prefer workDetails.covers, but fallback to search result's cover_i
    if (workDetails.covers && workDetails.covers.length > 0) {
      setCoverUrl(
        `https://covers.openlibrary.org/b/id/${workDetails.covers[0]}-L.jpg`
      )
    } else if (searchData?.docs[selectedIndex]?.cover_i) {
      setCoverUrl(
        `https://covers.openlibrary.org/b/id/${searchData.docs[selectedIndex].cover_i}-L.jpg`
      )
    }
    setGenre(workDetails.subjects?.[0] || '')
    // Autofill author from search result if available
    if (searchData?.docs[selectedIndex]?.author_name?.length) {
      setAuthor(searchData.docs[selectedIndex].author_name.join(', '))
    }
    setShowDropdown(false)
  }, [workDetails, searchData, selectedIndex])

  // Handle dropdown selection
  const handleDropdownSelect = (idx: number) => {
    setSelectedIndex(idx)
    // Prefetch work details for snappy UX
    const workKey = searchData?.docs[idx]?.key
    if (workKey) {
      void queryClient.prefetchQuery({
        queryKey: ['ol-work', workKey],
        queryFn: async () => {
          const res = await fetch(`https://openlibrary.org${workKey}.json`, {
            headers: OL_HEADERS,
          })
          if (!res.ok) throw new Error('Failed to fetch work details')
          return res.json()
        },
      })
    }
  }

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!showDropdown || !searchData?.docs) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) =>
          prev < searchData.docs.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchData.docs.length - 1
        )
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        handleDropdownSelect(selectedIndex)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDropdown, searchData, selectedIndex])

  // Show dropdown when search results are available
  useEffect(() => {
    if (searchData?.docs && searchData.docs.length > 0 && debouncedTitle) {
      setShowDropdown(true)
      setSelectedIndex(-1)
    } else {
      setShowDropdown(false)
    }
  }, [searchData, debouncedTitle])

  // Hide dropdown on blur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const suggestBook = useMutation(api.books.suggestBook)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return

    setIsLoading(true)
    try {
      await suggestBook({
        clubId,
        title: title.trim(),
        author: author.trim(),
        summary: summary.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        spiceRating,
        genre: genre.trim() || undefined,
      })

      toast.success("Book suggested! 🎉 It's now in the voting queue.")

      // Reset form
      setTitle('')
      setAuthor('')
      setSummary('')
      setCoverUrl('')
      setSpiceRating(1)
      setGenre('')
    } catch (error) {
      toast.error('Failed to suggest book')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📚 Suggest a Book
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Book Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the book title"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
              required
              autoComplete="off"
              onFocus={() => {
                if (searchData?.docs && searchData.docs.length > 0)
                  setShowDropdown(true)
              }}
            />
            {/* Dropdown */}
            {showDropdown && searchData?.docs && (
              <div
                ref={dropdownRef}
                className="absolute z-20 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-72 overflow-y-auto"
              >
                {isSearching && (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                )}
                {searchError && (
                  <div className="p-4 text-center text-red-500">
                    Error searching books
                  </div>
                )}
                {searchData.docs.map((doc, idx) => (
                  <div
                    key={doc.key}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-green-50 ${
                      idx === selectedIndex ? 'bg-green-100' : ''
                    }`}
                    onMouseDown={() => handleDropdownSelect(idx)}
                  >
                    {doc.cover_i ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`}
                        alt="cover"
                        className="w-10 h-14 object-cover rounded shadow"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Cover
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">
                        {doc.title}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {doc.author_name?.join(', ') || 'Unknown Author'}
                      </div>
                      {doc.first_publish_year && (
                        <div className="text-xs text-gray-400">
                          {doc.first_publish_year}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author *
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter the author's name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
              required
            />
          </div>

          <div>
            <label
              htmlFor="coverUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Image URL (optional)
            </label>
            <input
              id="coverUrl"
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/book-cover.jpg"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
            />
            
            {/* Image Preview */}
            {coverUrl && (
              <div className="mt-3">
                <div className="relative w-32 h-48 mx-auto">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Genre (optional)
            </label>
            <input
              id="genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Fantasy, Romance, Thriller"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Summary (optional)
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of the book..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-shadow resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Spice-o-Meter Rating * 🌶️
            </label>
            <div className="flex gap-2">
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
            <div className="mt-2 text-sm text-gray-600">
              {spiceRating === 1 && 'Mild - Sweet romance'}
              {spiceRating === 2 && 'Warm - Some steamy scenes'}
              {spiceRating === 3 && 'Hot - Regular spicy content'}
              {spiceRating === 4 && 'Very Hot - Frequent spicy scenes'}
              {spiceRating === 5 && 'Fire - Maximum spice level'}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim() || !author.trim()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Suggesting...' : '🚀 Suggest Book'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be honest with your spice rating - it helps everyone!</li>
            <li>• A good summary helps others decide if they're interested</li>
            <li>
              • Books need 100% approval from all members to make it to TBR
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
