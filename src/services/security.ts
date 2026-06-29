import CryptoJS from 'crypto-js';

// Hardcoded keys for mock E2EE & HMAC demonstration
const HMAC_SECRET = 'forex-bot-ai-secure-hmac-secret-key-2026';
const AES_SECRET = 'forex-bot-ai-e2e-encryption-secret-gcm-2026';

export interface SecureRequestHeaders {
  'X-Signature': string;
  'X-Timestamp': string;
  'Content-Type': string;
}

/**
 * Generates HMAC signature and timestamp headers for secure API requests.
 * Prevents MITM tampering and Replay Attacks (30s tolerance).
 */
export function generateSecureHeaders(payload: string | object): SecureRequestHeaders {
  const timestamp = Date.now().toString();
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  
  // Message is combination of timestamp and body to prevent replay attacks
  const message = `${timestamp}:${bodyString}`;
  const signature = CryptoJS.HmacSHA256(message, HMAC_SECRET).toString(CryptoJS.enc.Hex);
  
  return {
    'X-Signature': signature,
    'X-Timestamp': timestamp,
    'Content-Type': 'application/json',
  };
}

/**
 * Encrypts sensitive data (like License Key or Stream URL) using AES.
 * Simulates E2EE payload protection.
 */
export function encryptPayload(payload: object | string): string {
  const plainText = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return CryptoJS.AES.encrypt(plainText, AES_SECRET).toString();
}

/**
 * Decrypts E2EE payload received from the server.
 */
export function decryptPayload(cipherText: string): string {
  const bytes = CryptoJS.AES.decrypt(cipherText, AES_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
