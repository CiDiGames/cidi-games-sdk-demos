import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export type SignableParams = object;

export function createNonce(): string {
  return randomUUID().replace(/-/g, '').slice(0, 32);
}

export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function buildSignString(params: SignableParams, timestamp: number | string, nonce: string): string {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && String(value) !== '')
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => `${key}=${stringifySignValue(value)}`);

  parts.push(`timestamp=${timestamp}`);
  parts.push(`nonce=${nonce}`);

  return parts.join('&');
}

export function generateSignature(
  params: SignableParams,
  timestamp: number | string,
  nonce: string,
  secret: string
): string {
  const signString = buildSignString(params, timestamp, nonce);

  return createHmac('sha256', secret).update(signString, 'utf8').digest('hex');
}

export function verifySignature(
  params: SignableParams,
  timestamp: number | string,
  nonce: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(params, timestamp, nonce, secret);

  const left = Buffer.from(expected, 'utf8');
  const right = Buffer.from(signature, 'utf8');

  return left.length === right.length && timingSafeEqual(left, right);
}

function stringifySignValue(value: unknown): string {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
