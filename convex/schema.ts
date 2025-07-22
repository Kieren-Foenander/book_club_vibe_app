import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  clubs: defineTable({
    name: v.string(),
    adminId: v.id("users"),
    inviteCode: v.string(),
    createdAt: v.number(),
  }).index("by_invite_code", ["inviteCode"]),

  clubMembers: defineTable({
    clubId: v.id("clubs"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_user", ["userId"])
    .index("by_club_and_user", ["clubId", "userId"]),

  books: defineTable({
    clubId: v.id("clubs"),
    title: v.string(),
    author: v.string(),
    summary: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    spiceRating: v.number(), // 1-5 chilis
    suggestedBy: v.id("users"),
    status: v.union(
      v.literal("pending"), // waiting for votes
      v.literal("approved"), // 100% approval, in TBR
      v.literal("rejected"), // at least one veto
      v.literal("current"), // currently reading
      v.literal("completed") // finished reading
    ),
    suggestedAt: v.number(),
    selectedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_club", ["clubId"])
    .index("by_club_and_status", ["clubId", "status"])
    .index("by_suggested_by", ["suggestedBy"]),

  votes: defineTable({
    bookId: v.id("books"),
    userId: v.id("users"),
    clubId: v.id("clubs"),
    vote: v.union(v.literal("approve"), v.literal("veto")),
    vetoReason: v.optional(v.union(
      v.literal("already_read"),
      v.literal("not_for_me"),
      v.literal("not_interested")
    )),
    votedAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_user", ["userId"])
    .index("by_book_and_user", ["bookId", "userId"]),

  ratings: defineTable({
    bookId: v.id("books"),
    userId: v.id("users"),
    clubId: v.id("clubs"),
    storylineRating: v.number(), // 1-5 stars
    charactersRating: v.number(), // 1-5 hearts
    spiceRating: v.number(), // 1-5 chilis
    ratedAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_user", ["userId"])
    .index("by_book_and_user", ["bookId", "userId"]),

  progress: defineTable({
    bookId: v.id("books"),
    userId: v.id("users"),
    clubId: v.id("clubs"),
    currentPage: v.number(),
    totalPages: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_user", ["userId"])
    .index("by_book_and_user", ["bookId", "userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
