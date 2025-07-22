import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { CurrentlyReading } from "./CurrentlyReading";
import { TBRSection } from "./TBRSection";
import { PastReads } from "./PastReads";
import { VotingQueue } from "./VotingQueue";
import { SuggestBook } from "./SuggestBook";

interface BookshelfProps {
  clubId: Id<"clubs">;
}

export function Bookshelf({ clubId }: BookshelfProps) {
  const [activeTab, setActiveTab] = useState<"bookshelf" | "voting" | "suggest">("bookshelf");
  const bookshelf = useQuery(api.books.getBookshelf, { clubId });
  const pendingBooks = useQuery(api.books.getPendingBooks, { clubId });
  const clubDetails = useQuery(api.clubs.getClubDetails, { clubId });

  if (bookshelf === undefined || clubDetails === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const pendingCount = pendingBooks?.filter(book => !book.userVote).length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{clubDetails.name}</h1>
        <p className="text-gray-600">{clubDetails.members.length} members</p>
      </div>

      {/* Tab Navigation - Fixed wrapping */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200 inline-flex">
          <button
            onClick={() => setActiveTab("bookshelf")}
            className={`px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === "bookshelf"
                ? "bg-pink-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="sm:inline">📚 Bookshelf</span>
          </button>
          <button
            onClick={() => setActiveTab("voting")}
            className={`px-4 sm:px-6 py-2 rounded-md font-medium transition-colors relative text-sm sm:text-base whitespace-nowrap ${
              activeTab === "voting"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="sm:inline">🗳️ Voting</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("suggest")}
            className={`px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === "suggest"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="sm:inline">➕ Suggest</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "bookshelf" && bookshelf && (
        <div className="space-y-8">
          <CurrentlyReading 
            currentBook={bookshelf.currentBook} 
            clubId={clubId}
            isAdmin={clubDetails.isAdmin}
          />
          <TBRSection books={bookshelf.tbrBooks} clubId={clubId} isAdmin={clubDetails.isAdmin} />
          <PastReads books={bookshelf.completedBooks} clubId={clubId} />
        </div>
      )}

      {activeTab === "voting" && (
        <VotingQueue clubId={clubId} />
      )}

      {activeTab === "suggest" && (
        <SuggestBook clubId={clubId} />
      )}
    </div>
  );
}
