import { useState, useMemo, useCallback } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function useMonthSelector() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const goToPreviousMonth = useCallback(() => {
    setSelectedMonth((m) => {
      if (m === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedMonth((m) => {
      if (m === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const canGoNext = useMemo(
    () => selectedMonth !== currentMonth || selectedYear !== currentYear,
    [selectedMonth, selectedYear, currentMonth, currentYear],
  );

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  const { startDate, endDate } = useMemo(() => {
    const first = new Date(selectedYear, selectedMonth, 1);
    const last = new Date(selectedYear, selectedMonth + 1, 0);
    return {
      startDate: `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`,
      endDate: `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`,
    };
  }, [selectedMonth, selectedYear]);

  const dateRangeLabel = useMemo(
    () => `${SHORT_MONTHS[selectedMonth]} 1 – ${SHORT_MONTHS[selectedMonth]} ${new Date(selectedYear, selectedMonth + 1, 0).getDate()}, ${selectedYear}`,
    [selectedMonth, selectedYear],
  );

  return {
    selectedMonth,
    selectedYear,
    goToPreviousMonth,
    goToNextMonth,
    canGoNext,
    monthLabel,
    dateRangeLabel,
    startDate,
    endDate,
  };
}
