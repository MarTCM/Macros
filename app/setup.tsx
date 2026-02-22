import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { fetchGains } from "../libs/gemini";

const goalPrompt = `You are an expert sports nutritionist and dietitian. Your task is to calculate optimal daily nutritional targets based on the user's physical profile: Name, Age, Weight, Height, and Activity Level. 
CRITICAL INSTRUCTIONS:
1. You must respond STRICTLY and ONLY with a valid JSON object.
2. Do not include any greetings, conversational filler, or markdown formatting (do NOT use \`\`\`json or \`\`\` tags). Just output the raw JSON object.
3. Base your calculations on established nutritional formulas (e.g., Mifflin-St Jeor or Harris-Benedict) adjusted for the provided activity level. 
4. Ensure protein targets support muscle maintenance/growth based on the activity level, and provide adequate fats for hormonal health.

Your JSON output must exactly match the following structure:
{
  "calorie_goal": "<number> kcal",
  "protein_goal": "<number> g",
  "carbs_goal": "<number> g",
  "fats_goal": "<number> g"
}
`;

const storeSetupData = async (value: string) => {
  try {
    await AsyncStorage.setItem("isSetupComplete", value);
  } catch (e) {
    // saving error
    console.error("Error saving setup data:", e);
  }
};

export const getSetupData = async () => {
  try {
    const value = await AsyncStorage.getItem("isSetupComplete");
    if (value == "true") {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export default function AppSetup() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const completeSetup = async () => {
    setLoading(true);
    const req = `Name: ${name}, Age: ${age}, Weight: ${weight}kg, Height: ${height}cm, Activity Level: ${activityLevel}, Goal: ${goal}`;
    try {
      const response = await fetchGains(goalPrompt, req);
      const userData = JSON.parse(response);
      await db.runAsync(
        `INSERT INTO users (name, age, weight, height, calories, protein, carbs, fats, activity_level, goal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          name,
          parseInt(age),
          parseFloat(weight),
          parseFloat(height),
          userData.calorie_goal ? parseInt(userData.calorie_goal) : 2000,
          userData.protein_goal ? parseInt(userData.protein_goal) : 150,
          userData.carbs_goal ? parseInt(userData.carbs_goal) : 250,
          userData.fats_goal ? parseInt(userData.fats_goal) : 65,
          activityLevel,
          goal,
        ],
      );
      await storeSetupData("true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Setup error:", error);
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
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          paddingVertical: 32,
          backgroundColor: theme.colors.background,
        }}
        style={{ backgroundColor: theme.colors.background }}
      >
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.onBackground }}
        >
          Welcome to Macros!
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onBackground, marginTop: 16 }}
        >
          Let's start by setting up your profile.
        </Text>
        <TextInput
          label="Name"
          mode="outlined"
          disabled={loading}
          value={name}
          onChangeText={setName}
          style={{ width: "80%", marginTop: 16 }}
        />
        <TextInput
          label="Age"
          mode="outlined"
          disabled={loading}
          value={age}
          onChangeText={setAge}
          style={{ width: "80%", marginTop: 16 }}
        />
        <TextInput
          label="Weight (kg)"
          mode="outlined"
          disabled={loading}
          value={weight}
          onChangeText={setWeight}
          style={{ width: "80%", marginTop: 16 }}
        />
        <TextInput
          label="Height (cm)"
          mode="outlined"
          disabled={loading}
          value={height}
          onChangeText={setHeight}
          style={{ width: "80%", marginTop: 16 }}
        />
        <TextInput
          label="Activity Level (Lightly Active, Active, Very Active)"
          mode="outlined"
          disabled={loading}
          value={activityLevel}
          onChangeText={setActivityLevel}
          style={{ width: "80%", marginTop: 16 }}
        />
        <TextInput
          label="Goal (e.g., Lose Weight, Maintain Weight, Gain Muscle)"
          mode="outlined"
          disabled={loading}
          value={goal}
          onChangeText={setGoal}
          style={{ width: "80%", marginTop: 16 }}
        />
        <Button
          mode="contained"
          onPress={completeSetup}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 32 }}
        >
          Complete Setup
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
