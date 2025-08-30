import { createClient, RedisClientType } from "redis";
import { env } from "./env";

const redisClient = createClient({
  url: env.REDIS_URL || "redis://localhost:6379",
}) as RedisClientType & {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  get: (key: string) => Promise<string | null>;
};
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

export { redisClient };
