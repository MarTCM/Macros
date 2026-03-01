import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { List, Text, useTheme } from "react-native-paper";

export default function Settings() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text
        variant="headlineMedium"
        style={{
          color: theme.colors.onBackground,
          paddingHorizontal: 16,
          paddingVertical: 24,
        }}
      >
        Settings
      </Text>

      <List.Item
        title="Profile"
        description="View and edit your personal profile"
        left={(props) => <List.Icon {...props} icon="account" />}
        right={(props) => (
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
            style={{ alignSelf: "center" }}
          />
        )}
        onPress={() => router.push("/(tabs)/settings/profile")}
        titleStyle={{ color: theme.colors.onSurface }}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        style={{ backgroundColor: theme.colors.surface }}
      />
      <List.Item
        title="API Key"
        description="Update your Gemini API key"
        left={(props) => <List.Icon {...props} icon="key" />}
        right={(props) => (
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
            style={{ alignSelf: "center" }}
          />
        )}
        onPress={() => router.push("/(tabs)/settings/apikey")}
        titleStyle={{ color: theme.colors.onSurface }}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        style={{ backgroundColor: theme.colors.surface, marginTop: 1 }}
      />
    </View>
  );
}
