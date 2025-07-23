import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
  useQuery as useConvexQuery,
} from 'convex/react'
import { api } from '../convex/_generated/api'
import { SignInForm } from './SignInForm'
import { SignOutButton } from './SignOutButton'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { ClubList } from './components/ClubList'
import { CreateClub } from './components/CreateClub'
import { JoinClub } from './components/JoinClub'
import { Bookshelf } from './components/Bookshelf'
import { NameChecker } from './components/NameChecker'
import { Id } from '../convex/_generated/dataModel'
import { subscribeUserToPush } from './lib/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function App() {
  const [currentView, setCurrentView] = useState<'clubs' | 'bookshelf'>('clubs')
  const [selectedClubId, setSelectedClubId] = useState<Id<'clubs'> | null>(null)
  const [showManageClubs, setShowManageClubs] = useState(false)

  // Add QueryClient initialization
  const [queryClient] = useState(() => new QueryClient())

  const handleClubSelect = (clubId: Id<'clubs'>) => {
    setSelectedClubId(clubId)
    setCurrentView('bookshelf')
    setShowManageClubs(false)
  }

  const handleBackToClubs = () => {
    setCurrentView('clubs')
    setSelectedClubId(null)
    setShowManageClubs(false)
  }

  const savePushSubscription = useMutation(api.books.savePushSubscription)
  const user = useQuery(api.auth.loggedInUser)
  const userClubs = useConvexQuery(api.clubs.getUserClubs)

  // Auto-open bookshelf if only one club
  useEffect(() => {
    if (userClubs != null && userClubs.length === 1 && user) {
      const onlyClub = userClubs[0]
      if (onlyClub) {
        setSelectedClubId(onlyClub._id)
        setCurrentView('bookshelf')
      }
    }
  }, [userClubs, user])

  useEffect(() => {
    if (!user) return
    void subscribeUserToPush()
      .then((subscription) => {
        if (subscription && subscription.toJSON().keys) {
          void savePushSubscription({
            subscription: {
              endpoint: subscription.endpoint,
              keys: subscription.toJSON().keys as {
                p256dh: string
                auth: string
              },
            },
          })
        }
      })
      .catch(() => {})
  }, [user, savePushSubscription])

  // Determine if back button should be shown
  const showBackButton =
    currentView === 'bookshelf' && userClubs && userClubs.length > 1

  // Show manage clubs button always (but subtle)
  const handleManageClubs = () => {
    setCurrentView('clubs')
    setSelectedClubId(null)
    setShowManageClubs(false)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBackToClubs}
                className="text-pink-400 hover:text-pink-600 text-sm font-normal opacity-60 px-1"
                style={{ fontSize: '1rem' }}
                aria-label="Back to clubs"
              >
                ← Back
              </button>
            )}
            <h2 className="text-xl font-bold text-pink-600">📚 Book Club</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManageClubs}
              className="text-gray-400 hover:text-pink-500 text-xs px-2 py-1 rounded transition-colors border border-transparent hover:border-pink-200"
              style={{ fontSize: '0.85rem' }}
              aria-label="Manage clubs"
            >
              Manage Clubs
            </button>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 p-4">
          <Authenticated>
            <NameChecker>
              {currentView === 'clubs' ? (
                <ClubsView onClubSelect={handleClubSelect} />
              ) : selectedClubId ? (
                <Bookshelf clubId={selectedClubId} />
              ) : null}
            </NameChecker>
          </Authenticated>

          <Unauthenticated>
            <div className="max-w-md mx-auto mt-20">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-pink-600 mb-4">
                  📚✨ Book Club
                </h1>
                <p className="text-lg text-gray-600">
                  Your private space for spicy book discussions
                </p>
              </div>
              <SignInForm />
            </div>
          </Unauthenticated>
        </main>

        <Toaster position="top-center" />
      </div>
    </QueryClientProvider>
  )
}

function ClubsView({
  onClubSelect,
}: {
  onClubSelect: (clubId: Id<'clubs'>) => void
}) {
  const [showCreateClub, setShowCreateClub] = useState(false)
  const [showJoinClub, setShowJoinClub] = useState(false)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Your Book Clubs
        </h1>
        <p className="text-gray-600">Select a club to view your bookshelf</p>
      </div>

      <ClubList onClubSelect={onClubSelect} />

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => setShowCreateClub(true)}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
        >
          Create New Club
        </button>
        <button
          onClick={() => setShowJoinClub(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Join Club
        </button>
      </div>

      {showCreateClub && (
        <CreateClub onClose={() => setShowCreateClub(false)} />
      )}

      {showJoinClub && <JoinClub onClose={() => setShowJoinClub(false)} />}
    </div>
  )
}
