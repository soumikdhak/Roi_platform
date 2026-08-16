import { registerUser, loginUser, logout, refreshAccessToken, fetchDirectReferral, fetchReferralTree, dashBoardApiofLoggedinUser, chartApiofLoggedInUser } from "../controllers/user.controller.js"; 
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * #swagger.tags = ['Users']
 * #swagger.summary = 'Register a new user'
 *
 * #swagger.parameters['body'] = {
 *   in: 'body',
 *   required: true,
 *   schema: {
 *     fullName: {
 *       type: 'string',
 *       example: 'Soumik Dhak'
 *     },
 *     email: {
 *       type: 'string',
 *       format: 'email',
 *       example: 'soumik@gmail.com'
 *     },
 *     mobileNumber: {
 *       type: 'string',
 *       example: '9876543210'
 *     },
 *     password: {
 *       type: 'string',
 *       format: 'password',
 *       example: 'Password@123'
 *     },
 *     referrelCode: {
 *       type: 'string',
 *       example: 'REF0001'
 *     }
 *   }
 * }
 *
 * #swagger.responses[201] = {
 *   description: 'User registered successfully'
 * }
 */
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken);
router.route("/fetchDirectReferral").get(verifyJWT,fetchDirectReferral);
router.route("/fetchReferralTree").get(verifyJWT,fetchReferralTree);
router.route("/dashboard").get(verifyJWT,dashBoardApiofLoggedinUser);
router.route("/chartData").get(verifyJWT,chartApiofLoggedInUser);

export default router;
