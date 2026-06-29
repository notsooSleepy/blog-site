const WARSAW_TIME_ZONE = "Europe/Warsaw";

const shortDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: WARSAW_TIME_ZONE
});

const longDateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: WARSAW_TIME_ZONE
});

const yearFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  timeZone: WARSAW_TIME_ZONE
});

export const formatShortDate = (date: Date) => shortDateFormatter.format(date);
export const formatLongDate = (date: Date) => longDateFormatter.format(date);
export const formatYear = (date: Date) => yearFormatter.format(date);
