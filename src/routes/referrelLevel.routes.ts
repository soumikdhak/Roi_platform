import { Router } from "express";
import { fetchRliHistoryOfLoggedInUser, referrellevelIncome } from "../controllers/referrelLevelIncome.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/genarateRli").post(referrellevelIncome);
router.route("/rlis").get(verifyJWT,fetchRliHistoryOfLoggedInUser);


export default router;