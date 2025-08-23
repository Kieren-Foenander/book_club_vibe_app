/* eslint-disable @typescript-eslint/no-misused-promises */
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useState } from 'react'

interface SuggestedBooksOverviewProps {
  clubId: Id<'clubs'>
}

export function SuggestedBooksOverview({ clubId }: SuggestedBooksOverviewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const allSuggestedBooks = useQuery(api.books.getAllSuggestedBooks, { clubId })

  if (allSuggestedBooks === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const filteredBooks = filterStatus === 'all' 
    ? allSuggestedBooks 
    : allSuggestedBooks.filter(book => book.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'current': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      case 'current': return '📖'
      case 'completed': return '🎉'
      default: return '📚'
    }
  }

  const getVetoReasonText = (reason: string) => {
    switch (reason) {
      case 'already_read': return 'Already read'
      case 'not_for_me': return 'Not for me (Spice/Theme)'
      case 'not_interested': return 'Not interested'
      default: return reason
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 All Suggestions</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'All'}
              {status === 'pending' && '⏳ Pending'}
              {status === 'approved' && '✅ Approved'}
              {status === 'rejected' && '❌ Rejected'}
            </button>
          ))}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500">
            {filterStatus === 'all' 
              ? 'No books have been suggested yet'
              : `No ${filterStatus} books found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📚</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm">by {book.author}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                        {getStatusIcon(book.status)} {book.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>Suggested by {book.suggesterName}</span>
                    <span>•</span>
                    <span>{new Date(book.suggestedAt).toLocaleDateString()}</span>
                    {book.genre && (
                      <>
                        <span>•</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {book.genre}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Spice Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">Spice:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={i < book.spiceRating ? 'text-red-500' : 'grayscale'}
                        >
                          🌶️
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Vote Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{book.approvalCount}</div>
                      <div className="text-gray-500">Approvals</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{book.vetoCount}</div>
                      <div className="text-gray-500">Vetoes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">{book.pendingVotes}</div>
                      <div className="text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{book.votePercentage}%</div>
                      <div className="text-gray-500">Voted</div>
                    </div>
                  </div>

                  {/* Veto Reasons for Rejected Books */}
                  {book.status === 'rejected' && book.vetoReasons && book.vetoReasons.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-800 mb-1">Veto Reasons:</div>
                      <div className="flex flex-wrap gap-1">
                        {book.vetoReasons.map((reason, index) => (
                          <span
                            key={index}
                            className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded"
                          >
                            {getVetoReasonText(reason)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar for Pending Books */}
                  {book.status === 'pending' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Voting Progress</span>
                        <span>{book.totalVotes}/{book.totalMembers} members</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${book.votePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}