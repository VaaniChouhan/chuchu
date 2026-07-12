import { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radius, typeScale } from "@/theme/tokens";
import { ProgressRing } from "@/components/ProgressRing";
import { classifyGarmentMock, GarmentClassificationMock } from "@/ml/classifier.mock";
import { addWardrobeItem } from "@/db/wardrobe.repository";

export default function AddItems() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedItems, setScannedItems] = useState<{ id: number; category: string; color: string; uri: string }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [classification, setClassification] = useState<GarmentClassificationMock | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  
  const cameraRef = useRef<any>(null);

  const startScan = async () => {
    if (!permission || !permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          "Camera Access Required",
          "Camera access was denied. We will use a simulated capture instead.",
          [{ text: "OK", onPress: () => triggerMockCapture() }]
        );
        return;
      }
    }
    setScanning(true);
    setClassification(null);
    setCapturedUri(null);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
          processCapturedPhoto(photo.uri);
        }
      } catch (e) {
        console.error("Camera capture failed:", e);
        triggerMockCapture();
      }
    } else {
      triggerMockCapture();
    }
  };

  const triggerMockCapture = () => {
    const mockUri = "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=300";
    processCapturedPhoto(mockUri);
  };

  const processCapturedPhoto = async (uri: string) => {
    setScanning(false);
    setCapturedUri(uri);
    try {
      const result = await classifyGarmentMock(uri);
      setClassification(result);
    } catch (e) {
      console.error("Mock classification failed:", e);
    }
  };

  const confirmItem = async () => {
    if (!capturedUri || !classification) return;

    try {
      const insertedId = await addWardrobeItem({
        imageUri: capturedUri,
        category: classification.category,
        dominantColor: classification.dominantColor,
        pattern: classification.pattern,
      });

      setScannedItems((prev) => [
        ...prev,
        {
          id: insertedId,
          category: classification.category,
          color: classification.dominantColor,
          uri: capturedUri,
        },
      ]);

      setClassification(null);
      setCapturedUri(null);
    } catch (e) {
      console.error("Saving item failed:", e);
    }
  };

  const cancelItem = () => {
    setClassification(null);
    setCapturedUri(null);
  };

  const handleContinue = () => {
    router.replace("/onboarding/generating");
  };

  const itemsNeeded = 5;
  const currentCount = scannedItems.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Circular Progress Ring */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Build your closet</Text>
            <Text style={styles.subtitle}>Scan at least 5 core items to seed your wardrobe.</Text>
          </View>
          <ProgressRing current={currentCount} target={itemsNeeded} size={70} strokeWidth={6} />
        </View>

        {/* Camera Scanner View / Trigger */}
        {!scanning && !capturedUri && (
          <Pressable
            style={styles.scanTrigger}
            onPress={startScan}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Scan a Garment"
            accessibilityHint="Launches camera scanner to identify a wardrobe item"
          >
            <Text style={styles.scanTriggerEmoji}>📸</Text>
            <Text style={styles.scanTriggerText}>Scan a Garment</Text>
          </Pressable>
        )}

        {scanning && (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera}>
              <View style={styles.cameraOverlay}>
                <Pressable
                  style={styles.captureBtn}
                  onPress={takePicture}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Take Picture"
                  accessibilityHint="Captures photo of garment for analysis"
                >
                  <View style={styles.captureBtnInner} />
                </Pressable>
                <Pressable
                  style={styles.closeCamera}
                  onPress={() => setScanning(false)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  accessibilityHint="Close camera interface"
                >
                  <Text style={styles.closeCameraText}>Cancel</Text>
                </Pressable>
              </View>
            </CameraView>
          </View>
        )}

        {/* Capture / Classification Confirmation Panel */}
        {capturedUri && (
          <View style={styles.confirmPanel} accessible={true} accessibilityLabel="Detected item details confirmation card">
            <Image source={{ uri: capturedUri }} style={styles.previewImage} />
            
            {classification ? (
              <View style={styles.classificationDetails}>
                <Text style={styles.confirmHeading}>Item Detected!</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category:</Text>
                  <Text style={styles.metaValue}>{classification.category}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Pattern:</Text>
                  <Text style={styles.metaValue}>{classification.pattern}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Color:</Text>
                  <View style={[styles.colorPill, { backgroundColor: classification.dominantColor }]} />
                </View>

                <View style={styles.panelActionRow}>
                  <Pressable
                    style={[styles.panelBtn, styles.cancelBtn]}
                    onPress={cancelItem}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Retake photo"
                    accessibilityHint="Discard current scan and retake photo"
                  >
                    <Text style={styles.panelBtnText}>Retake</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.panelBtn, styles.confirmBtn]}
                    onPress={confirmItem}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm detected details"
                    accessibilityHint="Add this identified garment to your wardrobe"
                  >
                    <Text style={[styles.panelBtnText, { color: "#fff" }]}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>ChuChu is inspecting...</Text>
              </View>
            )}
          </View>
        )}

        {/* Scanned Items History Grid */}
        {scannedItems.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Confirmed Items</Text>
            <View style={styles.grid}>
              {scannedItems.map((item) => (
                <View
                  key={item.id}
                  style={styles.gridSlot}
                  accessible={true}
                  accessibilityLabel={`${item.category} garment`}
                >
                  <Image source={{ uri: item.uri }} style={styles.gridImage} />
                  <View style={[styles.gridColor, { backgroundColor: item.color }]} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Continue Button Gated */}
        <Pressable
          style={[styles.cta, currentCount < itemsNeeded && styles.ctaDisabled]}
          disabled={currentCount < itemsNeeded}
          onPress={handleContinue}
          accessible={true}
          accessibilityRole="button"
          accessibilityState={{ disabled: currentCount < itemsNeeded }}
          accessibilityLabel="Continue"
          accessibilityHint="Proceed to Style DNA generation screen"
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.screenTitle,
    color: colors.cocoa,
  },
  subtitle: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
  },
  scanTrigger: {
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.creamLinen,
    gap: 12,
    marginBottom: 32,
  },
  scanTriggerEmoji: {
    fontSize: 40,
  },
  scanTriggerText: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 16,
    color: colors.cocoa,
  },
  cameraContainer: {
    height: 300,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: 32,
    borderWidth: 3,
    borderColor: colors.cocoa,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 24,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
  },
  closeCamera: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  closeCameraText: {
    color: "#fff",
    fontFamily: "Nunito-Bold",
    fontSize: 12,
  },
  confirmPanel: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderRadius: radius.md,
    padding: 16,
    gap: 16,
    backgroundColor: colors.whiteSoft,
    marginBottom: 32,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.creamLinen,
  },
  classificationDetails: {
    flex: 1,
    gap: 6,
  },
  confirmHeading: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 16,
    color: colors.cocoa,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaLabel: {
    fontFamily: "Nunito-Regular",
    fontSize: 12,
    color: colors.cocoaSoft,
    width: 60,
  },
  metaValue: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
    textTransform: "capitalize",
  },
  colorPill: {
    width: 24,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.creamDeep,
  },
  panelActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  panelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  cancelBtn: {
    borderColor: colors.creamDeep,
    backgroundColor: colors.whiteSoft,
  },
  confirmBtn: {
    borderColor: colors.rose,
    backgroundColor: colors.rose,
  },
  panelBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
  historySection: {
    gap: 12,
    marginBottom: 40,
  },
  historyTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    color: colors.cocoa,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridSlot: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
    position: "relative",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridColor: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fff",
  },
  cta: {
    backgroundColor: colors.rose,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  ctaDisabled: {
    opacity: 0.5,
    backgroundColor: colors.creamDeep,
  },
  ctaText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#ffffff",
    fontSize: 16,
  },
});
