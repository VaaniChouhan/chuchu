import { useRef, useState } from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export function CameraCapture({
  onCapture,
  disabled,
}: {
  onCapture: (uri: string) => void;
  disabled?: boolean;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Camera access is needed to scan wardrobe items.</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo) onCapture(photo.uri);
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <Pressable
        onPress={takePhoto}
        disabled={disabled}
        style={[styles.shutter, disabled && styles.shutterDisabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  muted: { color: "#888", textAlign: "center", marginBottom: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "#1a1a1a", borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  shutter: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#ddd",
  },
  shutterDisabled: { opacity: 0.4 },
});
