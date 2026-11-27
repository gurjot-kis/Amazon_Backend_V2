import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import Store from "../models/store.model.js";
import { toObjectId } from "../utils/object-id.js";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return Number(
    (earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2),
  );
};

export const DeliveryService = {
  getCheckoutLocationDetails: async (user_id) => {
    const userId = toObjectId(user_id, "user_id");

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
      status: 1,
    })
      .select("_id")
      .lean();

    if (!user) throw new Error("User not found");

    // Fetch user's default address and SuperAdmin store coordinates
    const [address, store] = await Promise.all([
      Address.findOne({
        user_id: userId,
        isDefault: true,
      })
        .select("latitude longitude")
        .lean(),

      Store.findOne({
        status: "active",
      })
        .select("location")
        .lean(),
    ]);

    const userCoordinates = {
      latitude: address?.latitude ?? null,
      longitude: address?.longitude ?? null,
    };

    const storeCoordinates = {
      latitude: store?.location?.coordinates?.[1] ?? null,
      longitude: store?.location?.coordinates?.[0] ?? null,
    };

    let distanceKm = null;

    if (
      userCoordinates.latitude !== null &&
      userCoordinates.longitude !== null &&
      storeCoordinates.latitude !== null &&
      storeCoordinates.longitude !== null &&
      Number.isFinite(Number(userCoordinates.latitude)) &&
      Number.isFinite(Number(userCoordinates.longitude))
    ) {
      distanceKm = calculateDistance(
        Number(userCoordinates.latitude),
        Number(userCoordinates.longitude),
        Number(storeCoordinates.latitude),
        Number(storeCoordinates.longitude),
      );
    }

    return {
      user_coordinates: userCoordinates,
      store_coordinates: storeCoordinates,
      distance: distanceKm !== null ? `${distanceKm} km` : null,
    };
  },
};

export default DeliveryService;
