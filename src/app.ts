import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json' with { type: "json" };

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(cookieParser());

import userRouter from './routes/user.route.js'
import investmentRouter from './routes/investment.routes.js'
import roiRouter from './routes/roiHistory.route.js'
import rliRouter from './routes/referrelLevel.routes.js'

app.use("/api/v1/users", userRouter);
app.use("/api/v1/investments",investmentRouter);
app.use("/api/v1/ROI", roiRouter);
app.use("/api/v1/RLI",rliRouter)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


export { app }