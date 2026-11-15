import { v } from "convex/values";
import { internalAction } from "./_generated/server";

/** Sends Expo push notifications (https://docs.expo.dev/push-notifications/sending-notifications/). */
export const send = internalAction({
  args: {
    tokens: v.array(v.string()),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (_ctx, { tokens, title, body, data }) => {
    const messages = tokens
      .filter((t) => /^Expo(nent)?PushToken\[.+\]$/.test(t))
      .map((to) => ({ to, sound: "default", title, body, data: data ?? {} }));

    for (let i = 0; i < messages.length; i += 100) {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
      if (!res.ok) console.error("[PushNotification] Expo responded", res.status);
    }
  },
});
