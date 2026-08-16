import { registerUser, loginUser, logout, refreshAccessToken, fetchDirectReferral, fetchReferralTree, dashBoardApiofLoggedinUser, chartApiofLoggedInUser } from "../controllers/user.controller.js"; 
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken);
router.route("/fetchDirectReferral").get(verifyJWT,fetchDirectReferral);
router.route("/fetchReferralTree").get(verifyJWT,fetchReferralTree);
router.route("/dashboard").get(verifyJWT,dashBoardApiofLoggedinUser);
router.route("/chartData").get(verifyJWT,chartApiofLoggedInUser);

export default router;
