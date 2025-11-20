import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type DateSelectorProps = {
  onDateSelected?: (date: string) => void;
};

export default function DateSelector({ onDateSelected }: DateSelectorProps) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = selectedDate.toISOString().split("T")[0];
      onDateSelected?.(formatted);  // <- ENVÍA YYYY-MM-DD al padre
    }
  };

  const formatDate = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  return (
    <View>
      <Text style={styles.label}>Fecha</Text>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
      >
        <Text>{formatDate(date)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 5
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8
  }
});
