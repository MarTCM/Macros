import MealDetailDialog, { Meal } from "@/components/MealDetailDialog";
import SuggestionDialogBox from "@/components/SuggestionDialog";
import { useMacros } from "@/context/MacrosContext";
import { fetchGains } from "@/libs/gemini";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";

import {
  Button,
  Divider,
  IconButton,
  List,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export const buildSuggestionPrompt = (
  todayCalories: number,
  todayProtein: number,
  todayCarbs: number,
  todayFats: number,
  goalCalories: number,
  goalProtein: number,
  goalCarbs: number,
  goalFats: number,
) => `You are an expert nutritionist and personal chef. The user wants a meal suggestion that fits what they still have left to eat today.

Their daily goals are:
- Calories: ${goalCalories} kcal
- Protein: ${goalProtein}g
- Carbs: ${goalCarbs}g
- Fats: ${goalFats}g

They have already consumed today:
- Calories: ${todayCalories} kcal
- Protein: ${todayProtein}g
- Carbs: ${todayCarbs}g
- Fats: ${todayFats}g

Remaining:
- Calories: ${Math.max(0, goalCalories - todayCalories)} kcal
- Protein: ${Math.max(0, goalProtein - todayProtein)}g
- Carbs: ${Math.max(0, goalCarbs - todayCarbs)}g
- Fats: ${Math.max(0, goalFats - todayFats)}g

CRITICAL INSTRUCTIONS:
1. Suggest a single, realistic meal. It does NOT need to fill all remaining macros — it should cover roughly one portion of what's left (anywhere from a third to two thirds), leaving room for other meals or snacks later in the day.
2. Prioritize balance and practicality over hitting exact numbers. A normal, real-world meal is better than an awkward one engineered to hit targets.
3. Respond STRICTLY and ONLY with a valid JSON object — no markdown, no \`\`\`json tags, no explanation.

Your JSON output must exactly match this structure:
{
  "name": "<concise meal name>",
  "calories": <number>kcal,
  "protein": <number>g,
  "carbs": <number>g,
  "fats": <number>g,
  "ingredients": ["<ingredient 1>", "<ingredient 2>", "..."],
  "reason": "<one sentence explaining why this meal fits the remaining macros>"
}`;

export async function suggestMeal(
  prompt: string,
  todayCalories: number,
  todayProtein: number,
  todayCarbs: number,
  todayFats: number,
  goalCalories: number,
  goalProtein: number,
  goalCarbs: number,
  goalFats: number,
): Promise<string> {
  const systemPrompt = buildSuggestionPrompt(
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFats,
    goalCalories,
    goalProtein,
    goalCarbs,
    goalFats,
  );
  return fetchGains(systemPrompt, prompt);
}

export default function Suggestions() {
  const theme = useTheme();
  const {
    todayTotals,
    searchFavoriteMeals,
    fetchTodayProgress,
    deleteMeal,
    userGoals,
  } = useMacros();
  const db = useSQLiteContext();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  async function handleSend() {
    if (!prompt.trim()) return;
    try {
      Keyboard.dismiss();
      setLoading(true);
      const text = await suggestMeal(
        prompt,
        todayTotals.calories,
        todayTotals.protein,
        todayTotals.carbs,
        todayTotals.fats,
        userGoals.calories,
        userGoals.protein,
        userGoals.carbs,
        userGoals.fats,
      );
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
  const logMeal = async (mealData: any, favorite: boolean) => {
    await db.runAsync(
      `INSERT INTO meals (name, calories, protein, carbs, fats, ingredients, isFavorite) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        mealData.name,
        mealData.calories,
        mealData.protein,
        mealData.carbs,
        mealData.fats,
        mealData.ingredients.join(", "),
        favorite ? 1 : 0,
      ],
    );
    await fetchTodayProgress();
    await loadFavoriteMeals();
  };

  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);

  const loadFavoriteMeals = async () => {
    const meals = await searchFavoriteMeals();
    setFavoriteMeals(meals);
  };

  useEffect(() => {
    loadFavoriteMeals();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",

        gap: 32,
        paddingVertical: 32,
        backgroundColor: theme.colors.background,
      }}
      style={{ backgroundColor: theme.colors.background }}
    >
      <SuggestionDialogBox
        text={result}
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        logMeal={logMeal}
      />
      <MealDetailDialog
        meal={selectedMeal}
        visible={!!selectedMeal}
        onDismiss={() => setSelectedMeal(null)}
      />

      <Text
        variant="headlineMedium"
        style={{ color: theme.colors.onBackground, marginTop: 120 }}
      >
        Want some suggestions?
      </Text>

      <TextInput
        label="What kind of meal do you need?"
        mode="outlined"
        multiline
        value={prompt}
        onChangeText={setPrompt}
        style={{ width: "80%", marginTop: 8 }}
      />
      <Button
        mode="contained"
        loading={loading}
        disabled={loading}
        icon={({ color, size }) => (
          <MaterialCommunityIcons
            name="crystal-ball"
            color={color}
            size={size}
          />
        )}
        onPress={handleSend}
      >
        Suprise Me!
      </Button>

      <View style={{ width: "100%" }}>
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.onBackground,
            paddingHorizontal: 16,
            paddingBottom: 8,
          }}
        >
          Favorite Meals
        </Text>
        {favoriteMeals.length === 0 ? (
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              paddingHorizontal: 16,
            }}
          >
            No favorite meals added yet. Press the heart icon on any meal to add
            it here!
          </Text>
        ) : (
          favoriteMeals.map((meal, i) => (
            <View key={meal.id}>
              <List.Item
                title={meal.name}
                description={`${meal.calories} · ${meal.protein} P · ${meal.carbs} C · ${meal.fats} F`}
                left={(props) => <List.Icon {...props} icon="food" />}
                right={() => (
                  <IconButton
                    icon="delete"
                    onPress={() => deleteMeal(meal.id)}
                  />
                )}
                onPress={() => setSelectedMeal(meal)}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                style={{ backgroundColor: theme.colors.surface }}
              />
              {i < favoriteMeals.length - 1 && <Divider />}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
