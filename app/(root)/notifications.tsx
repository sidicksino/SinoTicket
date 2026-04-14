import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await authFetch("/api/notifications");
      if (res?.success) {
        setNotifications(res.notifications);
      }
    } catch (err: any) {
      console.log("Error loading notifications", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (id: string, currentlyRead: boolean, link?: string) => {
    if (link) {
      router.push(link as any);
    }

    if (currentlyRead) return;

    // Optimistic UI Update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
    );

    try {
      await authFetch(`/api/notifications/${id}/read`, { method: "PUT" });
    } catch (err: any) {
      console.log("Failed to mark as read", err);
      // Revert if failed
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: false } : n))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await authFetch(`/api/notifications/read-all`, { method: "PUT" });
    } catch (err: any) {
      console.log("Failed to mark all as read", err);
      loadNotifications(); // Reload to restore correct state
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <Ionicons name="ticket" size={20} color={colors.primary} />;
      case 'PROMO': return <Ionicons name="pricetag" size={20} color="#E91E63" />;
      default: return <Ionicons name="notifications" size={20} color={colors.primary} />;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUnread = !item.is_read;

    return (
      <TouchableOpacity
        onPress={() => handleMarkAsRead(item._id, item.is_read, item.link)}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          padding: 16,
          backgroundColor: isUnread ? (isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(76, 175, 80, 0.05)") : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: colors.border + "40",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
            borderWidth: 1,
            borderColor: colors.border + "60",
          }}
        >
          {renderIcon(item.type)}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontFamily: "Syne_700Bold", fontSize: 16, color: colors.text }}>
              {item.title}
            </Text>
            {isUnread && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4 }} />
            )}
          </View>
          <Text style={{ color: colors.subtext, fontSize: 14, lineHeight: 20 }}>
            {item.message}
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 8, opacity: 0.6 }}>
            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── HEADER ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border + "40",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "Syne_700Bold",
            fontSize: 18,
            color: colors.text,
          }}
        >
          {t("notificationsPage.title")}
        </Text>
        <TouchableOpacity onPress={handleMarkAllAsRead} style={{ padding: 8 }}>
          <Ionicons name="checkmark-done-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── CONTENT ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.border} style={{ marginBottom: 16 }} />
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 20, color: colors.text, marginBottom: 8, textAlign: 'center' }}>
            {t("notificationsPage.emptyTitle")}
          </Text>
          <Text style={{ fontSize: 15, color: colors.subtext, textAlign: "center", lineHeight: 22 }}>
            {t("notificationsPage.emptyMessage")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
