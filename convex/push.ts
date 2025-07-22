"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import webpush from "web-push";

export const sendPushNotification = internalAction({
    args: {
        subscription: v.object({
            endpoint: v.string(),
            keys: v.object({
                p256dh: v.string(),
                auth: v.string(),
            }),
        }),
        payload: v.string(),
        subId: v.optional(v.id("pushSubscriptions")),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
        const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) throw new Error("VAPID keys not set in env");
        webpush.setVapidDetails(
            "mailto:no-reply@bookclubvibe.com",
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );
        try {
            await webpush.sendNotification(args.subscription, args.payload);
            if (args.subId) {
                await ctx.runMutation(internal.books.updatePushSubTime, { subId: args.subId });
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    },
});

export const dailyBookReviewSummary = internalAction({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        // Get all push subscriptions
        const allSubs = await ctx.runQuery(internal.books.getAllPushSubscriptions, {});
        for (const sub of allSubs) {
            const memberships = await ctx.runQuery(internal.books.getUserClubMemberships, { userId: sub.userId });
            let newBooksCount = 0;
            for (const membership of memberships) {
                const books = await ctx.runQuery(internal.books.getPendingBooksForClub, { clubId: membership.clubId });
                for (const book of books) {
                    if (!sub.updatedAt || book.suggestedAt > sub.updatedAt) {
                        newBooksCount++;
                    }
                }
            }
            if (newBooksCount > 0) {
                const payload = JSON.stringify({
                    title: "Book Club",
                    body: `You have ${newBooksCount} new books to review!`,
                });
                await ctx.runAction(internal.push.sendPushNotification, {
                    subscription: sub.subscription,
                    payload,
                    subId: sub._id,
                });
            }
        }
        return null;
    },
}); 