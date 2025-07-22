import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const suggestBook = mutation({
  args: {
    clubId: v.id("clubs"),
    title: v.string(),
    author: v.string(),
    summary: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    spiceRating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Verify user is a member of the club
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this club");
    }

    const bookId = await ctx.db.insert("books", {
      clubId: args.clubId,
      title: args.title,
      author: args.author,
      summary: args.summary,
      coverUrl: args.coverUrl,
      spiceRating: args.spiceRating,
      suggestedBy: userId,
      status: "pending",
      suggestedAt: Date.now(),
    });

    return bookId;
  },
});

export const getPendingBooks = query({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify membership
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      return [];
    }

    const pendingBooks = await ctx.db
      .query("books")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "pending"))
      .collect();

    const booksWithDetails = await Promise.all(
      pendingBooks.map(async (book) => {
        const suggester = await ctx.db.get(book.suggestedBy);
        const userVote = await ctx.db
          .query("votes")
          .withIndex("by_book_and_user", (q) => q.eq("bookId", book._id).eq("userId", userId))
          .unique();

        const allVotes = await ctx.db
          .query("votes")
          .withIndex("by_book", (q) => q.eq("bookId", book._id))
          .collect();

        return {
          ...book,
          suggesterName: suggester?.name || "Unknown User",
          userVote: userVote?.vote || null,
          voteCount: allVotes.length,
          approvalCount: allVotes.filter(v => v.vote === "approve").length,
          vetoCount: allVotes.filter(v => v.vote === "veto").length,
        };
      })
    );

    return booksWithDetails;
  },
});

export const voteOnBook = mutation({
  args: {
    bookId: v.id("books"),
    vote: v.union(v.literal("approve"), v.literal("veto")),
    vetoReason: v.optional(v.union(
      v.literal("already_read"),
      v.literal("not_for_me"),
      v.literal("not_interested")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    // Verify membership
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", book.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this club");
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_book_and_user", (q) => q.eq("bookId", args.bookId).eq("userId", userId))
      .unique();

    if (existingVote) {
      // Update existing vote
      await ctx.db.patch(existingVote._id, {
        vote: args.vote,
        vetoReason: args.vetoReason,
        votedAt: Date.now(),
      });
    } else {
      // Create new vote
      await ctx.db.insert("votes", {
        bookId: args.bookId,
        userId,
        clubId: book.clubId,
        vote: args.vote,
        vetoReason: args.vetoReason,
        votedAt: Date.now(),
      });
    }

    // Check if all members have voted and update book status
    const allMembers = await ctx.db
      .query("clubMembers")
      .withIndex("by_club", (q) => q.eq("clubId", book.clubId))
      .collect();

    const allVotes = await ctx.db
      .query("votes")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    if (allVotes.length === allMembers.length) {
      const hasVeto = allVotes.some(vote => vote.vote === "veto");
      const newStatus = hasVeto ? "rejected" : "approved";

      await ctx.db.patch(args.bookId, {
        status: newStatus,
      });
    }

    return true;
  },
});

export const getBookshelf = query({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Verify membership
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      return null;
    }

    // Get current book
    const currentBooks = await ctx.db
      .query("books")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "current"))
      .collect();

    // Get TBR books
    const tbrBooks = await ctx.db
      .query("books")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "approved"))
      .collect();

    // Get completed books
    const completedBooks = await ctx.db
      .query("books")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "completed"))
      .order("desc")
      .collect();

    // Get progress for current book
    let currentBookProgress = null;
    if (currentBooks.length > 0) {
      const progressData = await ctx.db
        .query("progress")
        .withIndex("by_book", (q) => q.eq("bookId", currentBooks[0]._id))
        .collect();

      const userProgress = progressData.find(p => p.userId === userId);

      currentBookProgress = {
        book: currentBooks[0],
        userProgress: userProgress?.currentPage || 0,
        totalPages: userProgress?.totalPages || 0,
        allProgress: await Promise.all(
          progressData.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            return {
              userName: user?.name || "Unknown User",
              currentPage: p.currentPage,
              percentage: p.totalPages ? Math.round((p.currentPage / p.totalPages) * 100) : 0,
            };
          })
        ),
      };
    }

    // Get ratings for completed books
    const completedBooksWithRatings = await Promise.all(
      completedBooks.map(async (book) => {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_book", (q) => q.eq("bookId", book._id))
          .collect();

        const avgRatings = {
          storyline: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.storylineRating, 0) / ratings.length : 0,
          characters: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.charactersRating, 0) / ratings.length : 0,
          spice: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.spiceRating, 0) / ratings.length : 0,
        };

        return {
          ...book,
          avgRatings,
          ratingCount: ratings.length,
        };
      })
    );

    return {
      currentBook: currentBookProgress,
      tbrBooks,
      completedBooks: completedBooksWithRatings,
    };
  },
});

export const selectNextBook = mutation({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const club = await ctx.db.get(args.clubId);
    if (!club || club.adminId !== userId) {
      throw new Error("Only the club admin can select the next book");
    }

    // Get all approved books
    const approvedBooks = await ctx.db
      .query("books")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "approved"))
      .collect();

    if (approvedBooks.length === 0) {
      throw new Error("No approved books available");
    }

    // Mark current book as completed if exists
    const currentBooks = await ctx.db
      .query("books")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "current"))
      .collect();

    for (const book of currentBooks) {
      await ctx.db.patch(book._id, {
        status: "completed",
        completedAt: Date.now(),
      });
    }

    // Randomly select a book from approved books
    const selectedBook = approvedBooks[Math.floor(Math.random() * approvedBooks.length)];

    await ctx.db.patch(selectedBook._id, {
      status: "current",
      selectedAt: Date.now(),
    });

    return selectedBook;
  },
});

export const updateProgress = mutation({
  args: {
    bookId: v.id("books"),
    currentPage: v.number(),
    totalPages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    // Verify membership
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", book.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this club");
    }

    const existingProgress = await ctx.db
      .query("progress")
      .withIndex("by_book_and_user", (q) => q.eq("bookId", args.bookId).eq("userId", userId))
      .unique();

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        currentPage: args.currentPage,
        totalPages: args.totalPages || existingProgress.totalPages,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("progress", {
        bookId: args.bookId,
        userId,
        clubId: book.clubId,
        currentPage: args.currentPage,
        totalPages: args.totalPages,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

export const rateBook = mutation({
  args: {
    bookId: v.id("books"),
    storylineRating: v.number(),
    charactersRating: v.number(),
    spiceRating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    // Verify membership
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", book.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this club");
    }

    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_book_and_user", (q) => q.eq("bookId", args.bookId).eq("userId", userId))
      .unique();

    if (existingRating) {
      await ctx.db.patch(existingRating._id, {
        storylineRating: args.storylineRating,
        charactersRating: args.charactersRating,
        spiceRating: args.spiceRating,
        ratedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("ratings", {
        bookId: args.bookId,
        userId,
        clubId: book.clubId,
        storylineRating: args.storylineRating,
        charactersRating: args.charactersRating,
        spiceRating: args.spiceRating,
        ratedAt: Date.now(),
      });
    }

    return true;
  },
});

export const getBookReviews = query({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    // Fetch all ratings for the book
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    // Fetch reviewer info for each rating
    const reviewsWithUser = await Promise.all(
      ratings.map(async (rating) => {
        const user = await ctx.db.get(rating.userId);
        return {
          userId: rating.userId,
          userName: user?.name || "Unknown User",
          storylineRating: rating.storylineRating,
          charactersRating: rating.charactersRating,
          spiceRating: rating.spiceRating,
          ratedAt: rating.ratedAt,
        };
      })
    );

    return reviewsWithUser;
  },
});
