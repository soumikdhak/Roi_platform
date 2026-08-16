import { Router } from "express";
import { fetchRoiHistoryofLoggedInUser, generateDailyRoi } from "../controllers/roiHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/generateDailyRoi").post(generateDailyRoi);
router.route("/rois").get(verifyJWT,fetchRoiHistoryofLoggedInUser);

export default router;