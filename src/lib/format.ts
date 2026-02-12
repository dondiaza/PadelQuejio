const madridDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

const madridDateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

const madridHourFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: Date | string) {
  return madridDateFormatter.format(asDate(value));
}

export function formatDateTime(value: Date | string) {
  return madridDateTimeFormatter.format(asDate(value));
}

export function formatHour(value: Date | string) {
  return madridHourFormatter.format(asDate(value));
}

export function formatEur(value: number) {
  return eurFormatter.format(value);
}
