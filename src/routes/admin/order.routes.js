import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRoles, ROLES } from "../../middlewares/role.middleware.js";
import { OrderController } from "../../controllers/admin/index.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.SUPER_ADMIN));

router.get("/", OrderController.listOrders);
router.get("/:order_id", OrderController.getOrderById);
router.patch("/:order_id/status", OrderController.updateOrderStatus);

export default router;
