import { connectMongoDB } from '../server/src/database/mongo.js';
import app from '../server/src/app.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectMongoDB();
    isConnected = true;
  }
  return app(req, res);
}
