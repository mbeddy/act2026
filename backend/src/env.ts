import { z } from "zod";

/**
 * Environment variable schema using Zod
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().optional().default("3000"),
  NODE_ENV: z.string().optional(),

  // Admin Authentication
  ADMIN_PASSWORD: z.string().optional().default("admin123"),
  JWT_SECRET: z.string().optional().default("dev-jwt-secret-change-in-production"),

  // Production frontend URL for CORS (e.g. https://myapp.vercel.app)
  FRONTEND_URL: z.string().optional(),

  // SMTP Email Configuration (all optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().default("587"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional().default("noreply@africacoffeeexpo.com"),
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("Environment variables validated successfully");

    // Warn if using default dev secrets
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "admin123") {
      console.warn("[WARN] ADMIN_PASSWORD is using the default dev value. Set it in production.");
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-jwt-secret-change-in-production") {
      console.warn("[WARN] JWT_SECRET is using the default dev value. Set it in production.");
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment variable validation failed:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\nPlease check your .env file and ensure all required variables are set.");
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validated and typed environment variables
 */
export const env = validateEnv();

/**
 * Type of the validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Extend process.env with our environment variables
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line import/namespace
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
