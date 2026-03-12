import { eachDayOfInterval, parseISO, format } from "date-fns";

// Expects ISO dateStrings with the format "yyyy-MM-dd"
// Example: "2024-01-01"
export const getDateStringInterval = (startDateString, endDateString) => {
  const startDate = parseISO(startDateString);
  const endDate = parseISO(endDateString);

  const interval =
    startDate <= endDate
      ? { start: startDate, end: endDate }
      : { start: endDate, end: startDate };

  return eachDayOfInterval(interval).map((day) => format(day, "yyyy-MM-dd"));
};

// Expects epiWeekStrings with the format "YYYY/W"
// Example: "2024/28"
export const getEpiWeekStringInterval = (
  startEpiWeekString,
  endEpiWeekString,
) => {
  const [startYear, startWeek] = startEpiWeekString
    .split("/")
    .map((x) => parseInt(x));
  const [endYear, endWeek] = endEpiWeekString
    .split("/")
    .map((x) => parseInt(x));

  const yearDiff = endYear - startYear;
  const weekDiff = endWeek - startWeek;
  const totalWeekDiff = yearDiff * 52 + weekDiff;

  let epiWeekStringInterval = [];
  for (let i = 0; i <= totalWeekDiff; i++) {
    const epiWeek = ((startWeek + i - 1) % 52) + 1;
    const epiYear = startYear + Math.floor((startWeek + i - 1) / 52);
    epiWeekStringInterval.push(`${epiYear}/${epiWeek}`);
  }

  return epiWeekStringInterval;
};
