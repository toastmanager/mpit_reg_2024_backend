export function getDateDifferenceInDays(date1: Date, date2: Date) {
  const startDate = new Date(date1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date2);
  endDate.setHours(0, 0, 0, 0);

  const timeDifference = endDate.getTime() - startDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return Math.abs(daysDifference);
}
