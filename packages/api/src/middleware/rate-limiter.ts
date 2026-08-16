import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000, // 15 minutes
  limit: (req) => (req.method === "GET" ? 1000 : 100),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10, // stricter limit for auth endpoints — only failed attempts count
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
});
