import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authorizeRoles, ROLES } from "../../middlewares/role.middleware.js";
import { StoreController } from "../../controllers/admin/index.js";
import { uploadStoreImages } from "../../middlewares/upload.middleware.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.SUPER_ADMIN));

router
  .route("/")
  .get(StoreController.getStore)
  .post(uploadStoreImages, StoreController.createStore)
  .put(uploadStoreImages, StoreController.updateStore)
  .delete(StoreController.deleteStore);

export default router;
