import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type DateFormat = {
  key: string;
  format: string;
  example: string;
};

export type FirstDayOfWeek = {
  key: string;
  name: string;
  value: number; // 0 = Sunday, 1 = Monday, etc.
};

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export const DATE_FORMATS: DateFormat[] = [
  { key: "MDY", format: "MM/DD/YYYY", example: "12/31/2024" },
  { key: "DMY", format: "DD/MM/YYYY", example: "31/12/2024" },
  { key: "YMD", format: "YYYY/MM/DD", example: "2024/12/31" },
  { key: "MDY_DASH", format: "MM-DD-YYYY", example: "12-31-2024" },
  { key: "DMY_DASH", format: "DD-MM-YYYY", example: "31-12-2024" },
  { key: "YMD_DASH", format: "YYYY-MM-DD", example: "2024-12-31" },
];

export const FIRST_DAY_OPTIONS: FirstDayOfWeek[] = [
  { key: "SUNDAY", name: "Sunday", value: 0 },
  { key: "MONDAY", name: "Monday", value: 1 },
  { key: "SATURDAY", name: "Saturday", value: 6 },
];

interface SettingsState {
  // Theme
  isDarkMode: boolean;

  // Currency
  currency: Currency;

  // Date Format
  dateFormat: DateFormat;

  // First Day of Week
  firstDayOfWeek: FirstDayOfWeek;

  // Actions
  setDarkMode: (isDark: boolean) => void;
  setCurrency: (currency: Currency) => void;
  setDateFormat: (format: DateFormat) => void;
  setFirstDayOfWeek: (day: FirstDayOfWeek) => void;

  // Utility functions
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      isDarkMode: false,
      currency: CURRENCIES[0], // USD
      dateFormat: DATE_FORMATS[0], // MM/DD/YYYY
      firstDayOfWeek: FIRST_DAY_OPTIONS[0], // Sunday

      // Actions
      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
      },

      setCurrency: (currency: Currency) => {
        set({ currency });
      },

      setDateFormat: (format: DateFormat) => {
        set({ dateFormat: format });
      },

      setFirstDayOfWeek: (day: FirstDayOfWeek) => {
        set({ firstDayOfWeek: day });
      },

      // Utility functions
      formatCurrency: (amount: number) => {
        const { currency } = get();
        return `${currency.symbol}${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },

      formatDate: (date: Date) => {
        const { dateFormat } = get();
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();

        switch (dateFormat.key) {
          case "MDY":
            return `${month}/${day}/${year}`;
          case "DMY":
            return `${day}/${month}/${year}`;
          case "YMD":
            return `${year}/${month}/${day}`;
          case "MDY_DASH":
            return `${month}-${day}-${year}`;
          case "DMY_DASH":
            return `${day}-${month}-${year}`;
          case "YMD_DASH":
            return `${year}-${month}-${day}`;
          default:
            return `${month}/${day}/${year}`;
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
