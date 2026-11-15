import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("mark past events as ended", { hours: 1 }, internal.events.markEnded, {});

export default crons;
