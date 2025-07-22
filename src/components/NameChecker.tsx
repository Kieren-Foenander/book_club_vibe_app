import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface NameCheckerProps {
  children: React.ReactNode;
}

export function NameChecker({ children }: NameCheckerProps) {
  const user = useQuery(api.auth.loggedInUser);
  const updateUserName = useMutation(api.auth.updateUserName);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateUserName({ name: name.trim() });
      toast.success("Welcome! Your name has been saved 🎉");
    } catch (error) {
      toast.error("Failed to save name");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user?.name || user.name.trim() === "") {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Book Club!</h2>
            <p className="text-gray-600">Let's get to know you better. What should we call you?</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full px-4 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
