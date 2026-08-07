import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/tokens";
import { useProfileStore } from "@/store/useProfileStore";
import { archetypeAccents } from "@/theme/tokens";

export default function TabLayout() {
  const archetype = useProfileStore((s) => s.archetype) ?? "sunny";
  const activeColor = archetypeAccents[archetype]?.dark || colors.roseDark;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.cocoaFaint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: "Closet",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "shirt" : "shirt-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.whiteSoft,
    borderTopWidth: 1,
    borderTopColor: colors.creamDeep,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 10,
  },
});
