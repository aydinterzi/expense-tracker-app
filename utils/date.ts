import { format, parseISO } from "date-fns";

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd");
};

export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM dd, yyyy");
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};
