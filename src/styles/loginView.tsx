import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#16171C",
  },
  flex: {
    flex: 1,
    backgroundColor: "#16171C",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  customSwitchWrapper: {
    backgroundColor: "#26282E",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  logoText: {
    fontSize: 44,
    fontWeight: "800",
    color: "#F4F4F6",
    letterSpacing: -1,
  },
  logoAccentWrapper: {
    width: 24,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 1,
  },
  logoCheckRed: {
    width: 18,
    height: 6,
    backgroundColor: "#B8293D",
    borderRadius: 2,
    transform: [{ rotate: "-35deg" }],
    position: "absolute",
    top: 16,
  },
  logoCheckWhite: {
    width: 10,
    height: 6,
    backgroundColor: "#F4F4F6",
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    top: 11,
    left: 2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#101115",
    borderRadius: 20,
    padding: 8,
    marginBottom: 32,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: "#26282E",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  inactiveTabText: {
    color: "#DEC2C6",
  },
  formContainer: {
    width: "100%",
    minHeight: 460,
  },
  inputLabel: {
    color: "#DEC2C6",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 12,
    fontWeight: "500",
  },
  passwordLabelSpacing: {
    marginTop: 18,
  },
  inputOuterContainer: {
    paddingHorizontal: 0,
  },
  inputInnerContainer: {
    backgroundColor: "#26282E",
    borderBottomWidth: 0,
    borderRadius: 24,
    height: 50,
    paddingHorizontal: 16,
  },
  inputText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  leftIconContainer: {
    marginRight: 10,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginRight: 8,
  },
  forgotPasswordText: {
    color: "#DEC2C6",
    fontSize: 12,
    fontWeight: "500",
  },
  actionsContainer: {
    alignItems: "center",
    marginTop: 32,
    gap: 16,
  },
  buttonWrapper: {
    width: "68%",
    alignSelf: "center",
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: "#BE183C",
    borderRadius: 18,
    height: 52,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  googleButton: {
    backgroundColor: "#565555",
    borderRadius: 18,
    height: 52,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  googleIcon: {
    marginRight: 12,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  registerLinkText: {
    color: "#DEC2C6",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default styles;
