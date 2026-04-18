import { useAuthFetch } from "@/lib/fetch";
import { useAuth } from "@clerk/expo";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotifications = () => {
  const { authFetch } = useAuthFetch();
  const { isLoaded, isSignedIn } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        // We don't alert here to avoid annoying users, 
        // but in a production app we might explain why we need it.
        return null;
      }

      // Learn more about projectId: https://docs.expo.dev/push-notifications/push-notifications-setup/#get-your-expo-project-id
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.extra?.projectId;

      if (!projectId || projectId === "YOUR_PROJECT_ID_HERE") {
        console.warn("Push Notifications: Missing 'projectId' in app.json. Fetching token skipped.");
        return null;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
      } catch (e) {
        console.warn("Failed to get push token:", e);
      }
    } else {
      // Physical device required for push notifications
    }

    return token;
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const syncToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try {
          // Send the token to the backend to register it for this user
          await authFetch("/api/users/me", {
            method: "PUT",
            body: JSON.stringify({ push_token: token }),
          });
          console.log("Push token registered successfully:", token);
        } catch (error) {
          console.error("Error syncing push token to backend:", error);
        }
      }
    };

    syncToken();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Handle foreground notification (e.g., show a custom toast or alert)
        // Log only the data payload to avoid deprecated property access warnings
        console.log("Notification received in foreground:", notification.request.content.data);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Handle user interaction with notification (e.g., navigate to a screen)
        const data = response.notification.request.content.data;
        console.log("Notification interaction data:", data);
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isLoaded, isSignedIn, authFetch]);
};
