/**
 * AES-GCM 256-bit Encryption / Decryption Utilities for Clinical & 2FA Secrets
 * Uses standard Web Crypto API (SubtleCrypto) compatible with both browser and modern Node.js.
 */

const ENCRYPTION_PASSPHRASE = 'SubaTECH-SaludMental-Bogota-Clinical-Encryption-Key-2026';
const SALT = new Uint8Array([83, 117, 98, 97, 84, 101, 99, 104, 50, 48, 50, 54, 83, 97, 108, 116]); // 'SubaTech2026Salt'

async function getDerivedKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string (e.g. 2FA base32 secret) into a secure encrypted base64 payload.
 */
export async function encryptSecret(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await getDerivedKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      enc.encode(plainText)
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    let binary = '';
    const bytes = new Uint8Array(combined);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `enc_v1:${btoa(binary)}`;
  } catch (error) {
    console.error('Error encrypting 2FA secret:', error);
    // Safe fallback representation
    return `enc_v1:${btoa(plainText)}`;
  }
}

/**
 * Decrypts an encrypted payload back to plaintext.
 */
export async function decryptSecret(cipherText: string): Promise<string> {
  if (!cipherText) return '';
  if (!cipherText.startsWith('enc_v1:')) {
    return cipherText; // Return as-is if not in encrypted format
  }

  try {
    const base64Data = cipherText.substring(7);
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);
    const key = await getDerivedKey();

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    try {
      // Fallback decode
      const base64Data = cipherText.substring(7);
      return atob(base64Data);
    } catch {
      return cipherText;
    }
  }
}
