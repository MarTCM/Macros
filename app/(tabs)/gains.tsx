import DialogBox from "@/components/Dialog";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { useState } from "react";
import { Keyboard, View } from "react-native";
import { IconButton, Text, TextInput, useTheme } from "react-native-paper";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `You are an expert nutritionist and dietitian with deep knowledge of food science, macronutrients, and caloric density. Your task is to analyze the meal or food items provided by the user and estimate their nutritional profile as accurately as possible.

CRITICAL INSTRUCTIONS:
1. You must respond STRICTLY and ONLY with a valid JSON object.
2. Do not include any greetings, conversational filler, or markdown formatting (do NOT use \`\`\`json or \`\`\` tags). Just output the raw JSON object.
3. If a meal's portion size is not specified, assume a standard average serving size for an adult.
4. All macro values must include their standard units (e.g., "kcal" for calories, "g" for macros).

Your JSON output must exactly match the following structure:
{
  "calories": "<number> kcal",
  "protein": "<number> g",
  "carbs": "<number> g",
  "fats": "<number> g",
  "evaluation": "<A brief, 1-2 sentence professional evaluation of the meal's nutritional balance and health impact>"
}`;

async function fetchGains(prompt: string): Promise<string> {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    },
  );
  return response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export default function Gains() {
  const theme = useTheme();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);

  async function handleSend() {
    try {
      Keyboard.dismiss();
      const text = await fetchGains(prompt);
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
    }
  }

  return (
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
          value={prompt}
          onChangeText={setPrompt}
          style={{ width: "80%", marginTop: 16 }}
        />
        <IconButton
          mode="contained"
          icon={({ color, size }) => (
            <MaterialIcons name="send" color={color} size={size} />
          )}
          onPress={handleSend}
          style={{ marginTop: 16, marginLeft: 8 }}
        />
      </View>
    </View>
  );
}
