import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use a fallback database URL for development if not provided
const databaseUrl = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock_db';

console.log('Database URL configured:', databaseUrl.replace(/\/\/.*@/, '//***:***@'));

let pool: Pool;
let db: any;

try {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} catch (error) {
  console.warn('Database connection failed, using mock storage:', error);
  // Create a mock database for development
  db = {
    select: () => ({
      from: () => ({
        where: () => [],
        orderBy: () => ({
          limit: () => []
        })
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => [{ id: 1, name: 'mock' }]
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => [{ id: 1, name: 'mock' }]
        })
      })
    }),
    delete: () => ({
      where: () => ({ rowCount: 1 })
    })
  };
}

export { pool, db };