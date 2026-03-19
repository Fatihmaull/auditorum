// lib/crypto.ts
// Client-side encryption utilities

export async function generateSymmetricKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return Buffer.from(exported).toString("base64");
}

export async function importKey(base64Key: string): Promise<CryptoKey> {
  const keyBytes = Buffer.from(base64Key, "base64");
  return await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(file: File, key: CryptoKey): Promise<{ encryptedBlob: Blob; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    fileBuffer
  );

  const encryptedBlob = new Blob([encryptedBuffer]);
  return {
    encryptedBlob,
    iv: Buffer.from(iv).toString("base64"),
  };
}

export async function decryptFile(encryptedBuffer: ArrayBuffer, key: CryptoKey, ivBase64: string): Promise<Blob> {
  const iv = Buffer.from(ivBase64, "base64");
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
}
