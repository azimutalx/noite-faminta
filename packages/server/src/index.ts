import { buildApp } from './app.js';

const port = Number(process.env['PORT'] ?? 3001);
const host = process.env['HOST'] ?? '0.0.0.0';

const app = buildApp();

async function start(): Promise<void> {
  try {
    await app.listen({ port, host });
    console.log(`🌒 Servidor Noite Faminta operando em http://${host}:${port}`);
    console.log(`🩺 Health check disponível em http://${host}:${port}/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
