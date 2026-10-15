import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env['DB_HOST'] ?? '127.0.0.1',
  port: Number(process.env['DB_PORT'] ?? 5432),
  user: process.env['DB_USER'] ?? 'noite_admin',
  password: process.env['DB_PASSWORD'] ?? 'senha_local_dev',
  database: process.env['DB_NAME'] ?? 'noite_faminta_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env['NODE_ENV'] === 'development' && duration > 100) {
    // Log apenas de performance, sem expor dados sensíveis
    console.warn(`[SLOW QUERY] ${duration}ms: ${text.slice(0, 80)}`);
  }
  return res;
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
