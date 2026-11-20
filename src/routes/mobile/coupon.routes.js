import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authorizeRoles, ROLES } from "../../middlewares/role.middleware.js";
import { CouponController } from "../../controllers/mobile/index.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.USER));

router.post("/apply", CouponController.applyCoupon);
router.get("/available", CouponController.getAvailableCoupons);

export default router;
