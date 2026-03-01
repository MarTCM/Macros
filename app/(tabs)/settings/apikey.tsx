import { fetchGains } from "@/libs/gemini";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function ApiKey() {
  const theme = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("geminiApiKey").then((key) => {
      if (key) setApiKey(key);
    });
  }, []);

  const saveApiKey = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      // Validate with a minimal test call
      await fetchGains("Reply with valid JSON only.", "{}");
      await SecureStore.setItemAsync("geminiApiKey", apiKey);
      setSaved(true);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 400 || err.response?.status === 403)
      ) {
        setError("Invalid API key. Please check and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          paddingVertical: 32,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onSurfaceVariant,
            width: "80%",
            marginBottom: 16,
          }}
        >
          Enter your Gemini API key. You can get one at{" "}
          <Text style={{ color: theme.colors.primary }}>
            aistudio.google.com
          </Text>
          .
        </Text>
        <TextInput
          label="Gemini API Key"
          mode="outlined"
          secureTextEntry
          disabled={loading}
          value={apiKey}
          onChangeText={(v) => {
            setApiKey(v);
            setError(null);
            setSaved(false);
          }}
          style={{ width: "80%" }}
        />
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
        <HelperText type="info" visible={saved}>
          API key saved successfully!
        </HelperText>
        <Button
          mode="contained"
          onPress={saveApiKey}
          loading={loading}
          disabled={loading || !apiKey}
        >
          Save
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
