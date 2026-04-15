import { Image } from "expo-image";
import React from "react";
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

const CARD_WIDTH = 450;
const CARD_HEIGHT = 180;

export function DownloadableTicket({ ticket, ticketRef }: DownloadableTicketProps) {
  // Ensure the QR code points to the verification URL exactly like the modal
  const qrUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/tickets/verify/${ticket.ticketId}`;

  return (
    <View style={styles.container}>
      <ViewShot ref={ticketRef} options={{ format: "png", quality: 1 }}>
        <View style={styles.card}>
          {/* Left Panel */}
          <View style={styles.leftPanel}>
            <View>
              <Text style={styles.category}>{ticket.category?.toUpperCase() || "EVENT"}</Text>
              <Text style={[styles.eventName, { fontFamily: "Syne_700Bold" }]} numberOfLines={2}>
                {ticket.eventName?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.middleSection}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{ticket.date?.toUpperCase()}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>PRICE: {ticket.price}</Text>
                </View>
                <View style={[styles.infoBox, { flex: 1 }]}>
                  <Text style={styles.infoText} numberOfLines={1}>
                    {ticket.venue?.toUpperCase() || "VARIOUS LOCATIONS"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Center Image */}
          <Image
            source={{ uri: ticket.eventImage }}
            style={styles.eventImage}
            contentFit="cover"
          />

          {/* Dashed Separator */}
          <View style={styles.dashedSeparator}>
            <View style={styles.notchTop} />
            <View style={styles.dashedLine} />
            <View style={styles.notchBottom} />
          </View>

          {/* Right Panel (Stub) */}
          <View style={styles.rightPanel}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrUrl}
                size={75}
                color="#000"
                backgroundColor="#FFF"
              />
            </View>

            <Text style={styles.ticketId} numberOfLines={1}>
              {ticket.ticketId.slice(0, 12)}...
            </Text>

            <View style={styles.seatRow}>
              <View>
                <Text style={styles.seatLabel}>SECTION</Text>
                <Text style={styles.seatValue}>{ticket.section}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.seatLabel}>SEAT</Text>
                <Text style={styles.seatValue}>#{ticket.seat}</Text>
              </View>
            </View>
          </View>
        </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Hidden off-screen but rendered for ViewShot to capture
    position: 'absolute',
    left: -2000,
    top: 0,
    width: CARD_WIDTH,
  },
  card: {
    flexDirection: "row",
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF",
    width: CARD_WIDTH,
    overflow: "hidden",
    borderRadius: 4,
  },
  leftPanel: {
    width: 170,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  category: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#666",
    marginBottom: 2,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    lineHeight: 20,
  },
  middleSection: {
    gap: 8,
  },
  dateBox: {
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  dateText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#000",
  },
  infoRow: {
    flexDirection: "row",
    gap: 4,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  eventImage: {
    flex: 1,
    height: CARD_HEIGHT,
  },
  dashedSeparator: {
    width: 20,
    height: CARD_HEIGHT,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  dashedLine: {
    flex: 1,
    width: 1,
    borderStyle: "dashed",
    borderWidth: 0.5,
    borderColor: "#DDD",
    marginVertical: 4,
  },
  notchTop: {
    width: 20,
    height: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#F5F5F5",
    marginTop: -1,
  },
  notchBottom: {
    width: 20,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#F5F5F5",
    marginBottom: -1,
  },
  rightPanel: {
    width: 130,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrWrapper: {
    padding: 2,
    backgroundColor: '#FFF',
  },
  ticketId: {
    fontSize: 7,
    color: "#999",
    fontFamily: "monospace",
    marginTop: 2,
  },
  seatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  seatLabel: {
    fontSize: 7,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
  },
  seatValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FF6B35",
  },
});
