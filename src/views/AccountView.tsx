import { ScrollView, Text, View } from "react-native";
import { Avatar, Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import MenuRow from "@/components/MenuRow";
import { colors } from "@/constants/theme";
import { currentUser } from "@/data/mock";
import { common } from "@/styles/common";
import styles from "@/styles/accountView";

export default function AccountView() {
  const router = useRouter();

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Cuenta"
        left={<Icon name="menu" type="ionicon" color={colors.text} />}
        right={<Icon name="notifications-outline" type="ionicon" color={colors.text} />}
      />
      <ScrollView contentContainerStyle={common.scroll}>
        <View style={styles.profile}>
          <Avatar rounded size={110} icon={{ name: "person", type: "ionicon", size: 56 }} containerStyle={{ backgroundColor: colors.surfaceAlt }} />
          <Text style={styles.name}>{currentUser.nombre}</Text>
          <Text style={styles.email}>{currentUser.correo}</Text>
        </View>
        <MenuRow icon="bag-handle-outline" label="Mis compras" onPress={() => router.push("/mis-compras")} />
        <MenuRow icon="albums-outline" label="Mis publicaciones" onPress={() => router.push("/mis-publicaciones")} />
        <MenuRow icon="information-circle-outline" label="Acerca de CuBazar" onPress={() => router.push("/acerca-de")} />
      </ScrollView>
    </SafeAreaView>
  );
}
