import { useMacros } from "@/context/MacrosContext";
import { fetchGains } from "@/libs/gemini";
import axios from "axios";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

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
}`;

type UserProfile = {
  id: number;
  name: string;
  age: number;
  weight: number;
  height: number;
  activity_level: string;
  goal: string;
};

export default function Profile() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { fetchUserGoals, showSnack } = useMacros();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.getAllAsync<UserProfile>(
      `SELECT id, name, age, weight, height, activity_level, goal FROM users ORDER BY id DESC LIMIT 1;`,
    ).then((result) => {
      if (result[0]) {
        const u = result[0];
        setUserId(u.id);
        setName(u.name);
        setAge(String(u.age));
        setWeight(String(u.weight));
        setHeight(String(u.height));
        setActivityLevel(u.activity_level);
        setGoal(u.goal);
      }
    });
  }, []);

  const saveProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const req = `Name: ${name}, Age: ${age}, Weight: ${weight}kg, Height: ${height}cm, Activity Level: ${activityLevel}, Goal: ${goal}`;
    try {
      const response = await fetchGains(goalPrompt, req);
      const userData = JSON.parse(response);
      await db.runAsync(
        `UPDATE users SET name=?, age=?, weight=?, height=?, activity_level=?, goal=?, calories=?, protein=?, carbs=?, fats=? WHERE id=?;`,
        [
          name,
          parseInt(age),
          parseFloat(weight),
          parseFloat(height),
          activityLevel,
          goal,
          userData.calorie_goal ? parseInt(userData.calorie_goal) : 2000,
          userData.protein_goal ? parseInt(userData.protein_goal) : 150,
          userData.carbs_goal ? parseInt(userData.carbs_goal) : 250,
          userData.fats_goal ? parseInt(userData.fats_goal) : 65,
          userId,
        ],
      );
      await fetchUserGoals();
      showSnack("Profile updated!");
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 400 || err.response?.status === 403)
      ) {
        setError("Invalid API key. Please update it in Settings → API Key.");
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
          alignItems: "center",
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
          Update your profile. Your macro goals will be recalculated by AI.
        </Text>
        <TextInput
          label="Name"
          mode="outlined"
          disabled={loading}
          value={name}
          onChangeText={setName}
          style={{ width: "80%", marginTop: 8 }}
        />
        <TextInput
          label="Age"
          mode="outlined"
          disabled={loading}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={{ width: "80%", marginTop: 8 }}
        />
        <TextInput
          label="Weight (kg)"
          mode="outlined"
          disabled={loading}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={{ width: "80%", marginTop: 8 }}
        />
        <TextInput
          label="Height (cm)"
          mode="outlined"
          disabled={loading}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={{ width: "80%", marginTop: 8 }}
        />
        <TextInput
          label="Activity Level (Lightly Active, Active, Very Active)"
          mode="outlined"
          disabled={loading}
          value={activityLevel}
          onChangeText={setActivityLevel}
          style={{ width: "80%", marginTop: 8 }}
        />
        <TextInput
          label="Goal (e.g., Lose Weight, Maintain Weight, Gain Muscle)"
          mode="outlined"
          disabled={loading}
          value={goal}
          onChangeText={setGoal}
          style={{ width: "80%", marginTop: 8 }}
        />
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
        <Button
          mode="contained"
          onPress={saveProfile}
          loading={loading}
          disabled={
            loading ||
            !name ||
            !age ||
            !weight ||
            !height ||
            !activityLevel ||
            !goal
          }
          style={{ marginTop: 8 }}
        >
          Save Profile
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
