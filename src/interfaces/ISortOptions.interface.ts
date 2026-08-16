import type { SortOrder } from "mongoose";

export interface ISortOptions {
    [key: string]: SortOrder;
}