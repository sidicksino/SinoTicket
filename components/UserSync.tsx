import { api } from "@/lib/convex";
import { useUser } from "@clerk/expo";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useRef } from "react";

/**
 * Keeps the Convex `users` table in step with Clerk: as soon as a signed-in
 * session reaches Convex, create/refresh this user's row.
 */
export default function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const store = useMutation(api.users.store);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || syncedFor.current === user.id) return;
    syncedFor.current = user.id;
    store({
      name: user.fullName ?? undefined,
      email: user.primaryEmailAddress?.emailAddress,
      profile_photo: user.imageUrl,
    }).catch((err) => {
      syncedFor.current = null;
      console.error("User sync failed:", err);
    });
  }, [isAuthenticated, user, store]);

  return null;
}
