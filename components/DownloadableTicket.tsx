import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

export interface TicketData {
  category: string;
  eventName: string;
  date: string;
  price: string;
  venue: string;
  section: string;
  seat: string;
  ticketId: string;
  eventImage: string;
}

interface DownloadableTicketProps {
  ticket: TicketData;
  ticketRef: any;
}

const CARD_WIDTH = 650; // Wider for that professional "Figma" layout
const CARD_HEIGHT = 260;
const ACCENT = "#00D1FF"; // Electric Cyan
const BLACK = "#0A0A0A";
const SLATE = "#64748B";

export function DownloadableTicket({
  ticket,
  ticketRef,
}: DownloadableTicketProps) {
  const { t } = useTranslation();
  const qrUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tickets/verify/${ticket.ticketId}`;

  return (
    <View style={styles.container}>
      <ViewShot ref={ticketRef} options={{ format: "png", quality: 1 }}>
        <View style={styles.card}>
          {/* LEFT: Branding & Image */}
          <View style={styles.leftColumn}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: ticket.eventImage }}
                style={styles.eventImage}
                contentFit="cover"
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {ticket.category?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.eventName} numberOfLines={2}>
                {ticket.eventName}
              </Text>
            </View>
          </View>

          {/* MIDDLE: Organized Details Grid */}
          <View style={styles.midColumn}>
            <View style={styles.infoGrid}>
              {/* Row 1: Date & Time */}
              <View style={styles.gridFull}>
                <Text style={styles.label}>
                  {t("ticket.download.dateTime")}
                </Text>
                <Text style={styles.valueBold}>
                  {ticket.date.toUpperCase()}
                </Text>
              </View>

              {/* Row 2: Section & Seat (The center focus) */}
              <View style={styles.gridHalf}>
                <Text style={styles.label}>{t("ticket.section")}</Text>
                <Text style={styles.valueHighlight}>{ticket.section}</Text>
              </View>
              <View style={styles.gridHalf}>
                <Text style={styles.label}>{t("ticket.seat")}</Text>
                <Text style={styles.valueHighlight}>{ticket.seat}</Text>
              </View>

              {/* Row 3: Location */}
              <View style={styles.gridFull}>
                <Text style={styles.label}>
                  {t("ticket.download.location")}
                </Text>
                <Text style={styles.value}>{ticket.venue}</Text>
              </View>

              {/* Row 4: Price */}
              <View style={styles.gridFull}>
                <View style={styles.priceTag}>
                  <Text style={styles.labelInline}>
                    {t("ticket.download.admission")}:
                  </Text>
                  <Text style={styles.priceText}>{ticket.price}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerWrapper}>
            <View style={styles.notchTop} />
            <View style={styles.dashedLine} />
            <View style={styles.notchBottom} />
          </View>

          {/* RIGHT: The Stub / QR */}
          <View style={styles.rightColumn}>
            <View style={styles.qrBg}>
              <QRCode
                value={qrUrl}
                size={100}
                color={BLACK}
                backgroundColor="transparent"
              />
            </View>
            <Text style={styles.scanText}>
              {t("ticket.download.scanForEntry")}
            </Text>
            <Text style={styles.ticketId} numberOfLines={1}>
              {ticket.ticketId.toUpperCase()}
            </Text>
          </View>
        </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: -5000,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  // Left Column
  leftColumn: {
    width: 250,
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  eventImage: {
    flex: 1,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 9,
    fontWeight: "800",
  },
  eventName: {
    backgroundColor:
      "linear-gradient(to bottom, rgba(21, 20, 20, 0.5), rgba(21, 20, 20, 0.2))",
    position: "absolute",
    padding: 10,
    bottom: 0,
    fontSize: 20,
    fontWeight: "900",
    color: "#F8FAFC",
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  // Middle Column
  midColumn: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
  },
  gridFull: {
    width: "100%",
  },
  gridHalf: {
    width: "50%",
  },
  label: {
    fontSize: 10,
    color: SLATE,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  valueBold: {
    fontSize: 12,
    color: BLACK,
    fontWeight: "800",
  },
  valueHighlight: {
    fontSize: 14,
    color: BLACK,
    fontWeight: "900",
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  labelInline: {
    fontSize: 10,
    color: SLATE,
    fontWeight: "700",
    marginRight: 6,
  },
  priceText: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: "900",
  },
  // Divider
  dividerWrapper: {
    width: 40,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dashedLine: {
    flex: 1,
    width: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    marginVertical: 15,
  },
  notchTop: {
    width: 40,
    height: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#F1F5F9", // Match app background
    marginTop: -1,
  },
  notchBottom: {
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#F1F5F9", // Match app background
    marginBottom: -1,
  },
  // Right Column (Stub)
  rightColumn: {
    width: 150,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  qrBg: {
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 10,
  },
  scanText: {
    fontSize: 8,
    fontWeight: "700",
    color: SLATE,
    marginTop: 12,
    letterSpacing: 1,
  },
  ticketId: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#94A3B8",
    marginTop: 4,
  },
});
