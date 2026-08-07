import React, { useRef, useState } from "react";
import { View, Pressable, StyleSheet, Text, Platform } from "react-native";
import { CameraView, useCameraPermissions, FlashMode } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, typeScale } from "@/theme/tokens";
import { hapticLight } from "@/utils/haptics";

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, onCancel, disabled }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>("off");
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView>(null);

  if (Platform.OS === "web") {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>Live camera is supported on iOS & Android native devices.</Text>
        {onCancel && (
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Use File Picker</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={48} color={colors.cocoaSoft} style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.mutedText}>
          ChuChu needs camera access to scan your clothes and detect colors & patterns automatically.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={styles.grantBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
        >
          <Text style={styles.grantBtnText}>Grant Camera Permission</Text>
        </Pressable>
        {onCancel && (
          <Pressable onPress={onCancel} style={{ marginTop: 16 }}>
            <Text style={styles.cancelLink}>Cancel & Use Gallery</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const toggleFlash = () => {
    hapticLight();
    setFlash((prev) => (prev === "off" ? "on" : prev === "on" ? "auto" : "off"));
  };

  const toggleFacing = () => {
    hapticLight();
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const takePhoto = async () => {
    hapticLight();
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch (e) {
      console.error("Camera capture error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Top Controls Overlay */}
        <View style={styles.topControls}>
          {onCancel && (
            <Pressable
              onPress={onCancel}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close camera"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          )}

          <View style={styles.topRight}>
            <Pressable
              onPress={toggleFlash}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Flash mode ${flash}`}
            >
              <Ionicons
                name={flash === "on" ? "flash" : flash === "auto" ? "flash-outline" : "flash-off"}
                size={22}
                color={flash !== "off" ? colors.gold : "#fff"}
              />
            </Pressable>

            <Pressable
              onPress={toggleFacing}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Viewfinder Alignment Guide Frame */}
        <View style={styles.frameContainer}>
          <View style={styles.alignmentGuide}>
            <Text style={styles.guideText}>Center garment in frame</Text>
          </View>
        </View>

        {/* Shutter Button Bar */}
        <View style={styles.shutterBar}>
          <Pressable
            onPress={takePhoto}
            disabled={disabled}
            style={[styles.shutterOuter, disabled && styles.shutterDisabled]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Take photo of garment"
          >
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.whiteSoft,
  },
  title: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: typeScale.cardTitle,
    color: colors.cocoa,
    marginBottom: 8,
    textAlign: "center",
  },
  mutedText: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    color: colors.cocoaSoft,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  grantBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.rose,
    borderRadius: 999,
  },
  grantBtnText: {
    fontFamily: "Nunito-ExtraBold",
    color: "#fff",
    fontSize: 14,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.creamDeep,
    borderRadius: radius.md,
  },
  cancelBtnText: {
    fontFamily: "Nunito-Bold",
    color: colors.cocoa,
    fontSize: 14,
  },
  cancelLink: {
    fontFamily: "Nunito-Bold",
    color: colors.rose,
    fontSize: 13,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  alignmentGuide: {
    width: "75%",
    height: "65%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 20,
    borderStyle: "dashed",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 16,
  },
  guideText: {
    fontFamily: "Nunito-Bold",
    fontSize: 12,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  shutterBar: {
    paddingBottom: 40,
    alignItems: "center",
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.rose,
  },
  shutterDisabled: {
    opacity: 0.5,
  },
});
