export const fontFamily = {
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const tailwindFontFamily = {
  "inter-light": [fontFamily.light],
  "inter-regular": [fontFamily.regular],
  "inter-medium": [fontFamily.medium],
  "inter-semibold": [fontFamily.semibold],
  "inter-bold": [fontFamily.bold],
} as const;
