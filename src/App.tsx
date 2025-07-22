import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ClubList } from "./components/ClubList";
import { CreateClub } from "./components/CreateClub";
import { JoinClub } from "./components/JoinClub";
import { Bookshelf } from "./components/Bookshelf";
import { NameChecker } from "./components/NameChecker";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentView, setCurrentView] = useState<"clubs" | "bookshelf">("clubs");
  const [selectedClubId, setSelectedClubId] = useState<Id<"clubs"> | null>(null);

  const handleClubSelect = (clubId: Id<"clubs">) => {
    setSelectedClubId(clubId);
    setCurrentView("bookshelf");
  };

  const handleBackToClubs = () => {
    setCurrentView("clubs");
    setSelectedClubId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-3">
          {currentView === "bookshelf" && (
            <button
              onClick={handleBackToClubs}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              ← Back
            </button>
          )}
          <h2 className="text-xl font-bold text-pink-600">📚 Book Club</h2>
        </div>
        <SignOutButton />
      </header>
      
      <main className="flex-1 p-4">
        <Authenticated>
          <NameChecker>
            {currentView === "clubs" ? (
              <ClubsView onClubSelect={handleClubSelect} />
            ) : selectedClubId ? (
              <Bookshelf clubId={selectedClubId} />
            ) : null}
          </NameChecker>
        </Authenticated>
        
        <Unauthenticated>
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-pink-600 mb-4">📚✨ Book Club Vibe</h1>
              <p className="text-lg text-gray-600">Your private space for spicy book discussions</p>
            </div>
            <SignInForm />
          </div>
        </Unauthenticated>
      </main>
      
      <Toaster />
    </div>
  );
}

function ClubsView({ onClubSelect }: { onClubSelect: (clubId: Id<"clubs">) => void }) {
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showJoinClub, setShowJoinClub] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Book Clubs</h1>
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

      {showJoinClub && (
        <JoinClub onClose={() => setShowJoinClub(false)} />
      )}
    </div>
  );
}
