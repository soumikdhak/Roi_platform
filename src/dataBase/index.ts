import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const maxRetries: number = Number(process.env.MAX_RETRIES ?? '3');
const BASE_DELAY: number = 1000;


export const connectDB = async (retryCount: number = 0): Promise<void> => {

  const url: string = process.env.MONGO_URI ?? '';

  if (!url) {
    console.error("MONGO_URI is not set. Aborting connection attempts.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(url);
    console.log(
      `MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.log(`Connection error ${error}`);

    if (retryCount >= maxRetries) {
      console.error("Maximum retry attempts reached.");
      process.exit(1);
    }

    const delay = Math.min(BASE_DELAY * 2 ** retryCount, 30000);

    console.log(
      `Retrying in ${delay / 1000} seconds... (${retryCount + 1}/${maxRetries})`
    );

    setTimeout(() => {
      connectDB(retryCount + 1);
    }, delay);
  }
};