import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface JoinClubProps {
  onClose: () => void;
}

export function JoinClub({ onClose }: JoinClubProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const joinClub = useMutation(api.clubs.joinClub);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsLoading(true);
    try {
      await joinClub({ inviteCode: inviteCode.trim().toUpperCase() });
      toast.success("Successfully joined the club! 🎉");
      onClose();
    } catch (error) {
      toast.error("Failed to join club. Check your invite code.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Join a Club</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-shadow font-mono text-center text-lg"
              maxLength={6}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Joining..." : "Join Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
