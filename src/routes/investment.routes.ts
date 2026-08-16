import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { craeteInvestment, ShowallLoggedInUserInvestment } from "../controllers/investment.controller.js";

const router = Router();

/**
 * #swagger.tags = ['Investments']
 * #swagger.summary = 'Create an investment'
 * #swagger.description = 'Creates a new investment for the authenticated user.'
 *
 * #swagger.parameters['body'] = {
 *   in: 'body',
 *   required: true,
 *   schema: {
 *     refUserCode: {
 *       type: 'string',
 *       example: '0002'
 *     },
 *     amount: {
 *       type: 'number',
 *       example: 10000
 *     }
 *   }
 * }
 *
 * #swagger.responses[201] = {
 *   description: 'Investment created successfully'
 * }
 *
 * #swagger.responses[400] = {
 *   description: 'Invalid investment data'
 * }
 *
 * #swagger.responses[401] = {
 *   description: 'Unauthorized'
 * }
 */
router.route("/createInvestment").post(
    verifyJWT,
    craeteInvestment
);
router.route("/getAllInvestments").get(verifyJWT,ShowallLoggedInUserInvestment);

export default router;