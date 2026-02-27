import DialogBox from "@/components/AnalysisDialog";
import { useMacros } from "@/context/MacrosContext";
import { fetchGains, fetchGainsWithImage } from "@/libs/gemini";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import {
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const systemPrompt = `You are an expert nutritionist and dietitian with deep knowledge of food science, macronutrients, and caloric density. Your task is to analyze the meal or food items provided by the user and estimate their nutritional profile as accurately as possible.

CRITICAL INSTRUCTIONS:
1. You must respond STRICTLY and ONLY with a valid JSON object.
2. Do not include any greetings, conversational filler, or markdown formatting (do NOT use \`\`\`json or \`\`\` tags). Just output the raw JSON object.
3. If a meal's portion size is not specified, assume a standard average serving size for an adult.
4. All macro values must include their standard units (e.g., "kcal" for calories, "g" for macros).

Your JSON output must exactly match the following structure:
{
  "name": "<A concise name for the meal, e.g., 'Grilled Chicken Salad'>",
  "calories": "<number> kcal",
  "protein": "<number> g",
  "carbs": "<number> g",
  "fats": "<number> g",
  "evaluation": "<A brief, 1-2 sentence professional evaluation of the meal's nutritional balance and health impact>"
}`;

export default function Gains() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { fetchTodayProgress } = useMacros();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      console.warn("Camera permission denied");
      return;
    }
    const camera = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!camera.canceled) {
      return camera.assets[0].base64;
    }
  }

  async function handleSend() {
    if (!prompt.trim()) return;
    try {
      Keyboard.dismiss();
      setLoading(true);
      const text = await fetchGains(systemPrompt, prompt);
      setResult(text);
      setPrompt("");
      setDialogVisible(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Gemini API error:",
          JSON.stringify(error.response?.data, null, 2),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const logMeal = async (mealData: any) => {
    await db.runAsync(
      `INSERT INTO meals (name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?);`,
      [
        mealData.name,
        mealData.calories,
        mealData.protein,
        mealData.carbs,
        mealData.fats,
      ],
    );
    await fetchTodayProgress();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <DialogBox
          text={result}
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          logMeal={logMeal}
        />
        <Text variant="headlineLarge">What did you eat?</Text>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <TextInput
            label="Describe your meal"
            mode="outlined"
            multiline
            disabled={loading}
            value={prompt}
            onChangeText={setPrompt}
            style={{ width: "80%", marginTop: 16 }}
          />
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              mode="contained"
              loading={loading}
              disabled={loading}
              icon={({ color, size }) => (
                <MaterialIcons name="send" color={color} size={size} />
              )}
              onPress={handleSend}
              style={{ marginLeft: 8 }}
            >
              Gimme Macros!
            </Button>
            <IconButton
              icon="camera"
              mode="outlined"
              disabled={loading}
              loading={loading}
              onPress={async () => {
                const base64Image = await pickImage();
                if (!base64Image) return;
                try {
                  Keyboard.dismiss();
                  setLoading(true);
                  const text = await fetchGainsWithImage(
                    systemPrompt,
                    base64Image,
                  );
                  setResult(text);
                  setDialogVisible(true);
                } catch (error) {
                  if (axios.isAxiosError(error)) {
                    console.error(
                      "Gemini image error:",
                      JSON.stringify(error.response?.data, null, 2),
                    );
                  }
                } finally {
                  setLoading(false);
                }
              }}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
