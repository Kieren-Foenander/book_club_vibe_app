import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface ClubListProps {
  onClubSelect: (clubId: Id<"clubs">) => void;
}

export function ClubList({ onClubSelect }: ClubListProps) {
  const clubs = useQuery(api.clubs.getUserClubs);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyInviteCode = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent club selection when clicking copy
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Invite code copied! 📋");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error("Failed to copy invite code");
    }
  };

  if (clubs === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No clubs yet!</h3>
        <p className="text-gray-500">Create your first book club or join an existing one</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {clubs.filter(club => club !== null).map((club) => (
        <div
          key={club._id}
          onClick={() => onClubSelect(club._id)}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{club.name}</h3>
              <p className="text-gray-600 mb-2">Admin: {club.adminName}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👥 {club.memberCount} members</span>
                {club.isAdmin && (
                  <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="text-2xl">📖</div>
          </div>
          
          {club.isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">
                Invite code:
              </p>
              <button
                onClick={(e) => copyInviteCode(club.inviteCode, e)}
                className="flex items-center gap-2 font-mono bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors group"
              >
                <span className="font-semibold">{club.inviteCode}</span>
                <span className="text-gray-500 group-hover:text-gray-700">
                  {copiedCode === club.inviteCode ? "✓" : "📋"}
                </span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
