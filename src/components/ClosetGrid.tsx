import { FlatList, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { WardrobeItem } from "@/db/wardrobe.repository";

const COLUMN_COUNT = 3;
const SPACING = 8;
const ITEM_SIZE = (Dimensions.get("window").width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export function ClosetGrid({ items }: { items: WardrobeItem[] }) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={COLUMN_COUNT}
      columnWrapperStyle={{ gap: SPACING }}
      contentContainerStyle={{ gap: SPACING }}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/item/${item.id}` as any)}>
          <Image source={{ uri: item.imageUri }} style={styles.thumb} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  thumb: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
});
