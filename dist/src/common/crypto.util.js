"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
const node_crypto_1 = require("node:crypto");
const ALGO = 'aes-256-gcm';
function key() {
    const secret = process.env.AI_ENCRYPTION_KEY ||
        process.env.JWT_ACCESS_SECRET ||
        'dev-insecure-encryption-key';
    return (0, node_crypto_1.createHash)('sha256').update(secret).digest();
}
function encryptSecret(plain) {
    const iv = (0, node_crypto_1.randomBytes)(12);
    const cipher = (0, node_crypto_1.createCipheriv)(ALGO, key(), iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [
        iv.toString('base64'),
        tag.toString('base64'),
        enc.toString('base64'),
    ].join(':');
}
function decryptSecret(payload) {
    const [ivB64, tagB64, encB64] = payload.split(':');
    const decipher = (0, node_crypto_1.createDecipheriv)(ALGO, key(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const dec = Buffer.concat([
        decipher.update(Buffer.from(encB64, 'base64')),
        decipher.final(),
    ]);
    return dec.toString('utf8');
}
//# sourceMappingURL=crypto.util.js.map