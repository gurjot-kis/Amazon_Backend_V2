import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

const SUPPORT_TIMINGS = [{ days: "Mon - Fri", hours: "9:00 AM - 9:00 PM" }];

export const AppContentService = {
  getContactAndTimings: async () => {
    const admin = await User.findOne(
      { role: "SuperAdmin" },
      { email: 1, phone: 1, latitude: 1, longitude: 1 },
    ).lean();

    if (!admin) throw new AppError(404, "Admin not found");

    return {
      _id: admin._id,
      email: admin.email,
      phone: admin.phone,
      latitude: admin.latitude ?? null,
      longitude: admin.longitude ?? null,
      timings: SUPPORT_TIMINGS,
    };
  },
};

export default AppContentService;
