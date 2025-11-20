declare module "react-native-calendar-picker" {
  import { Component } from "react";

  interface CalendarPickerProps {
    onDateChange?: (date: any, type?: string) => void;
    selectedStartDate?: any;
    selectedEndDate?: any;
    weekdays?: string[];
    months?: string[];
    previousTitle?: string;
    nextTitle?: string;
    todayBackgroundColor?: string;
    selectedDayColor?: string;
    selectedDayTextColor?: string;
  }

  export default class CalendarPicker extends Component<CalendarPickerProps> {}
}
