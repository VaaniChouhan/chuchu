import { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { colors, radius, typeScale, shadow } from "@/theme/tokens";
import { classifyGarment } from "@/ml/classifier";
import { addWardrobeItem } from "@/db/wardrobe.repository";
import { CameraCapture } from "@/components/CameraCapture";

type Step = "capture" | "classifying" | "confirm";

interface ClassificationResult {
  category: string;
  dominantColor: string;
  pattern: string;
  confidence: number;
}

const CATEGORIES = ["top", "bottom", "dress", "outerwear", "shoes", "accessory", "kurta", "saree", "lehenga", "dupatta", "sherwani"];
const PATTERNS = ["solid", "striped", "floral", "plaid", "graphic", "textured", "embroidered", "zari", "block-print"];

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("capture");
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [editPattern, setEditPattern] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleTakePhoto = useCallback(async () => {
    setShowLiveCamera(true);
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gallery Permission", "Photo library access is required to select garment images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      processImage(result.assets[0].uri);
    }
  }, []);

  const processImage = async (uri: string) => {
    setPhotoUri(uri);
    setStep("classifying");
    try {
      const classification = await classifyGarment(uri);
      setResult(classification);
      setEditCategory(classification.category);
      setEditPattern(classification.pattern);
      setStep("confirm");
    } catch (e) {
      console.error("Classification failed:", e);
      Alert.alert("Error", "Failed to classify the garment. Please try again.");
      setStep("capture");
    }
  };

  const handleSave = async () => {
    if (!photoUri || !result) return;
    setSaving(true);
    try {
      await addWardrobeItem({
        imageUri: photoUri,
        category: editCategory,
        dominantColor: result.dominantColor,
        pattern: editPattern,
        confidenceState: result.confidence >= 0.75 ? "ai_detected" : "needs_review",
      });
      Alert.alert("Added! 🎉", "Your garment has been added to your wardrobe.", [
        { text: "Add Another", onPress: () => resetState() },
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error("Failed to save wardrobe item:", e);
      Alert.alert("Error", "Failed to save the item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    setStep("capture");
    setPhotoUri(null);
    setResult(null);
    setEditCategory("");
    setEditPattern("");
  };

  if (showLiveCamera) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <CameraCapture
          onCapture={(uri) => {
            setShowLiveCamera(false);
            processImage(uri);
          }}
          onCancel={() => setShowLiveCamera(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} accessible={true} accessibilityRole="button" accessibilityLabel="Close add item screen">
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>Add Item</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(60, insets.bottom + 24) }]}>
        {step === "capture" && (
          <View style={styles.captureSection}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>📷</Text>
              <Text style={styles.placeholderText}>
                Take a photo or pick from your gallery
              </Text>
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleTakePhoto} accessible={true} accessibilityRole="button" accessibilityLabel="Take Photo">
              <Text style={styles.primaryBtnText}>📸 Take Photo</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={handlePickFromGallery} accessible={true} accessibilityRole="button" accessibilityLabel="Choose from Gallery">
              <Text style={styles.secondaryBtnText}>🖼️ Choose from Gallery</Text>
            </Pressable>
          </View>
        )}

        {step === "classifying" && (
          <View style={styles.loadingSection}>
            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
            )}
            <ActivityIndicator size="large" color={colors.rose} />
            <Text style={styles.loadingText}>Analyzing garment...</Text>
            <Text style={styles.loadingSubtext}>
              ChuChu is detecting category, color, and pattern
            </Text>
          </View>
        )}

        {step === "confirm" && result && (
          <View style={styles.confirmSection}>
            {photoUri && (
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
            )}

            {/* Confidence badge */}
            <View style={[styles.confidenceBadge, {
              backgroundColor: result.confidence >= 0.8 ? colors.sagePale : colors.goldPale,
            }]}>
              <Text style={styles.confidenceText}>
                {result.confidence >= 0.8 ? "✓" : "⚠"}{" "}
                {Math.round(result.confidence * 100)}% confident
              </Text>
            </View>

            {/* Detected color swatch */}
            <View style={styles.colorRow}>
              <Text style={styles.fieldLabel}>Detected Color</Text>
              <View style={styles.colorSwatchRow}>
                <View style={[styles.colorSwatch, { backgroundColor: result.dominantColor }]} />
                <Text style={styles.colorHex}>{result.dominantColor}</Text>
              </View>
            </View>

            {/* Category selector */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.chip, editCategory === cat && styles.chipActive]}
                  onPress={() => setEditCategory(cat)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: editCategory === cat }}
                >
                  <Text style={[styles.chipText, editCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Pattern selector */}
            <Text style={styles.fieldLabel}>Pattern</Text>
            <View style={styles.chipRow}>
              {PATTERNS.map((pat) => (
                <Pressable
                  key={pat}
                  style={[styles.chip, editPattern === pat && styles.chipActive]}
                  onPress={() => setEditPattern(pat)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: editPattern === pat }}
                >
                  <Text style={[styles.chipText, editPattern === pat && styles.chipTextActive]}>
                    {pat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <Pressable
              style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save garment to closet"
            >
              <Text style={styles.primaryBtnText}>
                {saving ? "Saving..." : "✓ Add to Wardrobe"}
              </Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={resetState} accessible={true} accessibilityRole="button" accessibilityLabel="Retake garment photo">
              <Text style={styles.secondaryBtnText}>↺ Retake Photo</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: colors.cocoa,
    fontFamily: "Nunito-Bold",
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.screenTitle,
    color: colors.cocoa,
  },
  scrollContent: {
    padding: 24,
    gap: 20,
    paddingBottom: 60,
  },
  captureSection: {
    gap: 16,
    alignItems: "center",
  },
  placeholder: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colors.creamLinen,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.creamDeep,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  placeholderText: {
    fontFamily: "Nunito-Regular",
    fontSize: typeScale.body,
    color: colors.cocoaSoft,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: colors.cocoa,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    ...shadow.soft,
  },
  primaryBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 15,
    color: colors.whiteSoft,
  },
  secondaryBtn: {
    width: "100%",
    backgroundColor: colors.creamLinen,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  secondaryBtnText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoa,
  },
  loadingSection: {
    alignItems: "center",
    gap: 16,
    paddingTop: 20,
  },
  loadingText: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
  },
  loadingSubtext: {
    fontFamily: "Nunito-Regular",
    fontSize: typeScale.caption,
    color: colors.cocoaSoft,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    backgroundColor: colors.creamLinen,
  },
  confirmSection: {
    gap: 16,
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  confidenceText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoa,
  },
  colorRow: {
    gap: 6,
  },
  colorSwatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.creamDeep,
  },
  colorHex: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    color: colors.cocoaSoft,
  },
  fieldLabel: {
    fontFamily: "Nunito-Bold",
    fontSize: 13,
    color: colors.cocoa,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.creamLinen,
    borderWidth: 1.5,
    borderColor: colors.creamDeep,
  },
  chipActive: {
    backgroundColor: colors.cocoa,
    borderColor: colors.cocoa,
  },
  chipText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: colors.cocoaSoft,
  },
  chipTextActive: {
    color: colors.whiteSoft,
  },
});
