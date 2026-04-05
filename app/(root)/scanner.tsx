import CustomButton from "@/components/CustomButton";
import { useTheme } from "@/context/ThemeContext";
import { useAuthFetch } from "@/lib/fetch";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TicketScanner() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const { authFetch } = useAuthFetch();

  const [scanned, setScanned] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    ticket?: any;
  } | null>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Ionicons name="camera-outline" size={64} color={colors.subtext} />
          <Text style={{ fontFamily: "Syne_700Bold", fontSize: 24, color: colors.text, marginTop: 16, textAlign: 'center' }}>
            Camera Access Required
          </Text>
          <Text style={{ color: colors.subtext, fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 }}>
            We need your permission to use the camera to scan attendee QR codes.
          </Text>
        </View>
        <CustomButton title="Grant Permission" onPress={requestPermission} />
        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => router.back()}>
          <Text style={{ textAlign: "center", color: colors.primary, fontSize: 16, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || validationLoading) return;
    setScanned(true);
    setValidationLoading(true);

    try {
      // The QR code contains the full verify URL
      const parsedParts = data.split('/verify/');
      const qrHash = parsedParts.length > 1 ? parsedParts.pop() : data; 

      const result = await authFetch(`/api/tickets/verify/${qrHash}`);
      
      if (result) {
        setScanResult(result);
      } else {
        setScanResult({ valid: false, message: "Invalid ticket format ❌" });
      }
    } catch (error: any) {
      setScanResult({ valid: false, message: error.message || "Network error. Try again." });
    } finally {
      setValidationLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={StyleSheet.absoluteFillObject}>
        
        <SafeAreaView edges={['top']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>ADMIN SCANNER</Text>
          </View>
        </SafeAreaView>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {!scanned && (
            <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: '#fff', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)' }}>
               <View style={[styles.corner, styles.topLeft]} />
               <View style={[styles.corner, styles.topRight]} />
               <View style={[styles.corner, styles.bottomLeft]} />
               <View style={[styles.corner, styles.bottomRight]} />
            </View>
          )}
        </View>

        <View style={{ padding: 24, paddingBottom: 48, backgroundColor: 'rgba(0,0,0,0.85)', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
          
          {!scanned && !validationLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="scan-outline" size={32} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, marginTop: 12, fontWeight: '600' }}>Align QR Code within the frame</Text>
            </View>
          )}

          {validationLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: '#fff', fontSize: 16, marginTop: 16, fontWeight: '600' }}>Verifying Ticket...</Text>
            </View>
          )}

          {scanResult && !validationLoading && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'center' }}>
                <Ionicons 
                  name={scanResult.valid ? "checkmark-circle" : "close-circle"} 
                  size={48} 
                  color={scanResult.valid ? colors.success : colors.error} 
                />
              </View>
              
              <Text style={{ color: scanResult.valid ? colors.success : colors.error, fontSize: 24, fontFamily: "Syne_700Bold", textAlign: 'center', marginBottom: 8 }}>
                {scanResult.message}
              </Text>

              {scanResult.valid && scanResult.ticket && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16, marginBottom: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 14, opacity: 0.8, marginBottom: 4 }}>Event</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
                    {scanResult.ticket.event_id?.title || "Unknown Event"}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Seat Matrix</Text>
                      <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
                        Seat #{scanResult.ticket.seat_id?.number || "?"}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Status</Text>
                      <Text style={{ color: colors.success, fontSize: 16, fontWeight: '800' }}>Redeemed</Text>
                    </View>
                  </View>
                </View>
              )}

              <CustomButton title="Scan Next Ticket" onPress={resetScanner} />
            </View>
          )}

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#0286FF',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 24,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 24,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 24,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 24,
  },
});
