import express from "express";
import { AppContentController } from "../../controllers/mobile/index.js";
import { authorizeRoles, ROLES } from "../../middlewares/role.middleware.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles(ROLES.USER));

router.get("/contact-us", AppContentController.getContactAndTimings);
router.get("/help", AppContentController.getActiveFaqs);

export default router;
