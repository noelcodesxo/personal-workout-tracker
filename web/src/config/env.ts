import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url("NEXT_PUBLIC_API_BASE_URL must be a valid URL"),
  NEXT_PUBLIC_USER_ID: z.string().min(1, "NEXT_PUBLIC_USER_ID must be set"),
});

function loadEnv() {
  const result = schema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USER_ID: process.env.NEXT_PUBLIC_USER_ID,
  });

  if (!result.success) {
    const errors = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Environment configuration is invalid:\n${errors}`);
  }

  return result.data;
}

export const env = loadEnv();
