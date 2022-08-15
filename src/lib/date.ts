import * as datefns from "date-fns";

export const formatDate = (date: Date | number, format = "yyyy-MM-dd") =>
  datefns.format(new Date(date), format);

export const isValidDate = (value: string | number) =>
  datefns.isValid(new Date(value));

export const isSameDay = (date1: Date, date2: Date) =>
  datefns.isSameDay(date1, date2);
