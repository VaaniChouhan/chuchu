import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Svg, { Circle, Ellipse, Path, G } from "react-native-svg";
import * as THREE from "three";
import { colors, radius, shadow } from "@/theme/tokens";
import { hapticMedium, hapticSuccess } from "@/utils/haptics";

export type MascotEmotion = "idle" | "happy" | "thinking" | "celebrating" | "cozy";

interface ChuChu3DMascotProps {
  size?: number;
  emotion?: MascotEmotion;
  interactive?: boolean;
  onTap?: () => void;
}

export function ChuChu3DMascot({
  size = 120,
  emotion = "idle",
  interactive = true,
  onTap,
}: ChuChu3DMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeEmotion, setActiveEmotion] = useState<MascotEmotion>(emotion);
  const emotionRef = useRef<MascotEmotion>(emotion);

  useEffect(() => {
    setActiveEmotion(emotion);
    emotionRef.current = emotion;
  }, [emotion]);

  const handlePress = () => {
    if (!interactive) return;
    hapticMedium();
    setActiveEmotion("happy");
    emotionRef.current = "happy";
    if (onTap) onTap();

    setTimeout(() => {
      setActiveEmotion(emotion);
      emotionRef.current = emotion;
    }, 1800);
  };

  // WebGL Three.js renderer setup (Web execution)
  useEffect(() => {
    if (Platform.OS !== "web" || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ""; // Clear existing canvas

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0.4, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    mainLight.position.set(3, 5, 4);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xff7582, 0.6);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // Mascot Group Container
    const lovebirdGroup = new THREE.Group();
    scene.add(lovebirdGroup);

    // 1. Body Mesh (Leaf Green)
    const bodyGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x72b043, // Vibrant Peach-Faced Lovebird green
      roughness: 0.4,
      metalness: 0.05,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.scale.set(0.95, 1.15, 0.9);
    bodyMesh.position.set(0, -0.2, 0);
    lovebirdGroup.add(bodyMesh);

    // 2. Head Mesh (Rosy Peach Face)
    const headGeo = new THREE.SphereGeometry(0.68, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xff7582, // Peach Pink
      roughness: 0.35,
      metalness: 0.05,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.65, 0.05);
    lovebirdGroup.add(headMesh);

    // 3. Forehead Crown Patch (Golden Yellow)
    const crownGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffc845, // Golden Yellow
      roughness: 0.4,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(0, 1.1, 0.25);
    crownMesh.scale.set(1.1, 0.5, 0.9);
    headMesh.add(crownMesh);

    // 4. Ivory Peach Beak
    const beakGeo = new THREE.ConeGeometry(0.16, 0.38, 16);
    const beakMat = new THREE.MeshStandardMaterial({
      color: 0xffe6a7, // Pale Horn Ivory
      roughness: 0.2,
    });
    const beakMesh = new THREE.Mesh(beakGeo, beakMat);
    beakMesh.rotation.x = -1.2;
    beakMesh.position.set(0, 0.58, 0.68);
    lovebirdGroup.add(beakMesh);

    // 5. Glossy Obsidian Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1c1815,
      roughness: 0.1,
    });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.32, 0.72, 0.52);
    lovebirdGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.32, 0.72, 0.52);
    lovebirdGroup.add(rightEye);

    // Eye Specular Highlights
    const highlightGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    leftHighlight.position.set(-0.03, 0.04, 0.09);
    leftEye.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    rightHighlight.position.set(-0.03, 0.04, 0.09);
    rightEye.add(rightHighlight);

    // 6. Blush Cheeks
    const cheekGeo = new THREE.CircleGeometry(0.12, 16);
    const cheekMat = new THREE.MeshBasicMaterial({
      color: 0xff4d6d,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(-0.45, 0.55, 0.48);
    leftCheek.rotation.y = -0.4;
    lovebirdGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(0.45, 0.55, 0.48);
    rightCheek.rotation.y = 0.4;
    lovebirdGroup.add(rightCheek);

    // 7. Wings (Left & Right)
    const wingGeo = new THREE.CapsuleGeometry(0.2, 0.65, 8, 16);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x589635, // Slightly darker emerald wing
      roughness: 0.4,
    });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.72, -0.1, 0.05);
    leftWing.rotation.z = 0.3;
    leftWing.rotation.x = 0.2;
    lovebirdGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.72, -0.1, 0.05);
    rightWing.rotation.z = -0.3;
    rightWing.rotation.x = 0.2;
    lovebirdGroup.add(rightWing);

    // 8. Tail Feathers (Emerald + Blue Tip)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.6, -0.6);
    tailGroup.rotation.x = 0.6;

    const mainTailGeo = new THREE.BoxGeometry(0.35, 0.6, 0.05);
    const mainTailMat = new THREE.MeshStandardMaterial({ color: 0x3d752e });
    const mainTail = new THREE.Mesh(mainTailGeo, mainTailMat);
    tailGroup.add(mainTail);

    const blueTipGeo = new THREE.BoxGeometry(0.35, 0.2, 0.06);
    const blueTipMat = new THREE.MeshStandardMaterial({ color: 0x2b90d9 });
    const blueTip = new THREE.Mesh(blueTipGeo, blueTipMat);
    blueTip.position.set(0, -0.3, 0);
    tailGroup.add(blueTip);

    lovebirdGroup.add(tailGroup);

    // Animation Loop Variables
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentEmo = emotionRef.current;

      // Base breathing motion
      const breath = Math.sin(elapsedTime * 2) * 0.025;
      bodyMesh.scale.set(0.95 + breath, 1.15 - breath * 0.5, 0.9 + breath);

      // Emotion-specific motion behaviors
      switch (currentEmo) {
        case "happy":
          // Joyful bouncing & wing flapping
          lovebirdGroup.position.y = Math.abs(Math.sin(elapsedTime * 7)) * 0.25;
          lovebirdGroup.rotation.y = Math.sin(elapsedTime * 3) * 0.15;
          leftWing.rotation.z = 0.3 + Math.sin(elapsedTime * 14) * 0.45;
          rightWing.rotation.z = -0.3 - Math.sin(elapsedTime * 14) * 0.45;
          headMesh.rotation.z = Math.sin(elapsedTime * 5) * 0.1;
          break;

        case "thinking":
          // Curious head tilt & gentle floating drift
          lovebirdGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
          lovebirdGroup.rotation.y = 0.2;
          headMesh.rotation.z = 0.35; // Cute 20 degree tilt
          headMesh.rotation.x = Math.sin(elapsedTime * 2) * 0.05;
          leftWing.rotation.z = 0.2;
          rightWing.rotation.z = -0.2;
          break;

        case "celebrating":
          // Full energetic 360 spinning & jumping
          lovebirdGroup.position.y = Math.abs(Math.sin(elapsedTime * 10)) * 0.35;
          lovebirdGroup.rotation.y = elapsedTime * 4; // Fast spin
          leftWing.rotation.z = 0.8 + Math.sin(elapsedTime * 20) * 0.4;
          rightWing.rotation.z = -0.8 - Math.sin(elapsedTime * 20) * 0.4;
          break;

        case "cozy":
          // Calming slow sway & sleepy eyes
          lovebirdGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.04;
          lovebirdGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.08;
          headMesh.rotation.z = Math.sin(elapsedTime * 1.2) * 0.06;
          leftEye.scale.y = 0.4; // Drooping sleepy eyelids
          rightEye.scale.y = 0.4;
          leftWing.rotation.z = 0.1;
          rightWing.rotation.z = -0.1;
          break;

        case "idle":
        default:
          // Subtle natural idle swaying & head tilting
          lovebirdGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.04;
          lovebirdGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.08;
          headMesh.rotation.z = Math.sin(elapsedTime * 1.5) * 0.06;

          // Natural periodic blinks
          const blinkCycle = Math.sin(elapsedTime * 3);
          const isBlinking = blinkCycle > 0.96;
          leftEye.scale.y = isBlinking ? 0.1 : 1.0;
          rightEye.scale.y = isBlinking ? 0.1 : 1.0;

          leftWing.rotation.z = 0.3 + Math.sin(elapsedTime * 2) * 0.05;
          rightWing.rotation.z = -0.3 - Math.sin(elapsedTime * 2) * 0.05;
          break;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      headGeo.dispose();
      headMat.dispose();
    };
  }, [size]);

  // Fallback 2D SVG Peach-Faced Lovebird for Native Mobile Platforms
  if (Platform.OS !== "web") {
    return (
      <Pressable onPress={handlePress} style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Green Body */}
          <Ellipse cx="50" cy="62" rx="30" ry="28" fill="#72B043" />
          {/* Peach Pink Head */}
          <Circle cx="50" cy="38" r="26" fill="#FF7582" />
          {/* Golden Yellow Crown */}
          <Path d="M30 26 Q50 14 70 26 Q50 20 30 26Z" fill="#FFC845" />
          {/* Beak */}
          <Path d="M44 42 Q50 56 56 42 Z" fill="#FFE6A7" />
          {/* Eyes */}
          <Circle cx="36" cy="36" r="3.5" fill="#1C1815" />
          <Circle cx="64" cy="36" r="3.5" fill="#1C1815" />
          <Circle cx="35" cy="35" r="1.2" fill="#FFFFFF" />
          <Circle cx="63" cy="35" r="1.2" fill="#FFFFFF" />
          {/* Blush */}
          <Circle cx="28" cy="44" r="5" fill="#FF5252" opacity={0.6} />
          <Circle cx="72" cy="44" r="5" fill="#FF5252" opacity={0.6} />
          {/* Wings */}
          <Ellipse cx="22" cy="65" rx="8" ry="18" fill="#589635" transform="rotate(15 22 65)" />
          <Ellipse cx="78" cy="65" rx="8" ry="18" fill="#589635" transform="rotate(-15 78 65)" />
        </Svg>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { width: size, height: size }]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Interactive 3D Peach-Faced Lovebird Mascot ChuChu"
    >
      <div ref={containerRef} style={{ width: size, height: size }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    overflow: "hidden",
  },
});
