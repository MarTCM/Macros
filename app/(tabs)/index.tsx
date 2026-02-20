import CircularProgress from "@/components/CircularProgress";
import MealDetailDialog, { Meal } from "@/components/MealDetailDialog";
import { useMacros } from "@/context/MacrosContext";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Divider, List, Text, useTheme } from "react-native-paper";

export default function Index() {
  const theme = useTheme();
  const { todayTotals, todayMeals, fetchTodayProgress } = useMacros();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchTodayProgress();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        gap: 32,
        paddingVertical: 32,
        backgroundColor: theme.colors.background,
      }}
      style={{ backgroundColor: theme.colors.background }}
    >
      <MealDetailDialog
        meal={selectedMeal}
        visible={!!selectedMeal}
        onDismiss={() => setSelectedMeal(null)}
      />

      <Text
        variant="headlineMedium"
        style={{ color: theme.colors.onBackground }}
      >
        Today's Intake
      </Text>

      <CircularProgress
        current={todayTotals.calories}
        goal={2000}
        label="Calories"
        unit="kcal"
      />

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-evenly",
        }}
      >
        <CircularProgress
          current={todayTotals.protein}
          goal={150}
          size={120}
          strokeWidth={10}
          label="Protein"
          unit="g"
          color="#E53935"
        />
        <CircularProgress
          current={todayTotals.carbs}
          goal={250}
          size={120}
          strokeWidth={10}
          label="Carbs"
          unit="g"
          color="#FB8C00"
        />
        <CircularProgress
          current={todayTotals.fats}
          goal={65}
          size={120}
          strokeWidth={10}
          label="Fat"
          unit="g"
          color="#8E24AA"
        />
      </View>

      <View style={{ width: "100%" }}>
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.onBackground,
            paddingHorizontal: 16,
            paddingBottom: 8,
          }}
        >
          Today's Meals
        </Text>
        {todayMeals.length === 0 ? (
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              paddingHorizontal: 16,
            }}
          >
            No meals logged yet. Head to the Gains tab!
          </Text>
        ) : (
          todayMeals.map((meal, i) => (
            <View key={meal.id}>
              <List.Item
                title={meal.name}
                description={`${meal.calories} · ${meal.protein} P · ${meal.carbs} C · ${meal.fats} F`}
                left={(props) => <List.Icon {...props} icon="food" />}
                onPress={() => setSelectedMeal(meal)}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                style={{ backgroundColor: theme.colors.surface }}
              />
              {i < todayMeals.length - 1 && <Divider />}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
