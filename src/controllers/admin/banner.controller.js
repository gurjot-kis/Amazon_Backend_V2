import { sendSuccess } from "../../helpers/response.helper.js";
import BannerService from "../../services/banner.service.js";

const sendError = (res, code, message) => {
  return res.status(code).json({
    success: false,
    code,
    message,
    data: null,
  });
};

const handleError = (res, err, fallbackMessage) => {
  const message = err?.message || fallbackMessage;

  if (message === "Banner not found") {
    return sendError(res, 404, message);
  }

  if (
    message.includes("required") ||
    message.includes("invalid") ||
    message.includes("must be") ||
    message.includes("cannot be") ||
    message.includes("modified concurrently")
  ) {
    return sendError(
      res,
      message.includes("modified concurrently") ? 409 : 400,
      message,
    );
  }

  return sendError(res, 500, fallbackMessage);
};

const mergeBody = (req) => {
  const body = { ...(req.body || {}) };

  delete body.vendor_id;
  delete body.store_id;
  delete body.image;

  return body;
};

export const BannerController = {
  createBanner: async (req, res) => {
    try {
      const payload = mergeBody(req);

      if (req.file) {
        payload.banner_image = `/uploads/banners/${req.file.filename}`;
      }

      const data = await BannerService.createBanner(payload);

      return sendSuccess(res, {
        code: 201,
        message: "Banner created successfully",
        data,
      });
    } catch (err) {
      console.log("err", err)
      return handleError(res, err, "Banner creation failed");
    }
  },

  listBanners: async (req, res) => {
    try {
      const {
        page,
        limit,
        search,
        status,
        upload_area,
        position,
        device_type,
      } = req.query || {};

      const { items, pagination } = await BannerService.listBanners({
        page,
        limit,
        search,
        status,
        upload_area,
        position,
        device_type,
      });

      return sendSuccess(res, {
        message: "Banners fetched successfully",
        data: items,
        pagination,
      });
    } catch (err) {
      return handleError(res, err, "Unable to fetch banners");
    }
  },

  listBannerImg: async (req, res) => {
    try {
      const { page, limit, search, upload_area, position, device_type } =
        req.query || {};

      const { items, pagination } = await BannerService.listBannerImg({
        page,
        limit,
        search,
        upload_area,
        position,
        device_type,
      });

      return sendSuccess(res, {
        message: "Banners fetched successfully",
        data: items,
        pagination,
      });
    } catch (err) {
      return handleError(res, err, "Unable to fetch banners");
    }
  },

  getBannerById: async (req, res) => {
    try {
      const { id } = req.params || {};

      const data = await BannerService.getBannerById({ banner_id: id });

      return sendSuccess(res, {
        message: "Banner fetched successfully",
        data,
      });
    } catch (err) {
      return handleError(res, err, "Unable to fetch banner");
    }
  },

  updateBanner: async (req, res) => {
    try {
      const { id } = req.params || {};

      const payload = mergeBody(req);

      if (req.file) {
        payload.banner_image = `/uploads/banners/${req.file.filename}`;
      }

      const data = await BannerService.updateBanner({
        ...payload,
        banner_id: id,
      });

      return sendSuccess(res, {
        message: "Banner updated successfully",
        data,
      });
    } catch (err) {
      return handleError(res, err, "Banner update failed");
    }
  },

  toggleBannerStatus: async (req, res) => {
    try {
      const { id } = req.params || {};

      const data = await BannerService.toggleBannerStatus({ banner_id: id });

      return sendSuccess(res, {
        message: `Banner ${
          Number(data.status) === 1 ? "activated" : "deactivated"
        } successfully`,
        data,
      });
    } catch (err) {
      return handleError(res, err, "Unable to toggle banner status");
    }
  },

  deleteBanner: async (req, res) => {
    try {
      const { id } = req.params || {};

      const data = await BannerService.deleteBanner({ banner_id: id });

      return sendSuccess(res, {
        message: "Banner deleted successfully",
        data,
      });
    } catch (err) {
      return handleError(res, err, "Banner deletion failed");
    }
  },
};

export default BannerController;
