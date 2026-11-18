import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import authorizeRoles, { ROLES } from "../../middlewares/role.middleware.js";
import { WishListController } from "../../controllers/mobile/index.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.USER));

router.get("/", WishListController.getMyWishlist);
router.post("/:productId/toggle", WishListController.toggleWishlist);

export default router;
