import { useState } from "react";
import { View } from "react-native";
import { List, Text, useTheme } from "react-native-paper";
import {
  DatePickerInput,
  enGB,
  registerTranslation,
} from "react-native-paper-dates";
import MealDetailDialog, { Meal } from "../../components/MealDetailDialog";
import { useMacros } from "../../context/MacrosContext";

registerTranslation("en-GB", enGB);

export default function History() {
  const theme = useTheme();
  const { searchDate, todayMeals } = useMacros();
  const [dateMeals, setDateMeals] = useState<Meal[]>(todayMeals);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [inputDate, setInputDate] = useState<Date | undefined>(new Date());

  const handleDateChange = async (date: Date | undefined) => {
    setInputDate(date);
    if (date) {
      const meals = await searchDate(date);
      setDateMeals(meals);
    } else {
      setDateMeals([]);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={{ width: "90%", marginTop: 16 }}>
        <DatePickerInput
          locale="en-GB"
          label="Birthdate"
          value={inputDate}
          onChange={(d) => {
            setInputDate(d);
            handleDateChange(d);
          }}
          inputMode="start"
          style={{ marginTop: 32 }}
          mode="outlined"
        />
      </View>
      {dateMeals.length === 0 ? (
        <Text
          variant="bodyMedium"
          style={{
            justifyContent: "center",
            marginTop: 40,
            alignItems: "center",
            color: theme.colors.onSurfaceVariant,
          }}
        >
          No meals logged yet. Start adding some gains!
        </Text>
      ) : (
        <List.Section style={{ width: "100%", marginTop: 40 }}>
          {dateMeals.map((meal) => (
            <List.Item
              key={meal.id}
              title={meal.name}
              description={`${meal.calories} · ${meal.protein} P · ${meal.carbs} C · ${meal.fats} F`}
              left={(props) => <List.Icon {...props} icon="food" />}
              onPress={() => setSelectedMeal(meal)}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              style={{ backgroundColor: theme.colors.surface }}
            />
          ))}
        </List.Section>
      )}
      <MealDetailDialog
        meal={selectedMeal}
        visible={!!selectedMeal}
        onDismiss={() => setSelectedMeal(null)}
      />
    </View>
  );
}
