import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, withTransaction } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Arquivo de schema não encontrado em: ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  await withTransaction(async (client) => {
    // Tabela de controle de migrações
    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const check = await client.query(
      'SELECT id FROM _schema_migrations WHERE name = $1',
      ['001_initial_schema']
    );

    if (check.rows.length === 0) {
      await client.query(sql);
      await client.query(
        'INSERT INTO _schema_migrations (name) VALUES ($1)',
        ['001_initial_schema']
      );
      console.log('✅ Migração 001_initial_schema aplicada com sucesso!');
    } else {
      console.log('ℹ️ Migração 001_initial_schema já está aplicada.');
    }
  });
}

// Execução direta via CLI se chamado diretamente
if (process.argv[1] === __filename) {
  runMigrations()
    .then(() => {
      console.log('🏁 Migrações finalizadas.');
      return pool.end();
    })
    .catch((err) => {
      console.error('❌ Erro ao executar migrações:', err);
      process.exit(1);
    });
}
