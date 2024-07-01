import { type Config } from "drizzle-kit";

import { env } from "~/env";

// export default {
  // schema: "./src/server/db/schema.ts",
  // dbCredentials: {
    // connectionString: env.DATABASE_URL,
  // },
  // dialect: "pg",
  // tablesFilter: ["portfolio-project_*"],
// } satisfies Config;


export default {
  schema: "./src/server/db/schema.ts",
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config