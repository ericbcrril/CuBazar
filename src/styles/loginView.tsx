import { StyleSheet } from "react-native";

// --- TU BASE DE ESTILOS AQUí ---
const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#13151b",
    alignItems: "center", // Centrado horizontal
    justifyContent: "center", // Centrado vertical
    padding: 16, // Espaciado interno seguro
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  containerStyle: {},
  disabledInputStyle: {},
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  labelStyle: {
    
  },
  inputStyle: {
    backgroundColor: "#282a30",
    borderRadius: 30,
    margin: 10,
    padding: 20,
  },
});

export default styles;
