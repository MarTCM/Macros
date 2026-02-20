import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Svg, { Circle, G } from "react-native-svg";

type Props = {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  unit?: string;
  /** Fixed arc color. If omitted, falls back to theme primary/secondary/error. */
  color?: string;
};

export default function CircularProgress({
  current,
  goal,
  size = 180,
  strokeWidth = 14,
  label = "Calories",
  unit = "kcal",
  color,
}: Props) {
  const theme = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  // Over-goal always shows error red; otherwise use the explicit color or theme fallback
  const progressColor =
    progress >= 1
      ? theme.colors.error
      : (color ??
        (progress >= 0.85 ? theme.colors.secondary : theme.colors.primary));

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* Rotate so the arc starts at the top */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.surfaceVariant}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center text overlay */}
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          variant="headlineMedium"
          style={{ color: progressColor, fontWeight: "bold" }}
        >
          {current}
        </Text>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          / {goal} {unit}
        </Text>
        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
