import type { IUser } from "../../interfaces/IUser.interface.js";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export {};