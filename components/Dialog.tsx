import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

type Props = {
  text: string;
  visible: boolean;
  onDismiss: () => void;
  logMeal: (mealData: any) => Promise<void>;
};

export default function DialogBox({
  text,
  visible,
  onDismiss,
  logMeal,
}: Props) {
  const theme = useTheme();

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
        <Dialog.Title>Meal Analysis</Dialog.Title>
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
                {mealData.evaluation}
              </Text>
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
              await logMeal(mealData);
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
