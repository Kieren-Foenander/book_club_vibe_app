import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CreateClubProps {
  onClose: () => void;
}

export function CreateClub({ onClose }: CreateClubProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createClub = useMutation(api.clubs.createClub);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createClub({ name: name.trim() });
      toast.success("Club created successfully! 🎉");
      onClose();
    } catch (error) {
      toast.error("Failed to create club");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Club</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 mb-2">
              Club Name
            </label>
            <input
              id="clubName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spicy Romance Readers"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-shadow"
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
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
