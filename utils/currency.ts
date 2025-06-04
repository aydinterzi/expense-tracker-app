export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseCurrencyInput = (input: string): number => {
  // Remove currency symbols and spaces
  const cleanInput = input.replace(/[$,\s]/g, "");
  const parsed = parseFloat(cleanInput);
  return isNaN(parsed) ? 0 : parsed;
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999.99;
};
