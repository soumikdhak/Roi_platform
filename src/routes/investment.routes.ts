import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { craeteInvestment, ShowallLoggedInUserInvestment } from "../controllers/investment.controller.js";

const router = Router();

router.route("/createInvestment").post(verifyJWT,craeteInvestment);
router.route("/getAllInvestments").get(verifyJWT,ShowallLoggedInUserInvestment);

export default router;