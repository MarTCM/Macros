import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

export type Meal = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type Props = {
  meal: Meal | null;
  visible: boolean;
  onDismiss: () => void;
};

export default function MealDetailDialog({ meal, visible, onDismiss }: Props) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title>{meal?.name ?? ""}</Dialog.Title>
        <Dialog.Content>
          {meal && (
            <>
              <Text variant="bodyMedium">
                🔥 <Text style={{ fontWeight: "bold" }}>Calories:</Text>{" "}
                {meal.calories}
              </Text>
              <Text variant="bodyMedium">
                💪 <Text style={{ fontWeight: "bold" }}>Protein:</Text>{" "}
                {meal.protein}
              </Text>
              <Text variant="bodyMedium">
                🌾 <Text style={{ fontWeight: "bold" }}>Carbs:</Text>{" "}
                {meal.carbs}
              </Text>
              <Text variant="bodyMedium">
                🧈 <Text style={{ fontWeight: "bold" }}>Fats:</Text>{" "}
                {meal.fats}{" "}
              </Text>
            </>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
