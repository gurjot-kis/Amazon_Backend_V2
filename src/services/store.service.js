import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Store from "../models/store.model.js";

const DEFAULT_COUNTRY_CODE = "+91";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(__dirname, "../uploads");

const TEXT_FIELDS = [
  "store_name",
  "store_description",
  "email",
  "phone",
  "address",
  "country",
  "state",
  "city",
  "postal_code",
  "gst_number",
];

const VALID_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const clean = (value) => String(value ?? "").trim();

const isBlank = (value) =>
  value === undefined || value === null || clean(value) === "";

const toBool = (value) => value === true || value === "true";

const assertObjectId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }
};

const normalizeCountryCode = (value) => {
  const code = clean(value);

  if (!code) return DEFAULT_COUNTRY_CODE;

  const normalized = code.startsWith("+") ? code : `+${code}`;

  if (!/^\+\d{1,4}$/.test(normalized)) {
    throw new Error("Invalid country code");
  }

  return normalized;
};

const withCountryCode = (store) => {
  if (!store) return store;

  return {
    ...store,
    countryCode: store.countryCode || DEFAULT_COUNTRY_CODE,
  };
};

const removeFile = (fileUrl) => {
  if (!fileUrl) return;

  const relative = fileUrl.replace(/^\/?uploads\//, "");
  const fullPath = path.resolve(UPLOADS_ROOT, relative);
  const relativePath = path.relative(UPLOADS_ROOT, fullPath);

  // Prevent deleting files outside uploads directory
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return;
  }

  fs.unlink(fullPath, () => {});
};

const parseLocation = (latitude, longitude, { required = false } = {}) => {
  const hasLat = !isBlank(latitude);
  const hasLng = !isBlank(longitude);

  if (!hasLat && !hasLng) {
    if (required) {
      throw new Error("Latitude and longitude are required");
    }

    return null;
  }

  if (hasLat !== hasLng) {
    throw new Error("Both latitude and longitude are required");
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return {
    type: "Point",
    coordinates: [lng, lat],
  };
};

const parseTimings = (raw) => {
  let arr;

  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      throw new Error("timings must be valid JSON");
    }
  } else {
    arr = raw;
  }

  if (!Array.isArray(arr)) {
    throw new Error("timings must be an array");
  }

  const seen = new Set();

  return arr.map((entry, index) => {
    const day = String(entry.day ?? "")
      .toLowerCase()
      .trim();

    if (!VALID_DAYS.includes(day)) {
      throw new Error(
        `timings[${index}].day must be one of: ${VALID_DAYS.join(", ")}`,
      );
    }

    if (seen.has(day)) {
      throw new Error(`Duplicate day in timings: ${day}`);
    }

    seen.add(day);

    const is_closed = toBool(entry.is_closed);

    if (is_closed) {
      return {
        day,
        is_closed: true,
        open_time: "",
        close_time: "",
      };
    }

    const open_time = clean(entry.open_time);
    const close_time = clean(entry.close_time);

    if (!TIME_RE.test(open_time)) {
      throw new Error(`timings[${index}].open_time must be HH:MM (24h)`);
    }

    if (!TIME_RE.test(close_time)) {
      throw new Error(`timings[${index}].close_time must be HH:MM (24h)`);
    }

    if (open_time >= close_time) {
      throw new Error(`timings[${index}]: close_time must be after open_time`);
    }

    return {
      day,
      is_closed: false,
      open_time,
      close_time,
    };
  });
};

const getExistingStore = async () => {
  const store = await Store.findOne().lean();

  return withCountryCode(store);
};

export const StoreService = {
  createStore: async (body = {}, images = {}) => {
    const existingStore = await Store.exists({});

    if (existingStore) {
      throw new Error(
        "Store already exists. Please update the existing store.",
      );
    }

    const store_name = clean(body.store_name);

    if (!store_name) {
      throw new Error("Store name is required");
    }

    if (isBlank(body.address)) {
      throw new Error("Address is required");
    }

    const location = parseLocation(body.latitude, body.longitude, {
      required: true,
    });

    const doc = {
      store_name,
      address: clean(body.address),
      location,
      countryCode: normalizeCountryCode(body.countryCode),
    };

    // Optional text fields
    for (const field of TEXT_FIELDS) {
      if (
        field !== "store_name" &&
        field !== "address" &&
        body[field] !== undefined
      ) {
        doc[field] = clean(body[field]);
      }
    }

    // Store timings
    if (body.timings !== undefined) {
      doc.timings = parseTimings(body.timings);
    }

    // Store images
    if (images.store_logo) {
      doc.store_logo = images.store_logo;
    }

    if (images.store_banner) {
      doc.store_banner = images.store_banner;
    }

    const created = await Store.create(doc);

    return withCountryCode(created.toObject());
  },

  getStore: async () => {
    return getExistingStore();
  },

  updateStore: async (body = {}, images = {}) => {
    const store = await Store.findOne();

    if (!store) {
      throw new Error("Store not found. Please create the store first.");
    }

    const $set = {};
    const filesToDelete = [];

    // Update text fields
    for (const field of TEXT_FIELDS) {
      if (body[field] === undefined) continue;

      const value = clean(body[field]);

      if ((field === "store_name" || field === "address") && !value) {
        throw new Error(
          `${field === "store_name" ? "Store name" : "Address"} cannot be empty`,
        );
      }

      $set[field] = value;
    }

    // Update country code
    if (body.countryCode !== undefined) {
      $set.countryCode = normalizeCountryCode(body.countryCode);
    }

    // Update location
    if (body.latitude !== undefined || body.longitude !== undefined) {
      $set.location = parseLocation(body.latitude, body.longitude, {
        required: true,
      });
    }

    // Update store logo
    if (images.store_logo) {
      $set.store_logo = images.store_logo;

      if (store.store_logo) {
        filesToDelete.push(store.store_logo);
      }
    } else if (toBool(body.remove_logo)) {
      $set.store_logo = "";

      if (store.store_logo) {
        filesToDelete.push(store.store_logo);
      }
    }

    // Update store banner
    if (images.store_banner) {
      $set.store_banner = images.store_banner;

      if (store.store_banner) {
        filesToDelete.push(store.store_banner);
      }
    } else if (toBool(body.remove_banner)) {
      $set.store_banner = "";

      if (store.store_banner) {
        filesToDelete.push(store.store_banner);
      }
    }

    // Update or clear timings
    if (body.timings !== undefined) {
      if (body.timings === null || body.timings === "") {
        $set.timings = [];
      } else {
        $set.timings = parseTimings(body.timings);
      }
    }

    if (!Object.keys($set).length) {
      return withCountryCode(store.toObject());
    }

    const updated = await Store.findByIdAndUpdate(
      store._id,
      { $set },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    // Delete old images only after successful DB update
    filesToDelete.forEach(removeFile);

    return withCountryCode(updated);
  },

  deleteStore: async () => {
    const store = await Store.findOne();

    if (!store) {
      throw new Error("Store not found");
    }

    // TODO: Check whether products or orders reference this store
    await Store.deleteOne({ _id: store._id });

    removeFile(store.store_logo);
    removeFile(store.store_banner);

    return {
      message: "Store deleted successfully",
    };
  },
};

export default StoreService;
