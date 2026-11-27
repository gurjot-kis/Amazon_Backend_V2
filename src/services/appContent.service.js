import Store from "../models/store.model.js";
import { AppError } from "../utils/AppError.js";

const to12h = (time) => {
  if (!time) return "";

  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;

  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const DAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const formatTimings = (timings = []) => {
  if (!timings.length) return [];

  const ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const sorted = [...timings].sort(
    (a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day),
  );

  const groups = [];
  let group = null;

  for (const t of sorted) {
    const key = t.is_closed ? "closed" : `${t.open_time}-${t.close_time}`;

    if (group && group.key === key) {
      group.end = t.day;
    } else {
      group = {
        key,
        start: t.day,
        end: t.day,
        timing: t,
      };

      groups.push(group);
    }
  }

  return groups.map(({ start, end, timing }) => {
    const dayLabel =
      start === end
        ? DAY_SHORT[start]
        : `${DAY_SHORT[start]} - ${DAY_SHORT[end]}`;

    if (timing.is_closed) {
      return { days: dayLabel, hours: "Closed" };
    }

    return {
      days: dayLabel,
      hours: `${to12h(timing.open_time)} - ${to12h(timing.close_time)}`,
    };
  });
};

export const AppContentService = {
  getContactAndTimings: async () => {
    const store = await Store.findOne(
      { status: "active" },
      {
        store_logo: 1,
        email: 1,
        phone: 1,
        countryCode: 1,
        location: 1,
        timings: 1,
      },
    ).lean();

    if (!store) {
      throw new AppError(404, "Store not found");
    }

    return {
      _id: store._id,
      store_logo: store.store_logo,
      email: store.email,
      countryCode: store.countryCode,
      phone: store.phone,
      latitude: store.location?.coordinates?.[1] ?? null,
      longitude: store.location?.coordinates?.[0] ?? null,
      timings: formatTimings(store.timings),
    };
  },
};

export default AppContentService;
