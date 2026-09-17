import rateLimit from "express-rate-limit";

export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many reflection requests",
    message: "You have exceeded the rate limit of 30 reflections per 15 minutes. Please take a mindful pause and try again shortly.",
  },
  skip: () => process.env.NODE_ENV === "test", // Skip in unit test runs
});
