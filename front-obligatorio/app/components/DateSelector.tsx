import React from "react";
import { View, StyleSheet } from "react-native";
import CalendarPicker from "react-native-calendar-picker";

interface DateSelectorProps {
  onDateSelected: (date: string) => void;
}

export default function DateSelector({ onDateSelected }: DateSelectorProps) {
  const handleDateChange = (date: any) => {
    if (!date) return;
    // convertimos a string YYYY-MM-DD
    const formatted = date.format("YYYY-MM-DD");
    onDateSelected(formatted);
  };

  return (
    <View style={styles.container}>
      <CalendarPicker
        onDateChange={handleDateChange}
        weekdays={["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
        months={[
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Setiembre",
          "Octubre",
          "Noviembre",
          "Diciembre"
        ]}
        todayBackgroundColor="#e6ffe6"
        selectedDayColor="#0066cc"
        selectedDayTextColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});
