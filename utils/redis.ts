import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();
// Inisialisasi Redis dengan koneksi ke Upstash
const redisUrl = process.env.UPSTASH_REDIS_URL;
if (!redisUrl) {
  throw new Error('UPSTASH_REDIS_URL is not defined');
}
const redis = new Redis(redisUrl);

redis.ping((err, result) => {
    if (err) {
      console.error('Failed to connect to Redis:', err);
    } else {
      console.log('Connected to Redis:', result); // Harus mengembalikan "PONG"
    }
  });

export default redis;