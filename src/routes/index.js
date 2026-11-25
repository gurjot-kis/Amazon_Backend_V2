import express from "express";
import AuthRoutes from "./auth.routes.js";
import UserRoutes from "./user.routes.js";
import AdminRoutes from "./admin.routes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.use(UserRoutes);
router.use(AuthRoutes);
router.use("/admin", AdminRoutes);

export default router;
