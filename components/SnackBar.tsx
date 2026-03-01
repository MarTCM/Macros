import { Snackbar, useTheme } from "react-native-paper";

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
};

export default function SnackBar({ visible, message, onDismiss }: Props) {
  const theme = useTheme();
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={1500}
      theme={{
        colors: {
          inverseSurface: theme.colors.surface,
          inverseOnSurface: theme.colors.onSurface,
        },
      }}
      style={{
        backgroundColor: theme.colors.surface,
      }}
      action={{
        label: "Close",
        onPress: onDismiss,
        textColor: theme.colors.primary,
      }}
    >
      {message}
    </Snackbar>
  );
}
