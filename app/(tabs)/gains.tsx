import DialogBox from "@/components/Dialog";
import { useMacros } from "@/context/MacrosContext";
import { fetchGains } from "@/libs/gemini";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Keyboard, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function Gains() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { fetchTodayProgress } = useMacros();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);

  async function handleSend() {
    if (!prompt.trim()) return;
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
          value={prompt}
          onChangeText={setPrompt}
          style={{ width: "80%", marginTop: 16 }}
        />
        <Button
          mode="contained"
          icon={({ color, size }) => (
            <MaterialIcons name="send" color={color} size={size} />
          )}
          onPress={handleSend}
          style={{ marginTop: 16, marginLeft: 8 }}
        >
          Gimme Macros!
        </Button>
      </View>
    </View>
  );
}
