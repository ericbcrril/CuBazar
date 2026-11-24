import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/AppHeader";
import MenuRow from "@/components/MenuRow";
import { acercaDe } from "@/data/mock";
import { common } from "@/styles/common";
import styles from "@/styles/aboutView";

export default function AboutView() {
  // TODO: reemplaza los alert por pantallas/URLs con el texto legal real
  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title="Acerca de" back />
      <ScrollView contentContainerStyle={common.scroll}>
        <View style={styles.info}>
          <Text style={styles.heading}>Acerca de CuBazar para Android</Text>
          <Text style={styles.line}>Versión {acercaDe.version}</Text>
          <Text style={styles.line}>{acercaDe.copyright}</Text>
        </View>

        <MenuRow icon="document-text-outline" label="Términos y condiciones" onPress={() => alert("Términos y condiciones")} />
        <MenuRow icon="shield-checkmark-outline" label="Política de privacidad" onPress={() => alert("Política de privacidad")} />
        <MenuRow icon="accessibility-outline" label="Accesibilidad" onPress={() => alert("Accesibilidad")} />

        <View style={styles.support}>
          <Text style={styles.heading}>CuBazar soporte técnico</Text>
          {acercaDe.soporte.map((s) => (
            <Text key={s} style={styles.line}>{s}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
