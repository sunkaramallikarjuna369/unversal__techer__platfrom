// Lightweight client-side encryption for sensitive parent communication.
// Uses AES-GCM via the Web Crypto API with a per-session key derived
// from the user's password. Falls back to base64 encoding if the
// crypto API is unavailable — the data is still stored, just obfuscated.

const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(password: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('smart-classroom-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plaintext: string, password: string): Promise<string> {
  try {
    const key = await deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch {
    return btoa(unescape(encodeURIComponent(plaintext)));
  }
}

export async function decryptText(ciphertext: string, password: string): Promise<string> {
  try {
    const key = await deriveKey(password);
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return dec.decode(plaintext);
  } catch {
    try {
      return decodeURIComponent(escape(atob(ciphertext)));
    } catch {
      return ciphertext;
    }
  }
}
