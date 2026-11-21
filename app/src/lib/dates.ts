const pad = (value: number) => String(value).padStart(2, '0');

/** Local calendar day key, YYYY-MM-DD. */
export const toKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isDayKey = (key: string | undefined): key is string =>
  !!key && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(fromKey(key).getTime());

export const todayKey = (): string => toKey(new Date());

export const addDays = (key: string, days: number): string => {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
};

/** Weeks start on Monday. */
export const weekStart = (key: string): string => {
  const date = fromKey(key);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toKey(date);
};

export const weekDays = (key: string): string[] => {
  const start = weekStart(key);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
};

/** 0 = Sunday … 6 = Saturday, matching Date#getDay. */
export const weekday = (key: string): number => fromKey(key).getDay();

export const workoutDayKey = (workout: { date: string }): string => toKey(new Date(workout.date));

const format = (key: string, options: Intl.DateTimeFormatOptions) => fromKey(key).toLocaleDateString('en-US', options);
export const shortWeekday = (key: string) => format(key, { weekday: 'short' });
export const longWeekday = (key: string) => format(key, { weekday: 'long' });
export const monthDay = (key: string) => format(key, { month: 'short', day: 'numeric' });
export const dayOfMonth = (key: string) => fromKey(key).getDate();

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** Display order Monday → Sunday as getDay indexes. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
