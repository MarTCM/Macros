import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

type Props = {
  text: string;
  visible: boolean;
  onDismiss: () => void;
};

export default function DialogBox({ text, visible, onDismiss }: Props) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Dialog.Title>Meal Analysis</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{text}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Okay</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
