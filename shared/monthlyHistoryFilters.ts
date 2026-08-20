export type MonthlyHistoryFilterRow = {
  currency: string;
  monthKey: string;
};

export type MonthlyHistoryFilters = {
  currency: string;
  startMonth?: string;
  endMonth?: string;
};

export function isMonthlyRangeValid(startMonth?: string, endMonth?: string) {
  return !(startMonth && endMonth && startMonth > endMonth);
}

export function filterMonthlyHistory<T extends MonthlyHistoryFilterRow>(rows: T[], filters: MonthlyHistoryFilters) {
  if (!isMonthlyRangeValid(filters.startMonth, filters.endMonth)) return [];
  return rows
    .filter(row => row.currency === filters.currency)
    .filter(row => !filters.startMonth || row.monthKey >= filters.startMonth)
    .filter(row => !filters.endMonth || row.monthKey <= filters.endMonth)
    .slice()
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey));
}
