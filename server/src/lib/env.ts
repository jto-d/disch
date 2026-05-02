import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  ADMIN_PASSWORD: required("ADMIN_PASSWORD"),
  COOKIE_SECRET: required("COOKIE_SECRET"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3001),
  isProd: (process.env.NODE_ENV ?? "development") === "production",
};
