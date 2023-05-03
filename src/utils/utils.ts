import { DateTime } from 'luxon';

/**
 * Takes a date string formatted as yyyy-mm-dd and returns a corresponding DateTime object.
 * @param dateString The date string formatted as yyyy-mm-dd
 * @returns A DateTime object matching this date.
 */
export const getDateTimeFromDateString = (dateString: string): DateTime => {
  const [year, month, day] = dateString.split('-');
  const dateTime = DateTime.local(
    parseInt(year),
    parseInt(month),
    parseInt(day)
  );

  return dateTime;
};

/**
 * Utility function for simulating a delay (for example, an API call)
 * @param ms the number of milliseconds to sleep for
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default {
  getDateTimeFromDateString,
  sleep,
};
