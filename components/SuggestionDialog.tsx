import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

type Props = {
  text: string;
  visible: boolean;
  onDismiss: () => void;
  logMeal: (mealData: any, favorite: boolean) => Promise<void>;
};

export default function SuggestionDialogBox({
  text,
  visible,
  onDismiss,
  logMeal,
}: Props) {
  const theme = useTheme();

  const [checked, setChecked] = useState(false);

  let mealData: any = null;
  try {
    if (text) mealData = JSON.parse(text);
  } catch {
    // model returned non-JSON — mealData stays null
  }

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title>Meal Suggestion</Dialog.Title>
        <Dialog.Content>
          {mealData ? (
            <>
              <Text variant="bodyMedium">
                🍽️ <Text style={{ fontWeight: "bold" }}>{mealData.name}</Text>
              </Text>
              <Text variant="bodyMedium">
                🔥 <Text style={{ fontWeight: "bold" }}>Calories:</Text>{" "}
                {mealData.calories}
              </Text>
              <Text variant="bodyMedium">
                💪 <Text style={{ fontWeight: "bold" }}>Protein:</Text>{" "}
                {mealData.protein}
              </Text>
              <Text variant="bodyMedium">
                🌾 <Text style={{ fontWeight: "bold" }}>Carbs:</Text>{" "}
                {mealData.carbs}
              </Text>
              <Text variant="bodyMedium">
                🧈 <Text style={{ fontWeight: "bold" }}>Fats:</Text>{" "}
                {mealData.fats}
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Ingredients:</Text>{" "}
                {mealData.ingredients
                  ? `${mealData.ingredients.join(", ")}.`
                  : ""}
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "bold" }}>Reason:</Text>{" "}
                {mealData.reason}
              </Text>
              <Checkbox.Item
                status={checked ? "checked" : "unchecked"}
                onPress={() => setChecked(!checked)}
                label="Favorite?"
              />
            </>
          ) : (
            <Text variant="bodyMedium">{text || "Analyzing..."}</Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            disabled={!mealData}
            onPress={async () => {
              await logMeal(mealData, checked);
              onDismiss();
            }}
          >
            Add Meal
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
