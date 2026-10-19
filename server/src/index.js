import app from './app.js';
import { connectMongoDB } from './database/mongo.js';

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Connect to MongoDB Atlas
await connectMongoDB();

app.listen(PORT, HOST, () => {
  console.log(`\n🍃 Money Man Server (MERN / MongoDB Atlas) is RUNNING!`);
  console.log(`📍 Local:       http://localhost:${PORT}`);
  console.log(`📱 Phone:       http://192.168.1.8:${PORT}`);
  console.log(`👥 All Users:   http://localhost:${PORT}/api/users`);
  console.log(`🔒 Auth:        POST /api/auth/register | POST /api/auth/login\n`);
});
