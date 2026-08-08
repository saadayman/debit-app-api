import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

const ALGO = 'aes-256-gcm';

/**
 * Derives a 32-byte key from AI_ENCRYPTION_KEY (falling back to the JWT secret
 * in dev). Set AI_ENCRYPTION_KEY in production so stored provider API keys stay
 * recoverable across restarts and independent of the JWT secret.
 */
function key(): Buffer {
  const secret =
    process.env.AI_ENCRYPTION_KEY ||
    process.env.JWT_ACCESS_SECRET ||
    'dev-insecure-encryption-key';
  return createHash('sha256').update(secret).digest();
}

/** Encrypts a secret to a self-describing `iv:tag:ciphertext` (base64) string. */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    enc.toString('base64'),
  ].join(':');
}

/** Reverses encryptSecret. Throws if the payload was tampered with. */
export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split(':');
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encB64, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}
