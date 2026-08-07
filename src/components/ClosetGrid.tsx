import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { WardrobeItem } from "@/db/wardrobe.repository";
import Animated, { FadeInDown } from "react-native-reanimated";

const COLUMN_COUNT = 3;
const SPACING = 8;

export function ClosetGrid({ items }: { items: WardrobeItem[] }) {
  const { width } = useWindowDimensions();
  const itemSize = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={COLUMN_COUNT}
      columnWrapperStyle={{ gap: SPACING }}
      contentContainerStyle={{ gap: SPACING }}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 400)).duration(300)}>
          <Pressable
            onPress={() => router.push(`/item/${item.id}` as any)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${item.category}${item.pattern ? ` (${item.pattern})` : ''}`}
          >
            <Image source={{ uri: item.imageUri }} style={[styles.thumb, { width: itemSize, height: itemSize }]} />
          </Pressable>
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  thumb: {
    borderRadius: 8,
    backgroundColor: "#eee",
  },
});
