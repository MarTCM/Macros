import { Image, View } from "react-native";
import { Divider, List, Text, useTheme } from "react-native-paper";

const ITEMS = [
  { icon: "tag", title: "Version", value: "0.10.0" },
  { icon: "account", title: "Developer", value: "MarTCM" },
  { icon: "robot", title: "AI Model", value: "Gemini 3.0 Flash Preview" },
  { icon: "database", title: "Storage", value: "SQLite (local)" },
  { icon: "license", title: "License", value: "GNU GPL v3.0" },
];

export default function About() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          alignItems: "center",
          paddingVertical: 40,
          gap: 8,
        }}
      >
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 100, height: 100, borderRadius: 20 }}
        />
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.onBackground }}
        >
          Macros
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Track your nutrition with AI
        </Text>
      </View>

      <View>
        {ITEMS.map((item, i) => (
          <View key={item.title}>
            <List.Item
              title={item.title}
              right={() => (
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    alignSelf: "center",
                    paddingRight: 8,
                  }}
                >
                  {item.value}
                </Text>
              )}
              left={(props) => <List.Icon {...props} icon={item.icon} />}
              titleStyle={{ color: theme.colors.onSurface }}
              style={{ backgroundColor: theme.colors.surface }}
            />
            {i < ITEMS.length - 1 && <Divider />}
          </View>
        ))}
      </View>

      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.onSurfaceVariant,
          textAlign: "center",
          marginTop: "auto",
          paddingBottom: 32,
        }}
      >
        All data is stored locally on your device.
      </Text>
    </View>
  );
}
