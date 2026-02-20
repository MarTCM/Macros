import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme,
  PaperProvider,
  useTheme,
} from "react-native-paper";

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Brand
    primary: "#2E7D32", // deep green — energy, health
    onPrimary: "#FFFFFF",
    primaryContainer: "#A5D6A7", // soft green container
    onPrimaryContainer: "#1B5E20",

    // Accent — warm amber for calories/energy highlights
    secondary: "#F57F17",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#FFE082",
    onSecondaryContainer: "#E65100",

    // Tertiary — blue for hydration/water tracking
    tertiary: "#0277BD",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#B3E5FC",
    onTertiaryContainer: "#01579B",

    // Surfaces
    background: "#F9FBF9",
    onBackground: "#1C1C1C",
    surface: "#FFFFFF",
    onSurface: "#1C1C1C",
    surfaceVariant: "#E8F5E9",
    onSurfaceVariant: "#4A6349",

    // Feedback
    error: "#B00020",
    onError: "#FFFFFF",
    errorContainer: "#FDECEA",
    onErrorContainer: "#7F0015",

    outline: "#79A079",
    outlineVariant: "#C8E6C9",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Brand — lighter greens for dark backgrounds
    primary: "#81C784",
    onPrimary: "#003A04",
    primaryContainer: "#1B5E20",
    onPrimaryContainer: "#A5D6A7",

    // Accent — softer amber
    secondary: "#FFB74D",
    onSecondary: "#4A2000",
    secondaryContainer: "#7A3E00",
    onSecondaryContainer: "#FFE082",

    // Tertiary — lighter blue
    tertiary: "#4FC3F7",
    onTertiary: "#003E5B",
    tertiaryContainer: "#01579B",
    onTertiaryContainer: "#B3E5FC",

    // Surfaces
    background: "#121712",
    onBackground: "#E2E8E2",
    surface: "#1E2620",
    onSurface: "#E2E8E2",
    surfaceVariant: "#2A342B",
    onSurfaceVariant: "#A0B8A0",

    // Feedback
    error: "#CF6679",
    onError: "#640020",
    errorContainer: "#8C0030",
    onErrorContainer: "#FFB3BC",

    outline: "#5A7A5A",
    outlineVariant: "#2E4A2E",
  },
};

function AppStack() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AppStack />
    </PaperProvider>
  );
}
