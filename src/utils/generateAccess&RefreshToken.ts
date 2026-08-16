import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { IAccesstoken } from '../interfaces/accessToken.interface.js';
import type { IRefreshtoken } from '../interfaces/refreshToken.interface.js';

dotenv.config({ path: './.env' });

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

if (!ACCESS_TOKEN_SECRET || !ACCESS_TOKEN_EXPIRY) {
    throw new Error("Missing ACCESS_TOKEN_SECRET or ACCESS_TOKEN_EXPIRY in environment");
}

if (!REFRESH_TOKEN_SECRET || !REFRESH_TOKEN_EXPIRY) {
    throw new Error("Missing REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRY in environment");
}

const accessTokenSecret: string = ACCESS_TOKEN_SECRET;
const refreshTokenSecret: string = REFRESH_TOKEN_SECRET;


export function generateAccessToken (payload:IAccesstoken) {
    return jwt.sign(
        payload,
        accessTokenSecret,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY as  NonNullable<SignOptions["expiresIn"]>
        }
    )
}

export function generateRefreshToken(payload:IRefreshtoken) {
    return jwt.sign(
        payload,
        refreshTokenSecret,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY as  NonNullable<SignOptions["expiresIn"]>
        }
    )
}