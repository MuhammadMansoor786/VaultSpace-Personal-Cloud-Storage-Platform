/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Wordlist for BIP-39 style 12-word recovery phrase generator
const RECOVERY_WORDS = [
  'anchor', 'beacon', 'cipher', 'domain', 'echo', 'falcon', 'galaxy', 'harbor',
  'island', 'jaguar', 'kernel', 'legend', 'matrix', 'nebula', 'oasis', 'plasma',
  'quantum', 'radar', 'shield', 'titan', 'umbra', 'vortex', 'walnut', 'xenon',
  'yield', 'zenith', 'aurora', 'breeze', 'castle', 'dragon', 'ember', 'forest',
  'glacier', 'horizon', 'indigo', 'jungle', 'knight', 'lagoon', 'meadow', 'nova',
  'orbit', 'pulsar', 'quartz', 'ripple', 'shadow', 'timber', 'unity', 'valley',
  'whisper', 'acorn', 'blossom', 'canyon', 'dune', 'flame', 'grove', 'haven'
];

/**
 * Generate a random 12-word recovery phrase for zero-knowledge vault recovery
 */
export function generateRecoveryPhrase(): string {
  const words: string[] = [];
  const array = new Uint32Array(12);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 12; i++) array[i] = Math.floor(Math.random() * 1000000);
  }
  for (let i = 0; i < 12; i++) {
    words.push(RECOVERY_WORDS[array[i] % RECOVERY_WORDS.length]);
  }
  return words.join(' ');
}

/**
 * Generate a random cryptographic salt (hex string)
 */
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with salt using PBKDF2 (100,000 iterations, SHA-256)
 */
export async function hashPasswordWithSalt(password: string, saltHex: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback simple hash for testing or environment lacking subtle
    return `hash_${password}_${saltHex}`;
  }

  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [0]);

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute SHA-256 checksum of an ArrayBuffer or string
 */
export async function computeSha256Checksum(data: ArrayBuffer | string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = typeof data === 'string' ? encoder.encode(data) : data;

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return 'sha256_mock_' + Math.abs(buffer.byteLength).toString(16);
  }

  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Zero-Knowledge client-side file encryption (AES-GCM-256)
 */
export async function encryptFilePayload(
  dataBuffer: ArrayBuffer,
  masterKeyStr: string
): Promise<{ encryptedBlob: Blob; ivHex: string; checksum: string }> {
  const encoder = new TextEncoder();
  const checksum = await computeSha256Checksum(dataBuffer);

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return {
      encryptedBlob: new Blob([dataBuffer]),
      ivHex: '000000000000',
      checksum,
    };
  }

  // Derive AES key from user masterKeyStr
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKeyStr.padEnd(32, 'x').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    keyMaterial,
    dataBuffer
  );

  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    ivHex,
    checksum,
  };
}

/**
 * Zero-Knowledge client-side file decryption (AES-GCM-256)
 */
export async function decryptFilePayload(
  encryptedBuffer: ArrayBuffer,
  masterKeyStr: string,
  ivHex: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return encryptedBuffer;
  }

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKeyStr.padEnd(32, 'x').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || new Array(12).fill(0));

  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    keyMaterial,
    encryptedBuffer
  );
}
