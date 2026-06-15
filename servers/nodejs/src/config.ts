import 'dotenv/config';

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readOptionalEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number environment variable: ${name}`);
  }

  return value;
}

export const appConfig = {
  port: readNumberEnv('PORT', 3000),
  cidi: {
    baseUrl: readEnv('CIDI_BASE_URL', 'https://openapi-tst.cidi.games').replace(/\/+$/, ''),
    apiKey: readEnv('CIDI_API_KEY'),
    apiSecret: readEnv('CIDI_API_SECRET'),
    callbackSecret: readOptionalEnv('CIDI_CALLBACK_SECRET')
  }
};
