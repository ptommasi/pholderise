import { logger } from "./logger";

export const __1_MINUTE__ = 60 * 1000;
export const __1_HOUR__ = 60 * __1_MINUTE__;

export function addZ(n: number) { return n < 10? '0' + n :'' + n; }

export function addZZ(n: number) {
  if (n < 10) {
    return '00' + n;
  } else if (n < 100) {
    return '0' + n;
  } else {
    return n;
  }
}

export function inMinutes(milliseconds: number) {
  const inSeconds = Math.round(milliseconds / 1000);
  const seconds = addZ(inSeconds % 60);
  const minutes = Math.floor(inSeconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const minuteZ = addZ(minutes % 60);
    return `${hours}:${minuteZ}:${seconds}`;
  } else {
    return `${minutes}:${seconds}`;
  }
}

export function inSeconds(milliseconds: number) {
  const inSeconds = (milliseconds / 1000).toFixed(3);
  return inSeconds;
}

export function onlyMinutes(milliseconds: number) {
  const inSeconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(inSeconds / 60);
  return minutes;
}

// day could come as "WEDNESDAY 06/16/2021" or just as "06/16/2021"
const __day_regex__ = RegExp("([0-9]{2})/([0-9]{2})/([0-9]{4})");

// hours, minutes, a space (ignored), and then AM or PM
const __time_regex__ = RegExp("^([0-9]{1,2}):([0-9]{1,2})[\\s]*(am|pm|AM|PM)");

export function getDateFromAmericanDay(americanCalendarDay: string) {

  if (!__day_regex__.test(americanCalendarDay)) {
    logger.error(`Day ${americanCalendarDay} doesn't follow the {2 digits}/{2 digits}/{4 digits} format.`);
    throw Error("Wrong day time format.");
  }

  const [ _1, month, day, year ] = americanCalendarDay.match(__day_regex__).map(n => parseInt(n));

  return { day, month, year };

}

export function getTime(clockTime: string) {

  if (!__time_regex__.test(clockTime)) {
    logger.error(`Time ${clockTime} doesn't follow the {hours}:{minutes} {AM|PM} format.`);
    throw Error("Wrong clock time format.");
  }

  const [ _2, hoursStr, minutesStr, meridiem ] = clockTime.toUpperCase().match(__time_regex__);

  const hours = parseInt(hoursStr) + (meridiem === "PM" && hoursStr !== "12" ? 12 : 0);
  const minutes = parseInt(minutesStr);

  return { hours, minutes };

}

/**
 * 
 * @param americanCalendarDay a date in the american format, e.g. "06/02/2021" for the 2nd June 2021
 * @param clockTime           the time in the "6:30 PM" or "8:30 AM" format;
 */
export function toDate(americanCalendarDay: string, clockTime: string) {

  const { day, month, year } = getDateFromAmericanDay(americanCalendarDay);
  const { hours, minutes } = getTime(clockTime);

  // month is 0-indexed
  return new Date(year, month - 1, day, hours, minutes);

}
