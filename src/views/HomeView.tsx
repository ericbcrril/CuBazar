import { FlatList, Text, TouchableOpacity } from "react-native";
import { Avatar, Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import PostCard from "@/components/PostCard";
import { colors } from "@/constants/theme";
import { posts } from "@/data/mock";
import { common } from "@/styles/common";
import styles from "@/styles/homeView";

export default function HomeView() {
  const router = useRouter();

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Inicio"
        left={<Icon name="menu" type="ionicon" color={colors.text} />}
        right={
          <>
            <Icon name="add" type="ionicon" color={colors.text} onPress={() => router.navigate("/(tabs)/publicar")} />
            <Icon name="notifications-outline" type="ionicon" color={colors.text} />
          </>
        }
      />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={common.scroll}
        ListHeaderComponent={
          <TouchableOpacity style={styles.composer} onPress={() => router.navigate("/(tabs)/publicar")}>
            <Avatar rounded size={32} icon={{ name: "person", type: "ionicon" }} containerStyle={{ backgroundColor: colors.surfaceAlt }} />
            <Text style={styles.composerText}>Publica algo...</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </SafeAreaView>
  );
}
