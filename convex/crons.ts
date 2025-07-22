import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
// 11:00 UTC every day ("0 11 * * *")
crons.cron(
    "daily book review summary",
    "0 11 * * *",
    internal.push.dailyBookReviewSummary,
    {}
);

export default crons; 