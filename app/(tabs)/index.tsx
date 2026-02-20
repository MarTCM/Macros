import CircularProgress from "@/components/CircularProgress";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function Index() {
  const theme = useTheme();

  // Replace these with your real state/data later
  const caloriesCurrent = 1500;
  const caloriesGoal = 2000;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 32,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text
        variant="headlineMedium"
        style={{ color: theme.colors.onBackground }}
      >
        Today's Intake
      </Text>
      <CircularProgress
        current={caloriesCurrent}
        goal={caloriesGoal}
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
          current={80}
          goal={150}
          size={120}
          strokeWidth={10}
          label="Protein"
          unit="g"
          color="#E53935" // red
        />
        <CircularProgress
          current={200}
          goal={250}
          size={120}
          strokeWidth={10}
          label="Carbs"
          unit="g"
          color="#FB8C00" // orange
        />
        <CircularProgress
          current={55}
          goal={65}
          size={120}
          strokeWidth={10}
          label="Fat"
          unit="g"
          color="#8E24AA" // purple
        />
      </View>
    </View>
  );
}
