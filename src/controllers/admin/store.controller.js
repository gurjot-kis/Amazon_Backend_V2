import fs from "fs";
import StoreService from "../../services/store.service.js";
import { sendSuccess } from "../../helpers/response.helper.js";

const toUrl = (file) => (file ? `/uploads/stores/${file.filename}` : undefined);

const getImages = (req) => ({
  store_logo: toUrl(req.files?.store_logo?.[0]),
  store_banner: toUrl(req.files?.store_banner?.[0]),
});

const cleanupUploads = (req) => {
  Object.values(req.files || {})
    .flat()
    .forEach((file) => {
      fs.unlink(file.path, () => {});
    });
};

export const StoreController = {
  createStore: async (req, res, next) => {
    try {
      const store = await StoreService.createStore(req.body, getImages(req));

      return sendSuccess(res, {
        code: 201,
        message: "Store created successfully",
        data: store,
      });
    } catch (error) {
      cleanupUploads(req);
      next(error);
    }
  },

  getStore: async (req, res, next) => {
    try {
      const store = await StoreService.getStore();

      return sendSuccess(res, {
        message: "Store fetched successfully",
        data: store,
      });
    } catch (error) {
      next(error);
    }
  },

  updateStore: async (req, res, next) => {
    try {
      const updated = await StoreService.updateStore(req.body, getImages(req));

      return sendSuccess(res, {
        message: "Store updated successfully",
        data: updated,
      });
    } catch (error) {
      cleanupUploads(req);
      next(error);
    }
  },

  deleteStore: async (req, res, next) => {
    try {
      await StoreService.deleteStore();

      return sendSuccess(res, {
        message: "Store deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default StoreController;
