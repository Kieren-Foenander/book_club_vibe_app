import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface SuggestBookProps {
  clubId: Id<"clubs">;
}

export function SuggestBook({ clubId }: SuggestBookProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [spiceRating, setSpiceRating] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const suggestBook = useMutation(api.books.suggestBook);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setIsLoading(true);
    try {
      await suggestBook({
        clubId,
        title: title.trim(),
        author: author.trim(),
        summary: summary.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        spiceRating,
      });
      
      toast.success("Book suggested! 🎉 It's now in the voting queue.");
      
      // Reset form
      setTitle("");
      setAuthor("");
      setSummary("");
      setCoverUrl("");
      setSpiceRating(1);
    } catch (error) {
      toast.error("Failed to suggest book");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Suggest a Book</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
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
            <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 mb-2">
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
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
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
                    i < spiceRating ? "text-red-500" : "text-gray-300"
                  }`}
                >
                  🌶️
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {spiceRating === 1 && "Mild - Sweet romance"}
              {spiceRating === 2 && "Warm - Some steamy scenes"}
              {spiceRating === 3 && "Hot - Regular spicy content"}
              {spiceRating === 4 && "Very Hot - Frequent spicy scenes"}
              {spiceRating === 5 && "Fire - Maximum spice level"}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim() || !author.trim()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Suggesting..." : "🚀 Suggest Book"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be honest with your spice rating - it helps everyone!</li>
            <li>• A good summary helps others decide if they're interested</li>
            <li>• Books need 100% approval from all members to make it to TBR</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
