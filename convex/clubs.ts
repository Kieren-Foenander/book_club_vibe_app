import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a random 6-character invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createClub = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a club");
    }

    const inviteCode = generateInviteCode();
    
    const clubId = await ctx.db.insert("clubs", {
      name: args.name,
      adminId: userId,
      inviteCode,
      createdAt: Date.now(),
    });

    // Add the creator as the first member
    await ctx.db.insert("clubMembers", {
      clubId,
      userId,
      joinedAt: Date.now(),
    });

    return clubId;
  },
});

export const joinClub = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to join a club");
    }

    const club = await ctx.db
      .query("clubs")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!club) {
      throw new Error("Invalid invite code");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", userId))
      .unique();

    if (existingMembership) {
      throw new Error("You are already a member of this club");
    }

    await ctx.db.insert("clubMembers", {
      clubId: club._id,
      userId,
      joinedAt: Date.now(),
    });

    return club._id;
  },
});

export const getUserClubs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("clubMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const clubs = await Promise.all(
      memberships.map(async (membership) => {
        const club = await ctx.db.get(membership.clubId);
        if (!club) return null;
        
        const admin = await ctx.db.get(club.adminId);
        const memberCount = await ctx.db
          .query("clubMembers")
          .withIndex("by_club", (q) => q.eq("clubId", club._id))
          .collect();

        return {
          ...club,
          adminName: admin?.name || "Unknown User",
          memberCount: memberCount.length,
          isAdmin: club.adminId === userId,
        };
      })
    );

    return clubs.filter(Boolean);
  },
});

export const getClubDetails = query({
  args: {
    clubId: v.id("clubs"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this club");
    }

    const club = await ctx.db.get(args.clubId);
    if (!club) {
      throw new Error("Club not found");
    }

    const members = await ctx.db
      .query("clubMembers")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          name: user?.name || "Unknown User",
          isAdmin: club.adminId === member.userId,
        };
      })
    );

    return {
      ...club,
      members: memberDetails,
      isAdmin: club.adminId === userId,
    };
  },
});
